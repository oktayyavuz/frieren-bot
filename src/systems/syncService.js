const prisma = require('../database');
const { createStatChannel } = require('./statsChannels');
const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../utils/embed');

/**
 * Logları veritabanına kaydeder (Dashboard terminali için)
 */
async function logSyncToDb(guildId, module, message, level = 'info') {
    try {
        await prisma.syncLog.create({
            data: { guildId, module, message, level }
        });
    } catch (e) {
        console.error(`[LOG-ERR] Veritabanı loglama hatası:`, e.message);
    }
}

/**
 * Başlangıç ve periyodik senkronizasyonu başlat
 */
async function startSyncService(client) {
    console.log('[SYNC] Senkronizasyon servisi başlatılıyor...');
    
    
    await syncGlobalSettings(client);

    
    await syncAllGuilds(client);

    
    setInterval(() => {
        syncAllGuilds(client);
        syncGlobalSettings(client); 
    }, 15000);

    
    
    setInterval(async () => {
        const requests = await prisma.syncRequest.findMany();
        if (requests.length > 0) {
            for (const req of requests) {
                const guild = client.guilds.cache.get(req.guildId);
                if (guild) {
                    const settings = await prisma.guildSettings.findUnique({ where: { id: guild.id } });
                    if (settings) {
                        console.log(`[SYNC-LIVE] ⚡ ${guild.name} için anlık tetikleme alındı.`);
                        await logSyncToDb(guild.id, 'Sistem', '⚡ Anlık senkronizasyon tetiklendi, işlemler başlıyor...', 'success');
                        await syncGuild(client, guild, settings);
                        await syncGlobalSettings(client); 
                    }
                }
                
                await prisma.syncRequest.delete({ where: { id: req.id } }).catch(() => {});
            }
        }
    }, 2000);

    console.log('[SYNC] Senkronizasyon servisi aktif (15s döngü + 2s anlık tetikleyici).');
}

/**
 * Tüm sunucuları tara ve dashboard ayarlarıyla eşitle
 */
async function syncAllGuilds(client) {
    if (!client.guilds.cache.size) return;

    for (const guild of client.guilds.cache.values()) {
        try {
            const settings = await prisma.guildSettings.findUnique({ where: { id: guild.id } });
            if (!settings) continue;
            await syncGuild(client, guild, settings);
        } catch (err) {
            console.error(`[SYNC] Sunucu tarama hatası (${guild.name}):`, err.message);
        }
    }
}

/**
 * Tek bir sunucuyu senkronize et
 */
async function syncGuild(client, guild, settings) {
    const botMember = guild.members.me;
    const hasPermission = botMember?.permissions.has(PermissionFlagsBits.ManageChannels);

    if (!hasPermission) {
        await logSyncToDb(guild.id, 'Sistem', '❌ Eksik İzin: Botun kanalları yönetme yetkisi yok!', 'error');
        return;
    }

    const syncFunctions = [
        { name: 'İstatistikler', fn: syncStats },
        { name: 'Özel Odalar', fn: syncPrivateRooms },
        { name: 'Hoş Geldin', fn: syncWelcome },
        { name: 'Loglama', fn: syncLogging },
        { name: 'Biletler', fn: syncTickets }
    ];

    for (const item of syncFunctions) {
        try {
            await item.fn(guild, settings);
        } catch (e) {
            await logSyncToDb(guild.id, item.name, `❌ Modül Hatası: ${e.message}`, 'error');
        }
    }
}

/**
 * İstatistik kanallarını eşitle
 */
