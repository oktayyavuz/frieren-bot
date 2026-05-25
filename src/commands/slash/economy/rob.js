const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, random, discordTimestamp } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setNameLocalizations({ tr: 'soygun' })
        .setDescription('Rob someone')
        .setDescriptionLocalizations({ tr: 'Birini soy' })
        .addUserOption(opt => opt.setName('user').setDescription('User to rob').setRequired(true)),
    cooldown: 5,
    async run(client, interaction, lang) {
        const target = interaction.options.getUser('user');
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        if (target.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.rob.self'))], ephemeral: true });
        }

        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);

        if (guildUser.robCooldown && Date.now() - guildUser.robCooldown.getTime() < 3600000) {
            const nextTime = new Date(guildUser.robCooldown.getTime() + 3600000);
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.rob.cooldown', { time: discordTimestamp(nextTime) }))], ephemeral: true });
        }

        const targetUser = await getGuildUser(target.id, interaction.guildId);
        if (targetUser.balance < 50) {
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.rob.noMoney'))], ephemeral: true });
        }

        const failed = Math.random() < config.economy.robFailChance;

        if (failed) {
            const fine = random(50, 200);
            await prisma.guildUser.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                data: { balance: { decrement: Math.min(fine, guildUser.balance) }, robCooldown: new Date() },
            });
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.rob.fail', { amount: formatNumber(fine), currency }))] });
        }

        const maxRob = Math.floor(targetUser.balance * config.economy.robMaxPercent);
        const amount = random(1, maxRob);

        await prisma.guildUser.update({
            where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
            data: { balance: { increment: amount }, robCooldown: new Date() },
        });
        await prisma.guildUser.update({
            where: { userId_guildId: { userId: target.id, guildId: interaction.guildId } },
            data: { balance: { decrement: amount } },
        });

        await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.rob.success', { target: `<@${target.id}>`, amount: formatNumber(amount), currency }), null, 'economy')] });
    },
};
