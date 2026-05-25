const prisma = require('../database');
const config = require('../../config');

/**
 * Sunucu ayarlarını getir (yoksa oluştur)
 */
async function getGuildSettings(guildId) {
    let settings = await prisma.guildSettings.findUnique({ where: { id: guildId } });
    if (!settings) {
        settings = await prisma.guildSettings.create({
            data: {
                id: guildId,
                language: config.defaultLanguage,
                prefix: config.defaultPrefix,
            },
        });
    }
    return settings;
}

/**
 * Kullanıcı kaydını getir (yoksa oluştur)
 */
async function getUser(userId) {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        user = await prisma.user.create({ data: { id: userId } });
    }
    return user;
}

/**
 * Sunucu-Kullanıcı kaydını getir (yoksa oluştur)
 */
async function getGuildUser(userId, guildId) {
    await getUser(userId); 
    let guildUser = await prisma.guildUser.findUnique({
        where: { userId_guildId: { userId, guildId } },
    });
    if (!guildUser) {
        
        await getGuildSettings(guildId);
        guildUser = await prisma.guildUser.create({
            data: { userId, guildId },
        });
    }
    return guildUser;
}

/**
 * Süreyi okunabilir formata çevir
 */
function formatDuration(ms) {
    if (ms < 0) return '0 saniye';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün ${hours % 24} saat`;
    if (hours > 0) return `${hours} saat ${minutes % 60} dakika`;
    if (minutes > 0) return `${minutes} dakika ${seconds % 60} saniye`;
    return `${seconds} saniye`;
}

/**
 * Sayıyı formatlı göster (1000 -> 1.000)
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Rastgele sayı (min-max arası, dahil)
 */
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Zaman damgasını Discord formatına çevir
 */
function discordTimestamp(date, format = 'R') {
    const timestamp = Math.floor(date.getTime() / 1000);
    return `<t:${timestamp}:${format}>`;
}

/**
 * Progress bar oluştur
 */
function progressBar(current, max, length = 10) {
    const filled = Math.round((current / max) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

module.exports = {
    getGuildSettings,
    getUser,
    getGuildUser,
    formatDuration,
    formatNumber,
    random,
    discordTimestamp,
    progressBar,
};
