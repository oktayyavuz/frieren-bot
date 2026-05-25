const prisma = require('../../database');
const { getGuildSettings } = require('../../utils/helpers');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../../utils/embed');
const logger = require('../../utils/logger');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(client, member) {
        const settings = await getGuildSettings(member.guild.id);
        const lang = settings.language;

        
        
        
        if (settings.welcomeEnabled && settings.welcomeChannelId) {
            const channel = member.guild.channels.cache.get(settings.welcomeChannelId);
            if (channel) {
                const message = settings.welcomeMessage
                    .replace(/{user}/g, `<@${member.id}>`)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{tag}/g, member.user.tag)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount.toString());

                const embed = createEmbed({
                    color: 0x2ECC71,
                    title: `👋 Hoş Geldin!`,
                    description: message,
                    category: 'utility',
                    thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
                    footer: { text: `${member.guild.name} • Üye #${member.guild.memberCount}` },
                });

                await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] }).catch(() => { });
            }
        }

        
        
        
        if (settings.autoRoles) {
            try {
                const autoRoles = JSON.parse(settings.autoRoles);
                for (const roleId of autoRoles) {
                    const role = member.guild.roles.cache.get(roleId);
                    if (role && role.position < member.guild.members.me.roles.highest.position) {
                        await member.roles.add(role).catch(() => { });
                    }
                }
            } catch (err) {
                logger.error(`Autorole Error in ${member.guild.name}: ${err.message}`, 'AUTOROLE');
            }
        }

        
        
        
        if (settings.antiRaidEnabled) {
            const { checkAntiRaid } = require('../../systems/antiraid');
            await checkAntiRaid(client, member, settings);
        }

        
        
        
        if (settings.loggingEnabled && settings.serverLogChannel) {
            const logChannel = member.guild.channels.cache.get(settings.serverLogChannel);
            if (logChannel) {
                const embed = createEmbed({
                    color: 0x2ECC71,
                    title: '📥 Üye Katıldı',
                    description: `${member.user.tag} (${member.id})`,
                    thumbnail: member.user.displayAvatarURL({ dynamic: true }),
                    fields: [
                        { name: 'Hesap Oluşturulma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                        { name: 'Toplam Üye', value: `${member.guild.memberCount}`, inline: true },
                    ],
                });
                logger.info(`Member Joined: ${member.user.tag} joined ${member.guild.name}`, 'GUILD');
                await logChannel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] }).catch(() => { });
            }
        }
    },
};
