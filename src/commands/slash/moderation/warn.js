const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const { getGuildSettings } = require('../../../utils/helpers');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setNameLocalizations({ tr: 'uyar' })
        .setDescription('Warn a user')
        .setDescriptionLocalizations({ tr: 'Kullanıcıyı uyar' })
        .addUserOption(opt => opt.setName('user').setNameLocalizations({ tr: 'kullanıcı' }).setDescription('User to warn').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setNameLocalizations({ tr: 'sebep' }).setDescription('Warn reason'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 3,
    async run(client, interaction, lang) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || client.t(lang, 'general.noReason');

        if (!target) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.userNotFound'))], ephemeral: true });

        await prisma.warning.create({
            data: { userId: target.id, guildId: interaction.guildId, moderatorId: interaction.user.id, reason },
        });

        const count = await prisma.warning.count({ where: { userId: target.id, guildId: interaction.guildId } });

        
        try {
            await target.send({
                content: `⚠️ **${interaction.guild.name}** sunucusunda **${count}. uyarı**nı aldın!\n**Sebep:** ${reason}\n**Yetkili:** ${interaction.user.tag}`,
            });
        } catch { /* DM kapalı olabilir, sessizce geç */ }

        logger.info(`Warn: ${interaction.user.tag} warned ${target.tag} in ${interaction.guild.name}. Reason: ${reason}`, 'MOD');
        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.warn.success', { user: target.tag, reason, count }), null, 'moderation')] });
    },
};
