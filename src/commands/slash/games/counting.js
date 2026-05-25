const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting-setup')
        .setNameLocalizations({ tr: 'sayısayma-kur' })
        .setDescription('Set up counting game channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 30,
    async run(client, interaction, lang) {
        const channel = interaction.options.getChannel('channel');
        await prisma.counting.upsert({
            where: { channelId: channel.id },
            update: { active: true, currentNumber: 0, lastUserId: '', highScore: 0 },
            create: { guildId: interaction.guildId, channelId: channel.id },
        });
        await channel.send('🔢 **Sayı Sayma** başladı! İlk sayı: **1**');
        await interaction.reply({ embeds: [successEmbed(`✅ Sayı sayma ${channel} kanalında aktif!`, null, 'games')], ephemeral: true });
        logger.info(`Counting Setup: ${interaction.user.tag} enabled counting in ${channel.name} (${interaction.guild.name})`, 'ADMIN');
    },
};
