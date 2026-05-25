const prisma = require('../database');

let statsInterval = null;

/**
 * İstatistik kanallarını güncelleme döngüsünü başlat
 */
async function startStatsChannels(client) {
    
    await updateAllStatsChannels(client);

    
    statsInterval = setInterval(() => {
        updateAllStatsChannels(client);
    }, client.config.statsUpdateInterval || 300000);

    console.log('[STATS] İstatistik kanalları güncelleme döngüsü başlatıldı.');
}

/**
 * Tüm sunuculardaki istatistik kanallarını güncelle
 */
async function updateAllStatsChannels(client) {
    const allStats = await prisma.statsChannel.findMany();

    for (const stat of allStats) {
        try {
            const guild = client.guilds.cache.get(stat.guildId);
            if (!guild) continue;

            const channel = guild.channels.cache.get(stat.channelId);
            if (!channel) {
                
                await prisma.statsChannel.delete({ where: { id: stat.id } }).catch(() => { });
                continue;
            }

            let newName;
            switch (stat.type) {
                case 'total_members':
                    newName = `👥 Toplam Üye: ${guild.memberCount}`;
                    break;
                case 'bot_count':
                    
                    await guild.members.fetch().catch(() => {});
                    newName = `🤖 Bot: ${guild.members.cache.filter(m => m.user.bot).size}`;
                    break;
                case 'channel_count':
                    newName = `📁 Kanal: ${guild.channels.cache.size}`;
                    break;
                case 'online_count':
                    
                    await guild.members.fetch({ withPresences: true }).catch(() => {});
                    const onlineCount = guild.members.cache.filter(m => !m.user.bot && m.presence?.status && m.presence.status !== 'offline').size;
                    newName = `🟢 Çevrimiçi: ${onlineCount}`;
                    break;
                default:
                    continue;
            }

            
            if (newName && channel.name !== newName) {
                await channel.setName(newName).catch((e) => { 
                    if (e.code !== 50035) { 
                        console.error(`[STATS-ERR] ${guild.name} (${stat.type}):`, e.message);
                    }
                });
            }
        } catch (err) {
            console.error(`[STATS-ERR] Beklenmedik hata:`, err.message);
        }
    }
}

/**
 * Döngüyü durdur
 */
/**
 * Tek bir istatistik kanalı oluştur
 */
async function createStatChannel(guild, type) {
    let name;
    switch (type) {
        case 'total_members': name = `👥 Toplam Üye: ${guild.memberCount}`; break;
        case 'bot_count': name = `🤖 Bot: ${guild.members.cache.filter(m => m.user.bot).size}`; break;
        case 'channel_count': name = `📁 Kanal: ${guild.channels.cache.size}`; break;
        case 'online_count': name = `🟢 Çevrimiçi: ${guild.members.cache.filter(m => m.presence?.status !== 'offline').size}`; break;
        default: return null;
    }

    try {
        const channel = await guild.channels.create({
            name,
            type: 2, 
            permissionOverwrites: [{ id: guild.id, deny: ['Connect'] }],
        });

        return await prisma.statsChannel.create({
            data: {
                guildId: guild.id,
                channelId: channel.id,
                type
            }
        });
    } catch (e) {
        console.error(`[STATS] Kanal oluşturulamadı (${type}):`, e.message);
        return null;
    }
}

module.exports = { startStatsChannels, updateAllStatsChannels, createStatChannel };
