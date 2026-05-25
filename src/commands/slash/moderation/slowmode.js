const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setNameLocalizations({ tr: 'yavaşmod' })
        .setDescription('Set channel slowmode')
        .setDescriptionLocalizations({ tr: 'Kanal yavaş modunu ayarla' })
        .addIntegerOption(opt => opt.setName('seconds').setNameLocalizations({ tr: 'saniye' }).setDescription('Slowmode in seconds (0 = off)').setRequired(true).setMinValue(0).setMaxValue(21600))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 5,
    async run(client, interaction, lang) {
        const seconds = interaction.options.getInteger('seconds');
        await interaction.channel.setRateLimitPerUser(seconds);

        if (seconds === 0) {
            logger.info(`Slowmode: ${interaction.user.tag} disabled slowmode in ${interaction.channel.name} (${interaction.guild.name})`, 'MOD');
            await interaction.reply({ embeds: [successEmbed('✅ Yavaş mod kapatıldı!', null, 'moderation')] });
        } else {
            logger.info(`Slowmode: ${interaction.user.tag} set slowmode to ${seconds}s in ${interaction.channel.name} (${interaction.guild.name})`, 'MOD');
            await interaction.reply({ embeds: [successEmbed(`✅ Yavaş mod **${seconds} saniye** olarak ayarlandı!`, null, 'moderation')] });
        }
    },
};
