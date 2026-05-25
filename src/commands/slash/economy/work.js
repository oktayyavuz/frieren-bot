const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random, discordTimestamp } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setNameLocalizations({ tr: 'çalış' })
        .setDescription('Work to earn money')
        .setDescriptionLocalizations({ tr: 'Para kazanmak için çalış' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const { checkModule } = require('../../../utils/moduleHelper');
        if (!(await checkModule(interaction, 'economyEnabled'))) return;

        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        
        if (guildUser.workCooldown && Date.now() - guildUser.workCooldown.getTime() < 1800000) {
            const nextTime = new Date(guildUser.workCooldown.getTime() + 1800000);
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.work.cooldown', { time: discordTimestamp(nextTime) }))], ephemeral: true });
        }

        const amount = random(config.economy.workAmount.min, config.economy.workAmount.max);
        const scenarios = client.t(lang, 'commands.work.scenarios');
        const scenario = Array.isArray(scenarios) ? scenarios[Math.floor(Math.random() * scenarios.length)] : '';

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount }, workCooldown: new Date() },
        });

        const msg = scenario
            ? `${scenario}\n\n${client.t(lang, 'commands.work.success', { amount: formatNumber(amount), currency })}`
            : client.t(lang, 'commands.work.success', { amount: formatNumber(amount), currency });

        await interaction.reply({ embeds: [successEmbed(msg, null, 'economy')] });
    },
};
