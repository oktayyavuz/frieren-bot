const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../../utils/embed');
const { canModerate } = require('../../../utils/permissions');
const ms = require('ms');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setNameLocalizations({ tr: 'sustur' })
        .setDescription('Timeout a user')
        .setDescriptionLocalizations({ tr: 'Kullanıcıyı geçici olarak sustur' })
        .addUserOption(opt => opt.setName('user').setNameLocalizations({ tr: 'kullanıcı' }).setDescription('User to timeout').setDescriptionLocalizations({ tr: 'Susturulacak kullanıcı' }).setRequired(true))
        .addStringOption(opt => opt.setName('duration').setNameLocalizations({ tr: 'süre' }).setDescription('Duration (e.g. 10m, 1h, 1d)').setDescriptionLocalizations({ tr: 'Süre (örn: 10m, 1h, 1d)' }).setRequired(true))
        .addStringOption(opt => opt.setName('reason').setNameLocalizations({ tr: 'sebep' }).setDescription('Timeout reason').setDescriptionLocalizations({ tr: 'Susturma sebebi' }))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 5,
    async run(client, interaction, lang) {
        const target = interaction.options.getMember('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || client.t(lang, 'general.noReason');

        if (!target) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.userNotFound'))], ephemeral: true });
        if (!canModerate(interaction.guild, interaction.member, target)) {
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.timeout.cannotTimeout'))], ephemeral: true });
        }

        const duration = ms(durationStr);
        if (!duration || duration < 5000 || duration > 2419200000) {
            return interaction.reply({ embeds: [errorEmbed('Süre 5 saniye ile 28 gün arasında olmalı!')], ephemeral: true });
        }

        const { formatDuration } = require('../../../utils/helpers');

        
        try {
            await target.user.send({
                content: `🔇 **${interaction.guild.name}** sunucusunda **${formatDuration(duration)}** süreyle susturuldun!\n**Sebep:** ${reason}\n**Moderatör:** ${interaction.user.tag}`,
            });
        } catch { /* DM kapalı */ }

        await target.timeout(duration, `${interaction.user.tag}: ${reason}`);
        logger.info(`Timeout: ${interaction.user.tag} timed out ${target.user.tag} in ${interaction.guild.name} for ${durationStr}`, 'MOD');
        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.timeout.success', { user: target.user.tag, duration: formatDuration(duration), reason }), null, 'moderation')] });
    },
};
