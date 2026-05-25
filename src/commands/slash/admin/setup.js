const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed, createEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');




async function cleanupRoles(guild, roleIds) {
    let deleted = 0;
    for (const id of roleIds) {
        try {
            const role = guild.roles.cache.get(id);
            if (role && role.editable) {
                await role.delete('Setup komutu: yeniden kurulum');
                deleted++;
            }
        } catch (e) { }
    }
    return deleted;
}

async function cleanupChannels(guild, channelIds) {
    let deleted = 0;
    for (const id of channelIds) {
        try {
            const channel = guild.channels.cache.get(id);
            if (channel && channel.deletable) {
                await channel.delete('Setup komutu: yeniden kurulum');
                deleted++;
            }
        } catch (e) { }
    }
    return deleted;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setNameLocalizations({ tr: 'kurulum' })
        .setDescription('Server setup wizard')
        .setDescriptionLocalizations({ tr: 'Sunucu kurulum sihirbazı' })
        .addSubcommand(sub => sub.setName('roles').setNameLocalizations({ tr: 'roller' }).setDescription('Setup roles')
            .setDescriptionLocalizations({ tr: 'Rolleri kur (öncekiler silinir)' }))
        .addSubcommand(sub => sub.setName('channels').setNameLocalizations({ tr: 'kanallar' }).setDescription('Setup channels')
            .setDescriptionLocalizations({ tr: 'Kanalları kur (öncekiler silinir)' }))
        .addSubcommand(sub => sub.setName('private-room').setNameLocalizations({ tr: 'özel-oda' }).setDescription('Setup private rooms')
            .setDescriptionLocalizations({ tr: 'Özel oda sistemini kur' }))
        .addSubcommand(sub => sub.setName('all').setNameLocalizations({ tr: 'hepsi' }).setDescription('Setup everything automatically')
            .setDescriptionLocalizations({ tr: 'Her şeyi otomatik olarak kur (Tam Kurulum)' }))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 60,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });

        
        
        
        if (sub === 'roles') {
            await interaction.deferReply();

            
            let deletedCount = 0;
            const rolesToDelete = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id && r.editable && !r.managed);

            if (rolesToDelete.size > 0) {
                await interaction.editReply({
                    embeds: [createEmbed({
                        title: '⚙️ Rol Kurulumu',
                        description: `🗑️ **${rolesToDelete.size}** eski rol siliniyor...`,
                        color: client.config.colors.warning,
                    })]
                });

                for (const [, role] of rolesToDelete) {
                    try {
                        await role.delete('Setup komutu: tam temizlik');
                        deletedCount++;
                    } catch (e) { }
                }
            }

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '⚙️ Rol Kurulumu',
                    description: deletedCount > 0
                        ? `🗑️ ${deletedCount} eski rol silindi.\n🔄 Yeni roller oluşturuluyor...`
                        : '🔄 Roller oluşturuluyor...',
                    color: client.config.colors.warning,
                })]
            });

            
            const createdRoles = [];
            const newRoleIds = [];

            const allRoles = [
                
                { name: '👑 Sunucu Sahibi', color: '#FFD700', permissions: ['Administrator'], hoist: true },
                { name: '⚔️ Yönetici', color: '#E74C3C', permissions: ['ManageGuild', 'ManageChannels', 'ManageRoles', 'BanMembers', 'KickMembers'], hoist: true },
                { name: '🛡️ Moderatör', color: '#E67E22', permissions: ['ManageMessages', 'ModerateMembers', 'MuteMembers', 'MoveMembers'], hoist: true },
                { name: '🎭 VIP', color: '#9B59B6', permissions: [], hoist: true },
                { name: '👤 Üye', color: '#3498DB', permissions: [], hoist: false },
                
                { name: '🔴 Kırmızı', color: '#E74C3C', permissions: [], hoist: false },
                { name: '🟠 Turuncu', color: '#E67E22', permissions: [], hoist: false },
                { name: '🟡 Sarı', color: '#F1C40F', permissions: [], hoist: false },
                { name: '🟢 Yeşil', color: '#2ECC71', permissions: [], hoist: false },
                { name: '🔵 Mavi', color: '#3498DB', permissions: [], hoist: false },
                { name: '🟣 Mor', color: '#9B59B6', permissions: [], hoist: false },
                { name: '🩷 Pembe', color: '#E91E63', permissions: [], hoist: false },
                { name: '⚪ Beyaz', color: '#FFFFFF', permissions: [], hoist: false },
                
                { name: '♂️ Erkek', color: '#3498DB', permissions: [], hoist: false },
                { name: '♀️ Kadın', color: '#E91E63', permissions: [], hoist: false },
            ];

            for (const roleData of allRoles) {
                try {
                    const role = await interaction.guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        hoist: roleData.hoist,
                        permissions: roleData.permissions,
                        reason: 'Sunucu kurulumu',
                    });
                    createdRoles.push(role.name);
                    newRoleIds.push(role.id);
                } catch (e) {
                    logger.error(`Setup Role Creation Error: ${roleData.name} - ${e.message}`, 'ADMIN');
                }
            }

            
            await prisma.guildSettings.update({
                where: { id: interaction.guildId },
                data: { setupRoles: JSON.stringify(newRoleIds) },
            });

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Rol Kurulumu Tamamlandı!',
                    description: (deletedCount > 0 ? `🗑️ **${deletedCount}** eski rol silindi\n` : '')
                        + `✅ **${createdRoles.length}** yeni rol oluşturuldu:\n${createdRoles.map(r => `• ${r}`).join('\n')}`,
                    color: client.config.colors.success,
                })]
            });
        }

        
        
        
        else if (sub === 'channels') {
            await interaction.deferReply();

            
            let deletedChannels = 0;
            const channelsToDelete = interaction.guild.channels.cache.filter(c => c.deletable);

            if (channelsToDelete.size > 0) {
                await interaction.editReply({
                    embeds: [createEmbed({
                        title: '⚙️ Kanal Kurulumu',
                        description: `🗑️ **${channelsToDelete.size}** kanal/kategori siliniyor...`,
                        color: client.config.colors.warning,
                    })]
                });

                
                
                for (const [, channel] of channelsToDelete) {
                    try {
                        await channel.delete('Setup komutu: tam temizlik');
                        deletedChannels++;
                    } catch (e) { }
                }
            }

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '⚙️ Kanal Kurulumu',
                    description: deletedChannels > 0
                        ? `🗑️ ${deletedChannels} eski kaynak silindi.\n🔄 Yeni kanallar oluşturuluyor...`
                        : '🔄 Kanallar oluşturuluyor...',
                    color: client.config.colors.warning,
                })]
            }).catch(() => { }); 

            
            const newChannelIds = [];
            const newCategoryIds = [];
            const created = [];

            
            const infoCat = await interaction.guild.channels.create({ name: '📢 BİLGİLENDİRME', type: ChannelType.GuildCategory });
            newCategoryIds.push(infoCat.id);
            for (const name of ['📢・duyurular', '📜・kurallar', '🎭・rol-al', '👋・hoş-geldin', '👋・güle-güle']) {
                const ch = await interaction.guild.channels.create({ name, type: ChannelType.GuildText, parent: infoCat.id });
                newChannelIds.push(ch.id);
                created.push(name);
            }

            
            const chatCat = await interaction.guild.channels.create({ name: '💬 SOHBET', type: ChannelType.GuildCategory });
            newCategoryIds.push(chatCat.id);
            for (const name of ['💬・genel-sohbet', '📷・medya', '🤖・bot-komutları', '🎮・oyun-sohbet']) {
                const ch = await interaction.guild.channels.create({ name, type: ChannelType.GuildText, parent: chatCat.id });
                newChannelIds.push(ch.id);
                created.push(name);
            }

            
            const voiceCat = await interaction.guild.channels.create({ name: '🔊 SES KANALLARI', type: ChannelType.GuildCategory });
            newCategoryIds.push(voiceCat.id);
            for (const name of ['🔊 Genel Sohbet', '🎮 Oyun Odası', '🎵 Müzik']) {
                const ch = await interaction.guild.channels.create({ name, type: ChannelType.GuildVoice, parent: voiceCat.id });
                newChannelIds.push(ch.id);
                created.push(name);
            }

            
            const logCat = await interaction.guild.channels.create({ name: '📋 LOG', type: ChannelType.GuildCategory });
            newCategoryIds.push(logCat.id);
            const logChannels = [
                { name: '📋・mod-log', field: 'modLogChannel' },
                { name: '💬・mesaj-log', field: 'messageLogChannel' },
                { name: '🔊・ses-log', field: 'voiceLogChannel' },
                { name: '🏠・sunucu-log', field: 'serverLogChannel' },
            ];

            const logData = {};
            for (const log of logChannels) {
                const ch = await interaction.guild.channels.create({
                    name: log.name,
                    type: ChannelType.GuildText,
                    parent: logCat.id,
                    permissionOverwrites: [{ id: interaction.guild.id, deny: ['ViewChannel'] }],
                });
                newChannelIds.push(ch.id);
                logData[log.field] = ch.id;
                created.push(log.name);
            }

            
            await prisma.guildSettings.update({
                where: { id: interaction.guildId },
                data: {
                    ...logData,
                    loggingEnabled: true,
                    setupChannels: JSON.stringify(newChannelIds),
                    setupCategories: JSON.stringify(newCategoryIds),
                },
            });

            await interaction.editReply({
                embeds: [createEmbed({
                    title: '✅ Kanal Kurulumu Tamamlandı!',
                    description: (deletedChannels > 0 ? `🗑️ **${deletedChannels}** eski kaynak silindi\n` : '')
                        + `✅ **${created.length}** kanal + **${newCategoryIds.length}** kategori oluşturuldu.\nLog kanalları otomatik olarak ayarlandı!`,
                    category: 'admin',
                })]
            }).catch(() => { });
        }

        
        
        
        else if (sub === 'private-room') {
            await interaction.deferReply({ ephemeral: true });

            
            if (settings?.privateRoomChannelId) {
                const oldChannel = interaction.guild.channels.cache.get(settings.privateRoomChannelId);
                if (oldChannel) await oldChannel.delete('Özel oda yeniden kurulumu').catch(() => { });
            }
            if (settings?.privateRoomCategoryId) {
                const oldCat = interaction.guild.channels.cache.get(settings.privateRoomCategoryId);
                if (oldCat) {
                    
                    for (const [, ch] of oldCat.children.cache) {
                        await ch.delete('Özel oda yeniden kurulumu').catch(() => { });
                    }
                    await oldCat.delete('Özel oda yeniden kurulumu').catch(() => { });
                }
            }

            
            const category = await interaction.guild.channels.create({
                name: '🔊 Özel Odalar',
                type: ChannelType.GuildCategory,
            });

            const createChannel = await interaction.guild.channels.create({
                name: '➕ Oda Oluştur',
                type: ChannelType.GuildVoice,
                parent: category.id,
            });

            await prisma.guildSettings.update({
                where: { id: interaction.guildId },
                data: {
                    privateRoomEnabled: true,
                    privateRoomChannelId: createChannel.id,
                    privateRoomCategoryId: category.id,
                },
            });

            await interaction.editReply({
                embeds: [successEmbed(`✅ Özel oda sistemi kuruldu!\n🔊 Kullanıcılar **${createChannel}** kanalına katılarak özel oda oluşturabilir.`, null, 'admin')],
            });
        }
        
        
        
        
        else if (sub === 'all') {
            await interaction.deferReply({ ephemeral: true });
            
            
            const logChannel = await interaction.guild.channels.create({
                name: '_frieren-setup-log',
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] }
                ]
            });

            const log = async (msg) => {
                await logChannel.send(`[${new Date().toLocaleTimeString('tr-TR')}] ${msg}`).catch(() => {});
            };

            await interaction.editReply({ content: `✅ Kurulum başlatıldı! İlerlemeyi ${logChannel} kanalından takip edebilirsin. Bu kanal kurulum bittikten 10 saniye sonra silinecek.` });
            
            await log('🚀 **Frieren Ultra Kurulum Sihirbazı Başlatıldı!**');

            
            await log('🧹 Mevcut kanallar ve roller temizleniyor...');
            const rolesToDelete = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id && r.editable && !r.managed);
            for (const [, role] of rolesToDelete) await role.delete().catch(() => {});
            
            const channelsToDelete = interaction.guild.channels.cache.filter(c => c.deletable && c.id !== logChannel.id);
            for (const [, ch] of channelsToDelete) await ch.delete().catch(() => {});

            
            await log('🎭 Roller oluşturuluyor (30+ rol)...');
            const roleIds = [];
            const roleGroups = [
                
                { name: '👑 Kurucu', color: '#FFD700', permissions: [PermissionFlagsBits.Administrator], hoist: true },
                { name: '⚔️ Yönetici', color: '#E74C3C', permissions: [PermissionFlagsBits.Administrator], hoist: true },
                { name: '🛡️ Moderatör', color: '#E67E22', permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers], hoist: true },
                { name: '🔧 Destek Ekibi', color: '#3498DB', permissions: [PermissionFlagsBits.ManageMessages], hoist: true },
                
                { name: '💎 VIP', color: '#F1C40F', hoist: true },
                { name: '🚀 Server Booster', color: '#F47FFF', managed: true }, 
                { name: '👤 Üye', color: '#95A5A6', hoist: false },
                
                { name: '🏆 Üstat (Level 50+)', color: '#FF0000', hoist: false },
                { name: '🎖️ Kıdemli (Level 25+)', color: '#FF5733', hoist: false },
                { name: '🏅 Aktif (Level 10+)', color: '#FFBD33', hoist: false },
                
                { name: '🔴 Kırmızı', color: '#FF0000' }, { name: '🔵 Mavi', color: '#0000FF' },
                { name: '🟢 Yeşil', color: '#00FF00' }, { name: '🟡 Sarı', color: '#FFFF00' },
                { name: '🟣 Mor', color: '#8A2BE2' }, { name: '🟠 Turuncu', color: '#FFA500' },
                { name: '🔘 Gri', color: '#808080' }, { name: '⚪ Beyaz', color: '#FFFFFF' },
                { name: '🫧 Turkuaz', color: '#40E0D0' }, { name: '🌸 Pembe', color: '#FFB6C1' },
                
                { name: '♂️ Erkek', color: '#3498DB' }, { name: '♀️ Kadın', color: '#E91E63' }
            ];

            for (const rData of roleGroups) {
                const role = await interaction.guild.roles.create({ ...rData, reason: 'Frieren Kurulum' }).catch(() => null);
                if (role) roleIds.push(role.id);
            }
            await log(`✅ ${roleIds.length} adet rol başarıyla oluşturuldu.`);

            
            await log('📁 Kategoriler ve kanallar inşa ediliyor...');
            
            
            const infoCat = await interaction.guild.channels.create({ name: '📢 BİLGİLENDİRME', type: ChannelType.GuildCategory });
            const rulesCh = await interaction.guild.channels.create({ name: '📜・kurallar', type: ChannelType.GuildText, parent: infoCat.id });
            const announceCh = await interaction.guild.channels.create({ name: '📢・duyurular', type: ChannelType.GuildText, parent: infoCat.id });
            const welcomeCh = await interaction.guild.channels.create({ name: '👋・hoş-geldin', type: ChannelType.GuildText, parent: infoCat.id });
            
            
            const chatCat = await interaction.guild.channels.create({ name: '💬 TOPLULUK', type: ChannelType.GuildCategory });
            await interaction.guild.channels.create({ name: '💬・genel-sohbet', type: ChannelType.GuildText, parent: chatCat.id });
            await interaction.guild.channels.create({ name: '📷・medya-paylaşım', type: ChannelType.GuildText, parent: chatCat.id });
            await interaction.guild.channels.create({ name: '🤖・bot-komut', type: ChannelType.GuildText, parent: chatCat.id });
            
            
            const gameCat = await interaction.guild.channels.create({ name: '🎮 OYUN ALANI', type: ChannelType.GuildCategory });
            await interaction.guild.channels.create({ name: '🎮・oyun-sohbet', type: ChannelType.GuildText, parent: gameCat.id });
            await interaction.guild.channels.create({ name: '🔢・sayı-sayma', type: ChannelType.GuildText, parent: gameCat.id });
            await interaction.guild.channels.create({ name: '🔤・kelime-zinciri', type: ChannelType.GuildText, parent: gameCat.id });

            
            const voiceCat = await interaction.guild.channels.create({ name: '🔊 SES KANALLARI', type: ChannelType.GuildCategory });
            await interaction.guild.channels.create({ name: '🔊 Genel Sohbet', type: ChannelType.GuildVoice, parent: voiceCat.id });
            await interaction.guild.channels.create({ name: '🔊 Oyun Odası', type: ChannelType.GuildVoice, parent: voiceCat.id });
            await interaction.guild.channels.create({ name: '🔊 Müzik Odası', type: ChannelType.GuildVoice, parent: voiceCat.id });
            await interaction.guild.channels.create({ name: '💤 AFK / Uyku', type: ChannelType.GuildVoice, parent: voiceCat.id });

            
            const adminCat = await interaction.guild.channels.create({ name: '🛡️ YÖNETİM', type: ChannelType.GuildCategory });
            const modLog = await interaction.guild.channels.create({
                name: '📋・mod-log',
                type: ChannelType.GuildText,
                parent: adminCat.id,
                permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }]
            });
            await interaction.guild.channels.create({
                name: '🔒・yetkili-sohbet',
                type: ChannelType.GuildText,
                parent: adminCat.id,
                permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }]
            });

            
            const privCat = await interaction.guild.channels.create({ name: '🔊 ÖZEL ODALAR', type: ChannelType.GuildCategory });
            const privCh = await interaction.guild.channels.create({ name: '➕ Oda Oluştur', type: ChannelType.GuildVoice, parent: privCat.id });

            await log('✅ Kanal yapısı tamamlandı.');

            
            await log('💾 Veriler veritabanına ve Dashboard\'a işleniyor...');
            await prisma.guildSettings.upsert({
                where: { id: interaction.guildId },
                update: {
                    setupRoles: JSON.stringify(roleIds),
                    welcomeChannelId: welcomeCh.id,
                    modLogChannel: modLog.id,
                    loggingEnabled: true,
                    privateRoomEnabled: true,
                    privateRoomChannelId: privCh.id,
                    privateRoomCategoryId: privCat.id,
                },
                create: {
                    id: interaction.guildId,
                    setupRoles: JSON.stringify(roleIds),
                    welcomeChannelId: welcomeCh.id,
                    modLogChannel: modLog.id,
                    loggingEnabled: true,
                    privateRoomEnabled: true,
                    privateRoomChannelId: privCh.id,
                    privateRoomCategoryId: privCat.id,
                }
            });

            logger.info(`Full Setup: ${interaction.user.tag} completed full server setup in ${interaction.guild.name}`, 'ADMIN');
            await log('✨ **Tebrikler! Sunucu kurulumu başarıyla tamamlandı.**');
            await log('👋 Bu kanal 10 saniye sonra silinecek. Dashboard üzerinden ayarlarını yapmayı unutma!');

            
            setTimeout(() => {
                logChannel.delete().catch(() => {});
            }, 10000);
        }
    },
};
