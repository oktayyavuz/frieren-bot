const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setNameLocalizations({ tr: 'bakiye' })
        .setDescription('Check your balance')
        .setDescriptionLocalizations({ tr: 'Bakiyeni kontrol et' })
        .addUserOption(opt => opt.setName('user').setDescription('User to check')),
    cooldown: 3,
    async run(client, interaction, lang) {
        const { checkModule } = require('../../../utils/moduleHelper');
        if (!(await checkModule(interaction, 'economyEnabled'))) return;

        const target = interaction.options.getUser('user') || interaction.user;
        const guildUser = await getGuildUser(target.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || client.config.economy.currencyName;
        const emoji = settings?.currencyEmoji || client.config.economy.currencyEmoji;

        const embedImage = settings?.economyEmbedImage || client.config.embeds.economyImage;

        const embed = createEmbed({
            color: client.config.colors.economy,
            title: `${emoji} ${client.t(lang, 'commands.balance.title')} — ${target.username}`,
            thumbnail: target.displayAvatarURL({ dynamic: true }),
            image: embedImage,
            category: 'economy',
            fields: [
                { name: `💳 ${client.t(lang, 'commands.balance.wallet')}`, value: `${formatNumber(guildUser.balance)} ${currency}`, inline: true },
                { name: `🏦 ${client.t(lang, 'commands.balance.bank')}`, value: `${formatNumber(guildUser.bank)} ${currency}`, inline: true },
                { name: `💰 ${client.t(lang, 'commands.balance.netWorth')}`, value: `${formatNumber(guildUser.balance + guildUser.bank)} ${currency}`, inline: true },
            ],
        });

        await interaction.reply({ embeds: [embed] });
    },
};
