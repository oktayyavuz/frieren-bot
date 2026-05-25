const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random, discordTimestamp } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setNameLocalizations({ tr: 'suç' })
        .setDescription('Commit crime to earn money (risky!)')
        .setDescriptionLocalizations({ tr: 'Suç işleyerek para kazan (riskli!)' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        if (guildUser.crimeCooldown && Date.now() - guildUser.crimeCooldown.getTime() < 3600000) {
            const nextTime = new Date(guildUser.crimeCooldown.getTime() + 3600000);
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.crime.cooldown', { time: discordTimestamp(nextTime) }))], ephemeral: true });
        }

        const failed = Math.random() < config.economy.crimeFailChance;
        const amount = random(config.economy.crimeAmount.min, config.economy.crimeAmount.max);

        if (failed) {
            const fine = Math.floor(amount * 0.5);
            await prisma.guildUser.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                data: { balance: { decrement: Math.min(fine, guildUser.balance) }, crimeCooldown: new Date() },
            });
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.crime.fail', { amount: formatNumber(fine), currency }))] });
        }

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount }, crimeCooldown: new Date() },
        });

        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.crime.success', { amount: formatNumber(amount), currency }), null, 'economy')] });
    },
};
