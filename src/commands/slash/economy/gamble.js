const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');


const SYMBOLS = [
    { emoji: '🍒', name: 'Kiraz',   multiplier: 1.5, weight: 30 },
    { emoji: '🍋', name: 'Limon',   multiplier: 2,   weight: 25 },
    { emoji: '🍇', name: 'Üzüm',    multiplier: 2.5, weight: 20 },
    { emoji: '🔔', name: 'Çan',     multiplier: 3,   weight: 15 },
    { emoji: '💎', name: 'Elmas',   multiplier: 5,   weight: 8  },
    { emoji: '7️⃣', name: 'Yedi',    multiplier: 10,  weight: 2  },
];

function weightedRandom() {
    const total = SYMBOLS.reduce((s, sym) => s + sym.weight, 0);
    let rnd = Math.random() * total;
    for (const sym of SYMBOLS) {
        rnd -= sym.weight;
        if (rnd <= 0) return sym;
    }
    return SYMBOLS[0];
}

function spin() {
    return [weightedRandom(), weightedRandom(), weightedRandom()];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setNameLocalizations({ tr: 'kumar' })
        .setDescription('Try your luck at the slot machine!')
        .setDescriptionLocalizations({ tr: 'Slot makinesinde şansını dene!' })
        .addIntegerOption(opt => opt
            .setName('bet')
            .setNameLocalizations({ tr: 'bahis' })
            .setDescription('Amount to bet (min: 10)')
            .setDescriptionLocalizations({ tr: 'Bahis miktarı (min: 10)' })
            .setRequired(true)
            .setMinValue(10)),
    cooldown: 8,
    async run(client, interaction, lang) {
        const { checkModule } = require('../../../utils/moduleHelper');
        if (!(await checkModule(interaction, 'economyEnabled'))) return;

        const bet = interaction.options.getInteger('bet');
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        if (guildUser.balance < bet) {
            return interaction.reply({
                embeds: [errorEmbed(`Yeterli bakiyen yok! Bakiye: **${formatNumber(guildUser.balance)} ${currency}**`)],
                ephemeral: true,
            });
        }

        const reels = spin();
        const [a, b, c] = reels;

        let won = false;
        let winAmount = 0;
        let resultText = '';

        if (a.emoji === b.emoji && b.emoji === c.emoji) {
            
            winAmount = Math.floor(bet * a.multiplier);
            won = true;
            resultText = `🎉 **JACKPOT! ${a.name} üçlüsü!** +${formatNumber(winAmount)} ${currency}`;
        } else if (a.emoji === b.emoji || b.emoji === c.emoji || a.emoji === c.emoji) {
            
            const matchSym = a.emoji === b.emoji ? a : c.emoji === b.emoji ? b : a;
            winAmount = Math.floor(bet * (matchSym.multiplier * 0.5));
            won = true;
            resultText = `✨ **İkilisi! ${matchSym.name}!** +${formatNumber(winAmount)} ${currency}`;
        } else {
            
            winAmount = -bet;
            resultText = `💸 **Kaybettin!** -${formatNumber(bet)} ${currency}`;
        }

        const newBalance = guildUser.balance + winAmount;

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: winAmount } },
        });

        const slotDisplay = `${a.emoji} ${b.emoji} ${c.emoji}`;
        const balanceInfo = `Yeni bakiye: **${formatNumber(newBalance)} ${currency}**`;

        if (won) {
            await interaction.reply({
                embeds: [successEmbed(
                    `┌───────────────┐\n│  ${slotDisplay}  │\n└───────────────┘\n\n${resultText}\n\n${balanceInfo}`,
                    null,
                    'economy',
                )],
            });
        } else {
            await interaction.reply({
                embeds: [errorEmbed(
                    `┌───────────────┐\n│  ${slotDisplay}  │\n└───────────────┘\n\n${resultText}\n\n${balanceInfo}`,
                )],
            });
        }

        logger.info(
            `Gamble: ${interaction.user.tag} bet ${formatNumber(bet)} — ${won ? `won ${formatNumber(winAmount)}` : `lost`} in ${interaction.guild.name}`,
            'ECONOMY',
        );
    },
};
