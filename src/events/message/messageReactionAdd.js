const prisma = require('../../database');
const { getGuildSettings } = require('../../utils/helpers');
const { FLAGS_V2 } = require('../../utils/embed');
const config = require('../../../config');
const logger = require('../../utils/logger');

module.exports = {
    name: 'messageReactionAdd',
    async execute(client, reaction, user) {
        if (user.bot) return;

        
        if (reaction.partial) {
            try { await reaction.fetch(); }
            catch (err) { logger.error('Reaksiyon çekilirken hata: ' + err.message, 'EVENT'); return; }
        }
        if (reaction.message.partial) {
            try { await reaction.message.fetch(); }
            catch { return; }
        }

        const { message, emoji } = reaction;
        const guild = message.guild;
        if (!guild) return;

        const emojiStr = emoji.id
            ? `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`
            : emoji.name;

        
        
        
        try {
            const reactionRole = await prisma.reactionRole.findUnique({
                where: { messageId_emoji: { messageId: message.id, emoji: emojiStr } },
            });

            if (reactionRole) {
                const member = await guild.members.fetch(user.id);
                if (member) {
                    await member.roles.add(reactionRole.roleId).catch(err =>
                        logger.warn(`Rol eklenemedi (${reactionRole.roleId}): ${err.message}`, 'REACTION-ROLE'),
                    );
                }
            }
        } catch (err) {
            logger.error('Reaction Role hatası: ' + err.message, 'REACTION-ROLE');
        }

        
        
        
        try {
            const settings = await getGuildSettings(guild.id);
            if (!settings.starboardEnabled || !settings.starboardChannelId) return;

            const starEmoji = settings.starboardEmoji || '⭐';
            const threshold = settings.starboardThreshold || 3;

            
            if (emojiStr !== starEmoji) return;

            
            if (message.channelId === settings.starboardChannelId) return;

            
            if (message.author.id === user.id) return;

            
            const starReaction = message.reactions.cache.get(starEmoji);
            const starCount = starReaction ? starReaction.count : 1;

            if (starCount < threshold) return;

            const starboardChannel = guild.channels.cache.get(settings.starboardChannelId);
            if (!starboardChannel) return;

            
            const existing = await prisma.starboardEntry.findUnique({
                where: { originalMsgId: message.id },
            });

            const starLine = `${starEmoji} **${starCount}** | <#${message.channelId}>`;
            const content = message.content || '';
            const imageUrl = message.attachments.first()?.url;

            const msgContent = [
                starLine,
                '',
                content ? `> ${content.slice(0, 900)}` : '',
                '',
                imageUrl ? `[📎 Ek](${imageUrl})` : '',
                `\n-# 👤 ${message.author.toString()} • [Mesaja git](${message.url})`,
            ].filter(Boolean).join('\n');

            const components = [{
                type: 17,
                accent_color: 0xF1C40F, 
                components: [
                    ...(imageUrl ? [{ type: 9, components: [{ type: 10, content: msgContent }], accessory: { type: 11, media: { url: imageUrl } } }] : [{ type: 10, content: msgContent }]),
                ],
            }];

            if (!existing) {
                
                const sent = await starboardChannel.send({ flags: FLAGS_V2, components });

                await prisma.starboardEntry.create({
                    data: {
                        guildId: guild.id,
                        originalMsgId: message.id,
                        starMsgId: sent.id,
                        channelId: message.channelId,
                        authorId: message.author.id,
                        starCount,
                    },
                });

                logger.info(`Starboard: "${message.author.tag}" mesajı ${starCount} yıldız aldı — ${guild.name}`, 'STARBOARD');
            } else {
                
                if (existing.starCount === starCount) return;

                await prisma.starboardEntry.update({
                    where: { originalMsgId: message.id },
                    data: { starCount },
                });

                try {
                    const starMsg = await starboardChannel.messages.fetch(existing.starMsgId);
                    await starMsg.edit({ flags: FLAGS_V2, components });
                } catch { /* mesaj silinmiş olabilir */ }
            }
        } catch (err) {
            logger.error('Starboard hatası: ' + err.message, 'STARBOARD');
        }
    },
};
