const prisma = require('../../database');
const logger = require('../../utils/logger');

module.exports = {
    name: 'messageReactionRemove',
    async execute(client, reaction, user) {
        
        if (user.bot) return;

        
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                logger.error('Reaksiyon çekilirken hata oluştu: ' + error.message, 'EVENT');
                return;
            }
        }

        const { message, emoji } = reaction;
        const guild = message.guild;

        if (!guild) return;

        
        try {
            const emojiStr = emoji.id 
                ? `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>` 
                : emoji.name;

            const reactionRole = await prisma.reactionRole.findUnique({
                where: {
                    messageId_emoji: {
                        messageId: message.id,
                        emoji: emojiStr
                    }
                }
            });

            if (reactionRole) {
                const member = await guild.members.fetch(user.id);
                if (member) {
                    await member.roles.remove(reactionRole.roleId).catch(err => {
                        logger.warn(`Rol kaldırılamadı (${reactionRole.roleId}): ${err.message}`, 'REACTION-ROLE');
                    });
                }
            }
        } catch (error) {
            logger.error('Reaction Role kaldırma hatası: ' + error.message, 'REACTION-ROLE');
        }
    },
};
