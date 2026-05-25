const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, errorEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    const deck = [];
    for (const suit of suits) for (const value of values) deck.push({ suit, value });
    return deck.sort(() => Math.random() - 0.5);
}

function handValue(hand) {
    let total = 0, aces = 0;
    for (const card of hand) {
        if (card.value === 'A') { total += 11; aces++; }
        else if (['J', 'Q', 'K'].includes(card.value)) total += 10;
        else total += parseInt(card.value);
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

function handStr(hand, hideSecond = false) {
    return hand.map((c, i) => (i === 1 && hideSecond) ? '🂠' : `${c.value}${c.suit}`).join(' ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setNameLocalizations({ tr: 'blackjack' })
        .setDescription('Play blackjack')
        .setDescriptionLocalizations({ tr: 'Blackjack oyna' })
        .addIntegerOption(opt => opt.setName('bet').setNameLocalizations({ tr: 'bahis' }).setDescription('Bet amount').setRequired(true).setMinValue(10)),
    cooldown: 10,
    async run(client, interaction, lang) {
        const bet = interaction.options.getInteger('bet');
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);

        if (guildUser.balance < bet) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.notEnoughMoney', { currency: config.economy.currencyName }))], ephemeral: true });

        const deck = createDeck();
        const player = [deck.pop(), deck.pop()];
        const dealer = [deck.pop(), deck.pop()];

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bj_hit').setLabel(client.t(lang, 'commands.blackjack.hit')).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('bj_stand').setLabel(client.t(lang, 'commands.blackjack.stand')).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('bj_double').setLabel(client.t(lang, 'commands.blackjack.double')).setStyle(ButtonStyle.Danger).setDisabled(guildUser.balance < bet * 2),
        );

        const makeEmbed = (showDealer = false) => createEmbed({
            color: config.colors.economy,
            title: '🃏 Blackjack',
            category: 'games',
            fields: [
                { name: `Senin Elin (${handValue(player)})`, value: handStr(player), inline: true },
                { name: `Krupiye (${showDealer ? handValue(dealer) : '?'})`, value: handStr(dealer, !showDealer), inline: true },
                { name: 'Bahis', value: `${formatNumber(bet)} ${config.economy.currencyName}`, inline: true },
            ],
        });

        
        if (handValue(player) === 21) {
            const winAmount = Math.floor(bet * 1.5);
            await prisma.guildUser.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                data: { balance: { increment: winAmount } },
            });
            return interaction.reply({ embeds: [makeEmbed(true).setDescription(`🎉 BLACKJACK! +${formatNumber(winAmount)} ${config.economy.currencyName}`)] });
        }

        const { resource } = await interaction.reply({ embeds: [makeEmbed()], components: [buttons], withResponse: true });
        const msg = resource.message;

        const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });
        let currentBet = bet;

        collector.on('collect', async (i) => {
            if (i.customId === 'bj_hit' || i.customId === 'bj_double') {
                if (i.customId === 'bj_double') currentBet *= 2;
                player.push(deck.pop());

                if (handValue(player) > 21) {
                    collector.stop('bust');
                    await prisma.guildUser.update({
                        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                        data: { balance: { decrement: currentBet } },
                    });
                    return i.update({ embeds: [makeEmbed(true).setDescription(client.t(lang, 'commands.blackjack.lose', { amount: formatNumber(currentBet), currency: config.economy.currencyName }))], components: [] });
                }

                if (i.customId === 'bj_double' || handValue(player) === 21) {
                    await i.deferUpdate();
                    collector.stop('stand');
                    return;
                }

                await i.update({ embeds: [makeEmbed()], components: [buttons] });
            }

            if (i.customId === 'bj_stand') {
                collector.stop('stand');
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'bust') return;

            
            while (handValue(dealer) < 17) dealer.push(deck.pop());
            const pv = handValue(player), dv = handValue(dealer);

            let result, amount;
            if (dv > 21 || pv > dv) { result = 'win'; amount = currentBet; }
            else if (pv < dv) { result = 'lose'; amount = -currentBet; }
            else { result = 'draw'; amount = 0; }

            if (amount !== 0) {
                await prisma.guildUser.update({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    data: { balance: { increment: amount } },
                });
            }

            const desc = result === 'win'
                ? client.t(lang, 'commands.blackjack.win', { amount: formatNumber(currentBet), currency: config.economy.currencyName })
                : result === 'lose'
                    ? client.t(lang, 'commands.blackjack.lose', { amount: formatNumber(currentBet), currency: config.economy.currencyName })
                    : client.t(lang, 'commands.blackjack.draw');

            await msg.edit({ flags: FLAGS_V2, components: [embedToV2(makeEmbed(true).setDescription(desc))] }).catch(() => { });
        });
    },
};
