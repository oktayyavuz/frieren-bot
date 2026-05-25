const prisma = require('../database');
const { formatDuration } = require('../utils/helpers');

/**
 * AFK kontrolü: Kullanıcı etiketlenmişse veya AFK kullanıcı mesaj yazmışsa
 */
async function processAfkCheck(client, message, lang) {
    
    const afk = await prisma.aFK.findUnique({ where: { userId: message.author.id } });
    if (afk) {
        await prisma.aFK.delete({ where: { userId: message.author.id } });

        const duration = formatDuration(Date.now() - afk.createdAt.getTime());
        const returnMsg = client.t(lang, 'commands.afk.return', {
            user: message.author.username,
            duration,
        });

        const msg = await message.channel.send(returnMsg).catch(() => null);
        if (msg) setTimeout(() => msg.delete().catch(() => { }), 10000);
    }

    
    if (message.mentions.users.size > 0) {
        for (const [userId, user] of message.mentions.users) {
            if (user.bot) continue;

            const mentionedAfk = await prisma.aFK.findUnique({ where: { userId } });
            if (mentionedAfk) {
                const duration = formatDuration(Date.now() - mentionedAfk.createdAt.getTime());
                const afkMsg = client.t(lang, 'commands.afk.mention', {
                    user: user.username,
                    reason: mentionedAfk.reason,
                    duration,
                });

                await message.reply(afkMsg).catch(() => { });
            }
        }
    }
}

module.exports = { processAfkCheck };
