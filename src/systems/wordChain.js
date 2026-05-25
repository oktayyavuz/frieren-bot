const prisma = require('../database');

/**
 * Kelime zinciri kontrolü
 */
async function processWordChain(client, message) {
    const chain = await prisma.wordChain.findUnique({
        where: { channelId: message.channel.id },
    });

    if (!chain || !chain.active) return;

    const word = message.content.trim().toLowerCase();

    
    if (word.includes(' ') || word.length < 2) return;

    const settings = await prisma.guildSettings.findUnique({ where: { id: message.guild.id } });
    const lang = settings?.language || 'tr';

    
    if (chain.lastUserId === message.author.id) {
        await message.react('❌').catch(() => { });
        await message.channel.send(client.t(lang, 'systems.wordchain.sameUser')).catch(() => { });
        return;
    }

    
    if (!chain.lastWord) {
        await message.react('✅').catch(() => { });
        const usedWords = [word];
        await prisma.wordChain.update({
            where: { channelId: message.channel.id },
            data: {
                lastWord: word,
                lastUserId: message.author.id,
                usedWords: JSON.stringify(usedWords),
                score: 1,
            },
        });
        return;
    }

    
    const lastLetter = chain.lastWord.slice(-1);
    if (word[0] !== lastLetter) {
        await message.react('❌').catch(() => { });
        await message.channel.send(
            client.t(lang, 'systems.wordchain.wrong', { lastLetter: lastLetter.toUpperCase() })
        ).catch(() => { });
        return;
    }

    
    let usedWords;
    try {
        usedWords = JSON.parse(chain.usedWords || '[]');
    } catch (e) {
        usedWords = [];
    }

    if (usedWords.includes(word)) {
        await message.react('❌').catch(() => { });
        await message.channel.send(client.t(lang, 'systems.wordchain.used')).catch(() => { });
        return;
    }

    
    await message.react('✅').catch(() => { });
    usedWords.push(word);
    await prisma.wordChain.update({
        where: { channelId: message.channel.id },
        data: {
            lastWord: word,
            lastUserId: message.author.id,
            usedWords: JSON.stringify(usedWords),
            score: { increment: 1 },
        },
    });
}

module.exports = { processWordChain };
