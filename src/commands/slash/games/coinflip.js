const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setNameLocalizations({ tr: 'yazıtura' })
        .setDescription('Play coin flip')
        .setDescriptionLocalizations({ tr: 'Yazı tura oyna' })
        .addStringOption(opt => opt.setName('choice').setNameLocalizations({ tr: 'seçim' }).setDescription('Heads or tails').addChoices({ name: 'Heads / Yazı', value: 'heads' }, { name: 'Tails / Tura', value: 'tails' }).setRequired(true))
        .addIntegerOption(opt => opt.setName('bet').setNameLocalizations({ tr: 'bahis' }).setDescription('Bet amount').setRequired(true).setMinValue(10)),
    cooldown: 5,
    async run(client, interaction, lang) {
        const choice = interaction.options.getString('choice');
        const bet = interaction.options.getInteger('bet');
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const currency = config.economy.currencyName;

        if (guildUser.balance < bet) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.notEnoughMoney', { currency }))], ephemeral: true });

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const won = choice === result;
        const resultEmoji = result === 'heads' ? '🪙 Yazı' : '🪙 Tura';

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: won ? bet : -bet } },
        });

        const msg = won
            ? `${resultEmoji}\n\n${client.t(lang, 'commands.coinflip.win', { amount: formatNumber(bet), currency })}`
            : `${resultEmoji}\n\n${client.t(lang, 'commands.coinflip.lose', { amount: formatNumber(bet), currency })}`;

        await interaction.reply({ embeds: [won ? successEmbed(msg) : errorEmbed(msg)] });
    },
};
