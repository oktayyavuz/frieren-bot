const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random, discordTimestamp } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hourly')
        .setNameLocalizations({ tr: 'saatlik' })
        .setDescription('Claim your hourly reward')
        .setDescriptionLocalizations({ tr: 'Saatlik ödülünü al' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        if (guildUser.hourlyCooldown && Date.now() - guildUser.hourlyCooldown.getTime() < 3600000) {
            const nextTime = new Date(guildUser.hourlyCooldown.getTime() + 3600000);
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.hourly.cooldown', { time: discordTimestamp(nextTime) }))], ephemeral: true });
        }

        const amount = random(config.economy.hourlyAmount.min, config.economy.hourlyAmount.max);
        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount }, hourlyCooldown: new Date() },
        });

        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.hourly.success', { amount: formatNumber(amount), currency }), null, 'economy')] });
    },
};
