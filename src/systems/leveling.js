const { Collection } = require('discord.js');
const prisma = require('../database');
const config = require('../../config');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../utils/embed');
const { getGuildUser } = require('../utils/helpers');
const logger = require('../utils/logger');


const xpCooldowns = new Collection();


setInterval(() => {
    const now = Date.now();
    const cooldown = config.leveling.xpCooldown;
    xpCooldowns.sweep(timestamp => now - timestamp > cooldown);
}, 3600000);

/**
 * Mesaj XP verme ve seviye kontrolü
 */
async function processLeveling(client, message, settings) {
    const userId = message.author.id;
    const guildId = message.guild.id;

    
    const key = `${guildId}-${userId}`;
    const now = Date.now();
    const cooldown = config.leveling.xpCooldown;

    if (xpCooldowns.has(key) && now - xpCooldowns.get(key) < cooldown) {
        return;
    }
    xpCooldowns.set(key, now);

    
    const xpAmount = Math.floor(
        Math.random() * (config.leveling.xpPerMessage.max - config.leveling.xpPerMessage.min + 1)
    ) + config.leveling.xpPerMessage.min;

    
    await getGuildUser(userId, guildId);

    
    const guildUser = await prisma.guildUser.upsert({
        where: { userId_guildId: { userId, guildId } },
        update: {
            xp: { increment: xpAmount },
            totalMessages: { increment: 1 },
        },
        create: {
            userId,
            guildId,
            xp: xpAmount,
            totalMessages: 1,
        },
    });

    const newXp = guildUser.xp;
    const currentLevel = guildUser.level; 
    const newLevel = calculateLevel(newXp);

    
    await prisma.user.upsert({
        where: { id: userId },
        update: { totalXp: { increment: xpAmount } },
        create: { id: userId, totalXp: xpAmount },
    });

    if (newLevel > currentLevel) {
        await prisma.guildUser.upsert({
            where: { userId_guildId: { userId, guildId } },
            update: { level: newLevel },
            create: { userId, guildId, level: newLevel, xp: xpAmount },
        });
        await handleLevelUp(client, message, settings, newLevel);
    }
}

/**
 * Seviye hesapla
 */
function calculateLevel(xp) {
    let level = 0;
    let requiredXp = config.leveling.levelUpFormula(level);

    while (xp >= requiredXp) {
        xp -= requiredXp;
        level++;
        requiredXp = config.leveling.levelUpFormula(level);
    }

    return level;
}

/**
 * Belirli seviyeye ulaşmak için gereken toplam XP
 */
function xpForLevel(level) {
    let total = 0;
    for (let i = 0; i < level; i++) {
        total += config.leveling.levelUpFormula(i);
    }
    return total;
}

/**
 * Seviye atlama işlemi
 */
async function handleLevelUp(client, message, settings, newLevel) {
    const lang = settings.language;

    
    const levelUpMessage = settings.levelUpMessage
        .replace(/{user}/g, `<@${message.author.id}>`)
        .replace(/{level}/g, newLevel.toString());

    const embed = createEmbed({
        color: config.colors.level,
        description: levelUpMessage,
        category: 'leveling',
    });

    
    const channelId = settings.levelUpChannelId || message.channel.id;
    const channel = message.guild.channels.cache.get(channelId) || message.channel;
    await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] }).catch(() => { });

    
    const reward = await prisma.levelReward.findUnique({
        where: { guildId_level: { guildId: message.guild.id, level: newLevel } },
    });

    if (reward) {
        try {
            const role = message.guild.roles.cache.get(reward.roleId);
            if (role) {
                await message.member.roles.add(role);
            }
        } catch (err) {
            logger.error(`Level Reward Error in ${message.guild.name}: ${err.message}`, 'LEVEL');
        }
    }
}

module.exports = { processLeveling, calculateLevel, xpForLevel };
