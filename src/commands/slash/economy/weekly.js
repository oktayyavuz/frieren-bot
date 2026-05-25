const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random, discordTimestamp } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setNameLocalizations({ tr: 'haftalık' })
        .setDescription('Claim your weekly reward')
        .setDescriptionLocalizations({ tr: 'Haftalık ödülünü al' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        if (guildUser.weeklyCooldown && Date.now() - guildUser.weeklyCooldown.getTime() < 604800000) {
            const nextTime = new Date(guildUser.weeklyCooldown.getTime() + 604800000);
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.weekly.cooldown', { time: discordTimestamp(nextTime) }))], ephemeral: true });
        }

        const amount = random(config.economy.weeklyAmount.min, config.economy.weeklyAmount.max);
        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount }, weeklyCooldown: new Date() },
        });

        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.weekly.success', { amount: formatNumber(amount), currency }), null, 'economy')] });
    },
};
