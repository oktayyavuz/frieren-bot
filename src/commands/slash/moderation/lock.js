const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, createEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setNameLocalizations({ tr: 'kilitle' })
        .setDescription('Lock or unlock a channel')
        .setDescriptionLocalizations({ tr: 'Kanalı kilitle veya aç' })
        .addSubcommand(sub => sub.setName('on').setDescription('Lock the channel'))
        .addSubcommand(sub => sub.setName('off').setDescription('Unlock the channel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();
        const channel = interaction.channel;

        if (sub === 'on') {
            await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
            logger.info(`Lock: ${interaction.user.tag} locked ${channel.name} in ${interaction.guild.name}`, 'MOD');
            await interaction.reply({ embeds: [successEmbed(`🔒 ${channel} kanalı kilitlendi!`, null, 'moderation')] });
        } else {
            await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
            logger.info(`Lock: ${interaction.user.tag} unlocked ${channel.name} in ${interaction.guild.name}`, 'MOD');
            await interaction.reply({ embeds: [successEmbed(`🔓 ${channel} kanalının kilidi açıldı!`, null, 'moderation')] });
        }
    },
};
