const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setNameLocalizations({ tr: 'transfer' })
        .setDescription('Send money to someone')
        .setDescriptionLocalizations({ tr: 'Birine para gönder' })
        .addUserOption(opt => opt.setName('user').setDescription('User to send to').setRequired(true))
        .addIntegerOption(opt => opt.setName('amount').setNameLocalizations({ tr: 'miktar' }).setDescription('Amount to send').setRequired(true).setMinValue(1)),
    cooldown: 5,
    async run(client, interaction, lang) {
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        if (target.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.transfer.self'))], ephemeral: true });

        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        if (guildUser.balance < amount) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.transfer.noMoney'))], ephemeral: true });

        await getGuildUser(target.id, interaction.guildId);

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { decrement: amount } },
        });
        await prisma.guildUser.update({
            where: { userId_guildId: { userId: target.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount } },
        });

        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.transfer.success', { target: `<@${target.id}>`, amount: formatNumber(amount), currency }), null, 'economy')] });
    },
};