async function syncStats(guild, settings) {
    const subs = await prisma.statsChannel.findMany({ where: { guildId: guild.id } });
    let actualChannelsExist = true;
    
    if (subs.length > 0) {
        for (const sub of subs) {
            const ch = guild.channels.cache.get(sub.channelId);
            if (!ch || (!ch.name.includes(' Üye') && !ch.name.includes('Bot'))) {
                actualChannelsExist = false;
                break;
            }
        }
    } else {
        actualChannelsExist = false;
    }

    if (settings.statsEnabled) {
        if (!actualChannelsExist) {
            await logSyncToDb(guild.id, 'İstatistikler', '📊 İstatistik kanalları eksik, yeniden oluşturuluyor...');
            
            for (const sub of subs) {
                const ch = guild.channels.cache.get(sub.channelId);
                if (ch) await ch.delete().catch(() => {});
            }
            await prisma.statsChannel.deleteMany({ where: { guildId: guild.id } });
            
            const types = ['total_members', 'bot_count'];
            for (const type of types) {
                await createStatChannel(guild, type);
            }
            await logSyncToDb(guild.id, 'İstatistikler', '✅ İstatistik kanalları başarıyla kuruldu.', 'success');
        }
    } else if (!settings.statsEnabled && subs.length > 0) {
        await logSyncToDb(guild.id, 'İstatistikler', '🗑️ İstatistikler kapatıldı, kanallar temizleniyor...');
        for (const sub of subs) {
            const channel = guild.channels.cache.get(sub.channelId);
            if (channel) await channel.delete().catch(() => {});
        }
        await prisma.statsChannel.deleteMany({ where: { guildId: guild.id } });
        await logSyncToDb(guild.id, 'İstatistikler', '✅ İstatistik sistemi başarıyla kaldırıldı.', 'success');
    }
}

/**
 * Özel oda sistemini eşitle
 */
async function syncPrivateRooms(guild, settings) {
    const needsCleanup = !settings.privateRoomEnabled && (settings.privateRoomChannelId || settings.privateRoomCategoryId);
    if (needsCleanup) {
        await logSyncToDb(guild.id, 'Özel Odalar', '🧹 Özel oda sistemi kapatıldı, temizleniyor...');
        if (settings.privateRoomChannelId) {
            const ch = guild.channels.cache.get(settings.privateRoomChannelId);
            if (ch) await ch.delete().catch(() => {});
        }
        if (settings.privateRoomCategoryId) {
            const cat = guild.channels.cache.get(settings.privateRoomCategoryId);
            if (cat) await cat.delete().catch(() => {});
        }
        await prisma.guildSettings.update({
            where: { id: guild.id },
            data: { privateRoomChannelId: null, privateRoomCategoryId: null }
        });
        await logSyncToDb(guild.id, 'Özel Odalar', '✅ Özel oda kanalları temizlendi.', 'success');
    }
}

/**
 * Hoş Geldin kanalını eşitle
 */
async function syncWelcome(guild, settings) {
    const hasChannel = settings.welcomeChannelId && guild.channels.cache.has(settings.welcomeChannelId);

    if (settings.welcomeEnabled && !hasChannel) {
        await logSyncToDb(guild.id, 'Hoş Geldin', '👋 Hoş geldin kanalı oluşturuluyor...');
        const cat = guild.channels.cache.find(c => c.name === '📢 BİLGİLENDİRME' && c.type === ChannelType.GuildCategory);
        const ch = await guild.channels.create({
            name: '👋・hoş-geldin',
            type: ChannelType.GuildText,
            parent: cat ? cat.id : null
        });
        await prisma.guildSettings.update({
            where: { id: guild.id },
            data: { welcomeChannelId: ch.id }
        });
        await logSyncToDb(guild.id, 'Hoş Geldin', '✅ Hoş geldin sistemi aktif edildi.', 'success');
    } else if (!settings.welcomeEnabled && settings.welcomeChannelId) {
        await logSyncToDb(guild.id, 'Hoş Geldin', '🗑️ Hoş geldin sistemi kapatıldı, kanal siliniyor...');
        const ch = guild.channels.cache.get(settings.welcomeChannelId);
        if (ch) await ch.delete().catch(() => {});
        await prisma.guildSettings.update({
            where: { id: guild.id },
            data: { welcomeChannelId: null }
        });
    }
}

/**
 * Log kanalını eşitle
 */
