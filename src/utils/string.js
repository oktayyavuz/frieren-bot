/**
 * Discord API uyumlu string temizleme yardımcıları
 */

/**
 * Emoji isimlerini Discord kurallarına göre temizler
 * Sadece alfanumerik karakterler ve alt çizgiye izin verir
 */
function sanitizeEmojiName(name) {
    if (!name) return 'emoji';
    return name
        .replace(/\s+/g, '_') 
        .replace(/[^a-zA-Z0-9_]/g, '') 
        .substring(0, 32); 
}

/**
 * Kanal isimlerini temizler (küçük harf, tireli)
 */
function sanitizeChannelName(name) {
    if (!name) return 'channel';
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 100);
}

module.exports = {
    sanitizeEmojiName,
    sanitizeChannelName
};
