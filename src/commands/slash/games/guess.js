const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setNameLocalizations({ tr: 'tahmin' })
        .setDescription('Number guessing game')
        .setDescriptionLocalizations({ tr: 'Sayı tahmin oyunu' })
        .addIntegerOption(opt => opt.setName('bet').setNameLocalizations({ tr: 'bahis' }).setDescription('Bet amount').setRequired(true).setMinValue(10)),
    cooldown: 10,
    async run(client, interaction, lang) {
        const bet = interaction.options.getInteger('bet');
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const currency = config.economy.currencyName;

        if (guildUser.balance < bet) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.notEnoughMoney', { currency }))], ephemeral: true });

        const target = random(1, 100);
        let attempts = 0;

        await interaction.reply({ embeds: [createEmbed({ title: '🔢 Sayı Tahmin', description: client.t(lang, 'commands.guess.start'), color: config.colors.info, category: 'games' })] });

        const filter = m => m.author.id === interaction.user.id && !isNaN(m.content);
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', async (msg) => {
            attempts++;
            const guess = parseInt(msg.content);

            if (guess === target) {
                collector.stop('correct');
                const winAmount = Math.max(bet, Math.floor(bet * (10 / attempts)));
                await prisma.guildUser.update({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    data: { balance: { increment: winAmount } },
                });
                await msg.reply({ embeds: [successEmbed(client.t(lang, 'commands.guess.correct', { attempts, amount: formatNumber(winAmount), currency }), null, 'games')] });
                logger.info(`Guess: ${interaction.user.tag} won ${winAmount} in ${interaction.guild.name}`, 'ECONOMY');
            } else if (guess < target) {
                await msg.react('⬆️');
            } else {
                await msg.react('⬇️');
            }

            if (attempts >= 10) {
                collector.stop('maxAttempts');
                await prisma.guildUser.update({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    data: { balance: { decrement: bet } },
                });
                await interaction.channel.send({ flags: FLAGS_V2, components: [embedToV2(errorEmbed(`10 denemede bulamadın! Doğru cevap: **${target}**\n-${formatNumber(bet)} ${currency}`))] });
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                interaction.channel.send({ flags: FLAGS_V2, components: [embedToV2(errorEmbed(`Süre doldu! Doğru cevap: **${target}**`))] }).catch(() => { });
            }
        });
    },
};