async function syncLogging(guild, settings) {
    const hasChannel = settings.modLogChannel && guild.channels.cache.has(settings.modLogChannel);

    if (settings.loggingEnabled && !hasChannel) {
        await logSyncToDb(guild.id, 'Loglama', '📋 Mod-log kanalı hazırlanıyor...');
        const cat = guild.channels.cache.find(c => (c.name.includes('YÖNETİM') || c.name.includes('LOG')) && c.type === ChannelType.GuildCategory);
        const ch = await guild.channels.create({
            name: '📋・mod-log',
            type: ChannelType.GuildText,
            parent: cat ? cat.id : null,
            permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }]
        });
        await prisma.guildSettings.update({
            where: { id: guild.id },
            data: { modLogChannel: ch.id }
        });
        await logSyncToDb(guild.id, 'Loglama', '✅ Mod-log kanalı başarıyla bağlandı.', 'success');
    } else if (!settings.loggingEnabled && settings.modLogChannel) {
        await logSyncToDb(guild.id, 'Loglama', '🗑️ Loglama kapatıldı, kanal temizleniyor...');
        const ch = guild.channels.cache.get(settings.modLogChannel);
        if (ch) await ch.delete().catch(() => {});
        await prisma.guildSettings.update({
            where: { id: guild.id },
            data: { modLogChannel: null }
        });
    }
}

/**
 * Ticket (Bilet) sistemini eşitle
 */
async function syncTickets(guild, settings) {
    const cats = await prisma.ticketCategory.findMany({ where: { guildId: guild.id } });
    let actualCategoryExists = false;
    if (cats.length > 0) {
        for (const cat of cats) {
            if (cat.categoryChannelId && guild.channels.cache.has(cat.categoryChannelId)) {
                actualCategoryExists = true;
                break;
            }
        }
    }

    if (settings.ticketEnabled && !actualCategoryExists) {
        await logSyncToDb(guild.id, 'Biletler', '🎫 Bilet sistemi altyapısı kuruluyor...');
        await prisma.ticketCategory.deleteMany({ where: { guildId: guild.id } });

        const category = await guild.channels.create({
            name: '🎫 DESTEK BÖLÜMÜ',
            type: ChannelType.GuildCategory
        });

        const setupChannel = await guild.channels.create({
            name: '🎫・destek-aç',
            type: ChannelType.GuildText,
            parent: category.id
        });

        await prisma.ticketCategory.create({
            data: {
                guildId: guild.id,
                name: 'Genel Destek',
                emoji: '🎫',
                description: 'Genel sorunlarınız için bilet açın.',
                categoryChannelId: category.id
            }
        });

        const embed = createEmbed({
            title: '🎫 Destek Sistemi',
            description: 'Bir sorun mu yaşıyorsun? Aşağıdaki butona basarak yeni bir destek talebi oluşturabilirsin.',
            color: 0x3498DB
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_create_default')
                .setLabel('Destek Talebi Aç')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)
        );

        await setupChannel.send({ flags: FLAGS_V2, components: [embedToV2(embed), row] });
        await logSyncToDb(guild.id, 'Biletler', '✅ Bilet sistemi ve varsayılan panel başarıyla oluşturuldu.', 'success');

    } else if (!settings.ticketEnabled && cats.length > 0) {
        await logSyncToDb(guild.id, 'Biletler', '🗑️ Bilet sistemi kapatıldı, tüm destek kanalları siliniyor...');
        for (const cat of cats) {
            if (cat.categoryChannelId) {
                const discordCat = guild.channels.cache.get(cat.categoryChannelId);
                if (discordCat) {
                    for (const [, ch] of discordCat.children.cache) {
                        await ch.delete().catch(() => {});
                    }
                    await discordCat.delete().catch(() => {});
                }
            }
        }
        await prisma.ticketCategory.deleteMany({ where: { guildId: guild.id } });
        await logSyncToDb(guild.id, 'Biletler', '✅ Bilet sistemi temizlendi.', 'success');
    }
}

/**
 * Global bot ayarlarını senkronize et (Durum, Aktivite vb.)
 */
async function syncGlobalSettings(client) {
    try {
        let botSettings = await prisma.botSettings.findUnique({ where: { id: 'global' } });
        
        
        if (!botSettings) {
            botSettings = await prisma.botSettings.create({
                data: { id: 'global', activityName: '{servers} sunucu | /yardım' }
            });
        }

        
        const activityName = botSettings.activityName
            .replace('{servers}', client.guilds.cache.size)
            .replace('{users}', client.users.cache.size);

        client.user.setPresence({
            activities: [{
                name: activityName,
                type: botSettings.activityType
            }],
            status: botSettings.status
        });

        
        client.maintenanceMode = botSettings.maintenanceMode;

    } catch (e) {
        console.error('[SYNC-GLOBAL] Hata:', e.message);
    }
}

module.exports = { startSyncService, syncGlobalSettings };
