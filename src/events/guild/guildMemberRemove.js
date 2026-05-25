const { getGuildSettings } = require('../../utils/helpers');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../../utils/embed');
const logger = require('../../utils/logger');

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(client, member) {
        const settings = await getGuildSettings(member.guild.id);

        
        
        
        if (settings.welcomeEnabled && settings.goodbyeChannelId) {
            const channel = member.guild.channels.cache.get(settings.goodbyeChannelId);
            if (channel) {
                const message = settings.goodbyeMessage
                    .replace(/{user}/g, member.user.tag)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{tag}/g, member.user.tag)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount.toString());

                const embed = createEmbed({
                    color: 0xE74C3C,
                    title: `👋 Güle Güle!`,
                    description: message,
                    category: 'utility',
                    thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
                    footer: { text: `${member.guild.name} • Kalan Üye: ${member.guild.memberCount}` },
                });

                await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] }).catch(() => { });
            }
        }

        
        
        
        if (settings.loggingEnabled && settings.serverLogChannel) {
            const logChannel = member.guild.channels.cache.get(settings.serverLogChannel);
            if (logChannel) {
                const embed = createEmbed({
                    color: 0xE74C3C,
                    title: '📤 Üye Ayrıldı',
                    description: `${member.user.tag} (${member.id})`,
                    thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                    fields: [
                        { name: 'Katılma Tarihi', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Bilinmiyor', inline: true },
                        { name: 'Kalan Üye', value: `${member.guild.memberCount}`, inline: true },
                    ],
                });
                logger.info(`Member Left: ${member.user.tag} left ${member.guild.name}`, 'GUILD');
                await logChannel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] }).catch(() => { });
            }
        }
    },
};
