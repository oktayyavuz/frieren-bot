const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed, createEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const { canModerate } = require('../../../utils/permissions');
const { getGuildSettings } = require('../../../utils/helpers');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setNameLocalizations({ tr: 'at' })
        .setDescription('Kick a user from the server')
        .setDescriptionLocalizations({ tr: 'Kullanıcıyı sunucudan at' })
        .addUserOption(opt => opt.setName('user').setNameLocalizations({ tr: 'kullanıcı' }).setDescription('User to kick').setDescriptionLocalizations({ tr: 'Atılacak kullanıcı' }).setRequired(true))
        .addStringOption(opt => opt.setName('reason').setNameLocalizations({ tr: 'sebep' }).setDescription('Kick reason').setDescriptionLocalizations({ tr: 'Atma sebebi' }))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    cooldown: 5,
    async run(client, interaction, lang) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || client.t(lang, 'general.noReason');

        if (!target) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.userNotFound'))], ephemeral: true });
        if (!canModerate(interaction.guild, interaction.member, target)) {
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.kick.cannotKick'))], ephemeral: true });
        }

        
        try {
            await target.user.send({
                content: `👢 **${interaction.guild.name}** sunucusundan **atıldın**!\n**Sebep:** ${reason}\n**Moderatör:** ${interaction.user.tag}`,
            });
        } catch { /* DM kapalı */ }

        await target.kick(`${interaction.user.tag}: ${reason}`);
        logger.info(`Kick: ${interaction.user.tag} kicked ${target.user.tag} from ${interaction.guild.name}`, 'MOD');
        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.kick.success', { user: target.user.tag, reason }), null, 'moderation')] });

        
        const settings = await getGuildSettings(interaction.guildId);
        if (settings.modLogChannel) {
            const logChannel = interaction.guild.channels.cache.get(settings.modLogChannel);
            if (logChannel) {
                await logChannel.send({ flags: FLAGS_V2, components: [embedToV2(createEmbed({ color: 0xE67E22, title: '👢 Kick', fields: [{ name: 'Kullanıcı', value: target.user.tag, inline: true }, { name: 'Moderatör', value: interaction.user.tag, inline: true }, { name: 'Sebep', value: reason }] }))] });
            }
        }
    },
};
