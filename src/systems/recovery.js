const prisma = require('../database');
const { startGiveawayTimers } = require('./giveaway');
const { startStatsChannels } = require('./statsChannels');
const { startSyncService } = require('./syncService');

/**
 * Bot başlatıldığında tüm persist eden sistemleri veritabanından yükle
 */
async function startRecovery(client) {
    console.log('[RECOVERY] Sistemler yükleniyor...');

    
    try {
        await startGiveawayTimers(client);
    } catch (err) {
        console.error('[RECOVERY] Giveaway yükleme hatası:', err.message);
    }

    
    try {
        await startStatsChannels(client);
    } catch (err) {
        console.error('[RECOVERY] Stats kanalları yükleme hatası:', err.message);
    }

    
    try {
        await checkReminders(client);
        
        setInterval(() => checkReminders(client), 30000);
    } catch (err) {
        console.error('[RECOVERY] Reminder yükleme hatası:', err.message);
    }

    
    try {
        await cleanupPrivateRooms(client);
    } catch (err) {
        console.error('[RECOVERY] Private room temizleme hatası:', err.message);
    }

    
    try {
        await startSyncService(client);
    } catch (err) {
        console.error('[RECOVERY] Sync servisi başlatma hatası:', err.message);
    }

    console.log('[RECOVERY] ✅ Tüm sistemler yüklendi!');
}

/**
 * Süresi geçmiş reminder'ları bildir
 */
async function checkReminders(client) {
    const now = new Date();
    const dueReminders = await prisma.reminder.findMany({
        where: {
            completed: false,
            remindAt: { lte: now },
        },
    });

    for (const reminder of dueReminders) {
        try {
            
            let channel;
            if (reminder.guildId) {
                const guild = client.guilds.cache.get(reminder.guildId);
                if (guild) {
                    channel = guild.channels.cache.get(reminder.channelId);
                }
            }

            if (channel) {
                await channel.send({
                    content: `⏰ <@${reminder.userId}> Hatırlatıcı: **${reminder.message}**`,
                }).catch(() => { });
            } else {
                
                try {
                    const user = await client.users.fetch(reminder.userId);
                    await user.send({ content: `⏰ Hatırlatıcı: **${reminder.message}**` });
                } catch (e) { }
            }

            
            await prisma.reminder.update({
                where: { id: reminder.id },
                data: { completed: true },
            });
        } catch (err) {
            
        }
    }
}

/**
 * Discord'da olmayan özel oda kayıtlarını temizle
 */
async function cleanupPrivateRooms(client) {
    const rooms = await prisma.privateRoom.findMany();
    let cleaned = 0;

    for (const room of rooms) {
        const guild = client.guilds.cache.get(room.guildId);
        if (!guild) {
            await prisma.privateRoom.delete({ where: { id: room.id } }).catch(() => { });
            cleaned++;
            continue;
        }

        const channel = guild.channels.cache.get(room.channelId);
        if (!channel) {
            await prisma.privateRoom.delete({ where: { id: room.id } }).catch(() => { });
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`[RECOVERY] ${cleaned} orphan private room kaydı temizlendi.`);
    }
}

module.exports = { startRecovery };
