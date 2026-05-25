const { Collection } = require('discord.js');

/**
 * Komut cooldown kontrolü
 * @param {import('discord.js').Collection} cooldowns - Client.cooldowns
 * @param {string} commandName
 * @param {string} userId
 * @param {number} cooldownMs - Cooldown süresi (ms)
 * @returns {{ onCooldown: boolean, remaining: number }} remaining ms cinsinden
 */
function checkCooldown(cooldowns, commandName, userId, cooldownMs) {
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Collection());
    }

    const timestamps = cooldowns.get(commandName);
    const now = Date.now();

    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownMs;
        if (now < expirationTime) {
            return { onCooldown: true, remaining: expirationTime - now };
        }
    }

    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownMs);

    return { onCooldown: false, remaining: 0 };
}

/**
 * Kalan süreyi okunabilir formata çevir
 */
function formatCooldown(ms) {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds} saniye`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}dk ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}sa ${remainingMinutes}dk`;
}

module.exports = { checkCooldown, formatCooldown };
