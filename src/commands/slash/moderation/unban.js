const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setNameLocalizations({ tr: 'yasakkaldır' })
        .setDescription('Unban a user')
        .setDescriptionLocalizations({ tr: 'Kullanıcının yasağını kaldır' })
        .addStringOption(opt => opt.setName('user-id').setDescription('User ID').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    cooldown: 5,
    async run(client, interaction, lang) {
        const userId = interaction.options.getString('user-id');

        try {
            await interaction.guild.members.unban(userId);
            logger.info(`Unban: ${interaction.user.tag} unbanned ID ${userId} in ${interaction.guild.name}`, 'MOD');
            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.unban.success', { user: userId }), null, 'moderation')] });
        } catch (err) {
            await interaction.reply({ embeds: [errorEmbed('Kullanıcı bulunamadı veya yasaklı değil!')], ephemeral: true });
        }
    },
};
