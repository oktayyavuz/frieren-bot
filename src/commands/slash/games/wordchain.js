const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordchain-setup')
        .setNameLocalizations({ tr: 'kelimezinciri-kur' })
        .setDescription('Set up word chain game channel')
        .setDescriptionLocalizations({ tr: 'Kelime zinciri oyunu kanalı ayarla' })
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 30,
    async run(client, interaction, lang) {
        const channel = interaction.options.getChannel('channel');

        await prisma.wordChain.upsert({
            where: { channelId: channel.id },
            update: { active: true, lastWord: '', lastUserId: '', usedWords: '[]', score: 0 },
            create: { guildId: interaction.guildId, channelId: channel.id },
        });

        await channel.send('🔤 **Kelime Zinciri** bu kanalda başladı!\nİlk kelimeyi yazın. Sonraki kişi, kelimenin **son harfi** ile başlayan yeni bir kelime yazmalı.');
        await interaction.reply({ embeds: [successEmbed(`✅ Kelime zinciri ${channel} kanalında aktif!`, null, 'games')], ephemeral: true });
        logger.info(`Wordchain Setup: ${interaction.user.tag} enabled wordchain in ${channel.name} (${interaction.guild.name})`, 'ADMIN');
    },
};
