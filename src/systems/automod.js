const { Collection } = require('discord.js');
const config = require('../../config');


const defaultSwearWords = [
    'amk', 'aq', 'orospu', 'piç', 'siktir', 'ananı', 'sikerim',
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy',
];

/**
 * Oto-moderasyon kontrolü
 * @returns {boolean} true = mesaj engellendi
 */
async function processAutomod(client, message, settings) {
    
    try {
        const whitelistRoles = JSON.parse(settings.automodWhitelistRoles || '[]');
        if (whitelistRoles.some(roleId => message.member.roles.cache.has(roleId))) {
            return false;
        }
    } catch (e) { }

    
    if (message.author.bot || message.member.permissions.has('Administrator')) return false;

    
    
    
    if (settings.antiSwearEnabled) {
        let swearWords = defaultSwearWords;
        try {
            const customWords = JSON.parse(settings.antiSwearWords || '[]');
            if (customWords.length > 0) {
                swearWords = [...defaultSwearWords, ...customWords];
            }
        } catch (e) { }

        const content = message.content.toLowerCase().replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '');
        const found = swearWords.some(word => content.includes(word.toLowerCase()));

        if (found) {
            await message.delete().catch(() => { });
            const lang = settings.language;
            const warning = client.t(lang, 'systems.automod.swearBlocked', {
                user: `<@${message.author.id}>`,
            });
            const warnMsg = await message.channel.send(warning).catch(() => null);
            if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => { }), 5000);
            return true;
        }
    }

    
    
    
    if (settings.antiSpamEnabled) {
        const key = `${message.guild.id}-${message.author.id}`;
        if (!client.antiSpamMap.has(key)) {
            client.antiSpamMap.set(key, []);
        }

        const timestamps = client.antiSpamMap.get(key);
        const now = Date.now();
        const interval = settings.antiSpamInterval || config.moderation.defaultSpamInterval;
        const limit = settings.antiSpamLimit || config.moderation.defaultSpamLimit;

        
        const filtered = timestamps.filter(t => now - t < interval);
        filtered.push(now);
        client.antiSpamMap.set(key, filtered);

        if (filtered.length > limit) {
            
            try {
                const messages = await message.channel.messages.fetch({ limit: limit });
                const userMessages = messages.filter(m => m.author.id === message.author.id);
                await message.channel.bulkDelete(userMessages).catch(() => { });
            } catch (e) { }

            const lang = settings.language;
            const warning = client.t(lang, 'systems.automod.spamBlocked', {
                user: `<@${message.author.id}>`,
            });
            const warnMsg = await message.channel.send(warning).catch(() => null);
            if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => { }), 5000);

            
            client.antiSpamMap.set(key, []);
            return true;
        }
    }

    
    
    
    if (settings.antiCapsEnabled) {
        const minLength = settings.antiCapsMinLength || config.moderation.defaultCapsMinLength;
        const maxPercent = settings.antiCapsPercent || config.moderation.defaultCapsPercent;

        if (message.content.length >= minLength) {
            const upperCount = (message.content.match(/[A-ZĞÜŞİÖÇ]/g) || []).length;
            const letterCount = (message.content.match(/[a-zA-ZğüşıöçĞÜŞİÖÇ]/g) || []).length;

            if (letterCount > 0 && (upperCount / letterCount) * 100 >= maxPercent) {
                await message.delete().catch(() => { });
                const lang = settings.language;
                const warning = client.t(lang, 'systems.automod.capsBlocked', {
                    user: `<@${message.author.id}>`,
                });
                const warnMsg = await message.channel.send(warning).catch(() => null);
                if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => { }), 5000);
                return true;
            }
        }
    }

    
    
    
    if (settings.antiLinkEnabled) {
        const urlRegex = /(https?:\/\/[^\s]+)|(discord\.(gg|com\/invite)\/[^\s]+)/gi;
        if (urlRegex.test(message.content)) {
            
            let allowed = false;
            try {
                const whitelist = JSON.parse(settings.antiLinkWhitelist || '[]');
                if (whitelist.length > 0) {
                    const urls = message.content.match(urlRegex);
                    allowed = urls?.every(url => whitelist.some(domain => url.includes(domain))) || false;
                }
            } catch (e) { }

            if (!allowed) {
                await message.delete().catch(() => { });
                const lang = settings.language;
                const warning = client.t(lang, 'systems.automod.linkBlocked', {
                    user: `<@${message.author.id}>`,
                });
                const warnMsg = await message.channel.send(warning).catch(() => null);
                if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => { }), 5000);
                return true;
            }
        }
    }

    return false;
}

module.exports = { processAutomod };
