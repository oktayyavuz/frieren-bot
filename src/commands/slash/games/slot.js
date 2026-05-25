const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🍀'];
const multipliers = { '7️⃣': 10, '💎': 5, '🍀': 3, '🍇': 2, '🍊': 1.5, '🍋': 1, '🍒': 0.5 };

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slot')
        .setNameLocalizations({ tr: 'slot' })
        .setDescription('Play slot machine')
        .setDescriptionLocalizations({ tr: 'Slot makinesi oyna' })
        .addIntegerOption(opt => opt.setName('bet').setNameLocalizations({ tr: 'bahis' }).setDescription('Bet amount').setRequired(true).setMinValue(10)),
    cooldown: 5,
    async run(client, interaction, lang) {
        const bet = interaction.options.getInteger('bet');
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const currency = config.economy.currencyName;

        if (guildUser.balance < bet) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.notEnoughMoney', { currency }))], ephemeral: true });

        const r = () => symbols[Math.floor(Math.random() * symbols.length)];
        const s1 = r(), s2 = r(), s3 = r();
        const display = `> ${r()} | ${r()} | ${r()}\n> ${s1} | ${s2} | ${s3} ◀️\n> ${r()} | ${r()} | ${r()}`;

        let result, amount;
        if (s1 === s2 && s2 === s3) {
            const mult = multipliers[s1] || 2;
            amount = Math.floor(bet * mult);
            result = s1 === '7️⃣'
                ? client.t(lang, 'commands.slot.jackpot', { amount: formatNumber(amount), currency })
                : client.t(lang, 'commands.slot.win', { amount: formatNumber(amount), currency });
        } else if (s1 === s2 || s2 === s3) {
            amount = Math.floor(bet * 0.5);
            result = client.t(lang, 'commands.slot.win', { amount: formatNumber(amount), currency });
        } else {
            amount = -bet;
            result = client.t(lang, 'commands.slot.lose', { amount: formatNumber(bet), currency });
        }

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount } },
        });

        const embed = createEmbed({
            color: amount > 0 ? config.colors.success : config.colors.error,
            title: '🎰 Slot Makinesi',
            description: `${display}\n\n${result}`,
            category: 'games',
        });

        await interaction.reply({ embeds: [embed] });
    },
};
