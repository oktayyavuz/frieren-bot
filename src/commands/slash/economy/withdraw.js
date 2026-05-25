const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setNameLocalizations({ tr: 'çek' })
        .setDescription('Withdraw money from bank')
        .setDescriptionLocalizations({ tr: 'Bankadan para çek' })
        .addIntegerOption(opt => opt.setName('amount').setNameLocalizations({ tr: 'miktar' }).setDescription('Amount (0 = all)').setRequired(true).setMinValue(0)),
    cooldown: 3,
    async run(client, interaction, lang) {
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        let amount = interaction.options.getInteger('amount');
        if (amount === 0) amount = guildUser.bank;
        if (amount > guildUser.bank || amount <= 0) {
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.withdraw.noMoney'))], ephemeral: true });
        }

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { bank: { decrement: amount }, balance: { increment: amount } },
        });

        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.withdraw.success', { amount: formatNumber(amount), currency }), null, 'economy')] });
    },
};
