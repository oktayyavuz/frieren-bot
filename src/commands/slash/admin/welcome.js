const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setNameLocalizations({ tr: 'hoşgeldin' })
        .setDescription('Configure welcome/goodbye messages')
        .setDescriptionLocalizations({ tr: 'Hoş geldin/güle güle mesajlarını ayarla' })
        .addSubcommand(sub => sub.setName('channel').setDescription('Set welcome channel')
            .addChannelOption(opt => opt.setName('channel').setDescription('Welcome channel').setRequired(true)))
        .addSubcommand(sub => sub.setName('goodbye-channel').setDescription('Set goodbye channel')
            .addChannelOption(opt => opt.setName('channel').setDescription('Goodbye channel').setRequired(true)))
        .addSubcommand(sub => sub.setName('message').setDescription('Set welcome message')
            .addStringOption(opt => opt.setName('text').setDescription('Message ({user}, {server}, {memberCount})').setRequired(true)))
        .addSubcommand(sub => sub.setName('goodbye-message').setDescription('Set goodbye message')
            .addStringOption(opt => opt.setName('text').setDescription('Message ({user}, {server}, {memberCount})').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'channel') {
            const channel = interaction.options.getChannel('channel');
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { welcomeChannelId: channel.id } });
            await interaction.reply({ embeds: [successEmbed(`Hoş geldin kanalı: ${channel}`)] });
        }
        else if (sub === 'goodbye-channel') {
            const channel = interaction.options.getChannel('channel');
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { goodbyeChannelId: channel.id } });
            await interaction.reply({ embeds: [successEmbed(`Güle güle kanalı: ${channel}`)] });
        }
        else if (sub === 'message') {
            const text = interaction.options.getString('text');
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { welcomeMessage: text } });
            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.welcome.set'))] });
        }
        else if (sub === 'goodbye-message') {
            const text = interaction.options.getString('text');
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { goodbyeMessage: text } });
            await interaction.reply({ embeds: [successEmbed('✅ Güle güle mesajı ayarlandı!')] });
        }
    },
};
