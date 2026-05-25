const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setNameLocalizations({ tr: 'yatır' })
        .setDescription('Deposit money to bank')
        .setDescriptionLocalizations({ tr: 'Bankaya para yatır' })
        .addIntegerOption(opt => opt.setName('amount').setNameLocalizations({ tr: 'miktar' }).setDescription('Amount (0 = all)').setRequired(true).setMinValue(0)),
    cooldown: 3,
    async run(client, interaction, lang) {
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        let amount = interaction.options.getInteger('amount');
        if (amount === 0) amount = guildUser.balance;
        if (amount > guildUser.balance || amount <= 0) {
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.deposit.noMoney'))], ephemeral: true });
        }

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { decrement: amount }, bank: { increment: amount } },
        });

        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.deposit.success', { amount: formatNumber(amount), currency }), null, 'economy')] });
    },
};
