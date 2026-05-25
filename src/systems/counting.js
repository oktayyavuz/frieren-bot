const prisma = require('../database');

/**
 * Sayı sayma kontrolü
 */
async function processCounting(client, message) {
    
    const counting = await prisma.counting.findUnique({
        where: { channelId: message.channel.id },
    });

    if (!counting || !counting.active) return;

    const num = parseInt(message.content.trim());
    if (isNaN(num)) return; 

    const settings = await prisma.guildSettings.findUnique({ where: { id: message.guild.id } });
    const lang = settings?.language || 'tr';

    
    if (counting.lastUserId === message.author.id) {
        await message.react('❌').catch(() => { });
        await message.channel.send(client.t(lang, 'systems.counting.sameUser')).catch(() => { });
        await prisma.counting.update({
            where: { channelId: message.channel.id },
            data: {
                currentNumber: 0,
                lastUserId: '',
                highScore: Math.max(counting.highScore, counting.currentNumber),
            },
        });
        return;
    }

    
    if (num !== counting.currentNumber + 1) {
        await message.react('❌').catch(() => { });
        await message.channel.send(client.t(lang, 'systems.counting.wrong')).catch(() => { });
        await prisma.counting.update({
            where: { channelId: message.channel.id },
            data: {
                currentNumber: 0,
                lastUserId: '',
                highScore: Math.max(counting.highScore, counting.currentNumber),
            },
        });
        return;
    }

    
    await message.react('✅').catch(() => { });
    await prisma.counting.update({
        where: { channelId: message.channel.id },
        data: {
            currentNumber: num,
            lastUserId: message.author.id,
        },
    });
}

module.exports = { processCounting };
