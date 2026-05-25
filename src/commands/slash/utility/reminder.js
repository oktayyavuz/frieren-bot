const { SlashCommandBuilder } = require('discord.js');
const prisma = require('../../../database');
const { getUser, discordTimestamp } = require('../../../utils/helpers');
const { createEmbed, errorEmbed, successEmbed } = require('../../../utils/embed');
const ms = require('ms');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setNameLocalizations({ tr: 'hatırlatıcı' })
        .setDescription('Set a reminder')
        .setDescriptionLocalizations({ tr: 'Hatırlatıcı kur' })
        .addSubcommand(sub => sub.setName('set').setNameLocalizations({ tr: 'kur' }).setDescription('Set a reminder')
            .addStringOption(opt => opt.setName('time').setNameLocalizations({ tr: 'süre' }).setDescription('Duration (e.g. 10m, 1h, 1d)').setRequired(true))
            .addStringOption(opt => opt.setName('message').setNameLocalizations({ tr: 'mesaj' }).setDescription('Reminder message').setRequired(true)))
        .addSubcommand(sub => sub.setName('list').setNameLocalizations({ tr: 'liste' }).setDescription('List active reminders')),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();
        await getUser(interaction.user.id);

        if (sub === 'set') {
            const timeStr = interaction.options.getString('time');
            const message = interaction.options.getString('message');
            const duration = ms(timeStr);

            if (!duration || duration < 60000) return interaction.reply({ embeds: [errorEmbed('Süre en az 1 dakika olmalı!')], ephemeral: true });

            const remindAt = new Date(Date.now() + duration);
            await prisma.reminder.create({
                data: { userId: interaction.user.id, channelId: interaction.channel.id, guildId: interaction.guildId, message, remindAt },
            });

            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.reminder.set', { time: discordTimestamp(remindAt) }), null, 'utility')] });
        }

        if (sub === 'list') {
            const reminders = await prisma.reminder.findMany({
                where: { userId: interaction.user.id, completed: false },
                orderBy: { remindAt: 'asc' },
            });

            if (reminders.length === 0) return interaction.reply({ embeds: [createEmbed({ description: client.t(lang, 'commands.reminder.noReminders') })] });

            const embed = createEmbed({
                title: client.t(lang, 'commands.reminder.list'),
                description: reminders.map((r, i) => `**${i + 1}.** ${r.message}\n⏰ ${discordTimestamp(r.remindAt)}`).join('\n\n'),
                category: 'utility',
            });

            await interaction.reply({ embeds: [embed] });
            logger.info(`Reminder: ${interaction.user.tag} listed reminders in ${interaction.guild.name}`, 'UTILITY');
        }
    },
};
