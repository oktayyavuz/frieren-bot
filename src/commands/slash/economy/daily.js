const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random, discordTimestamp } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setNameLocalizations({ tr: 'günlük' })
        .setDescription('Claim your daily reward')
        .setDescriptionLocalizations({ tr: 'Günlük ödülünü al' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const { checkModule } = require('../../../utils/moduleHelper');
        if (!(await checkModule(interaction, 'economyEnabled'))) return;

        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        
        if (guildUser.dailyCooldown && Date.now() - guildUser.dailyCooldown.getTime() < 86400000) {
            const nextTime = new Date(guildUser.dailyCooldown.getTime() + 86400000);
            return interaction.reply({
                embeds: [errorEmbed(client.t(lang, 'commands.daily.cooldown', { time: discordTimestamp(nextTime) }))],
                ephemeral: true,
            });
        }

        const amount = random(config.economy.dailyAmount.min, config.economy.dailyAmount.max);
        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount }, dailyCooldown: new Date() },
        });

        await interaction.reply({
            embeds: [successEmbed(client.t(lang, 'commands.daily.success', { amount: formatNumber(amount), currency }), null, 'economy')],
        });
    },
};
