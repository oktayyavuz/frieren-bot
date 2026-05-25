const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const { formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');

const PAGE_SIZE = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setNameLocalizations({ tr: 'sıralama' })
        .setDescription('Show the leaderboard')
        .setDescriptionLocalizations({ tr: 'Liderlik tablosunu göster' })
        .addStringOption(opt => opt.setName('type').setDescription('Leaderboard type').addChoices(
            { name: 'Economy', value: 'economy' },
            { name: 'Level', value: 'level' },
        )),
    cooldown: 10,
    async run(client, interaction, lang) {
        const { checkModule } = require('../../../utils/moduleHelper');
        const type = interaction.options.getString('type') || 'economy';

        if (type === 'economy') {
            if (!(await checkModule(interaction, 'economyEnabled'))) return;
        } else {
            if (!(await checkModule(interaction, 'levelingEnabled'))) return;
        }

        await interaction.deferReply();

        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        const buildPage = async (page) => {
            const skip = page * PAGE_SIZE;
            let users, total, title, description;

            if (type === 'economy') {
                [users, total] = await Promise.all([
                    prisma.guildUser.findMany({
                        where: { guildId: interaction.guildId },
                        orderBy: { balance: 'desc' },
                        skip,
                        take: PAGE_SIZE,
                    }),
                    prisma.guildUser.count({ where: { guildId: interaction.guildId } }),
                ]);
                title = client.t(lang, 'commands.leaderboard.economy');
                description = users.length
                    ? users.map((u, i) => {
                        const rank = skip + i + 1;
                        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
                        return `${medal} <@${u.userId}> — **${formatNumber(u.balance + u.bank)}** ${currency}`;
                    }).join('\n')
                    : client.t(lang, 'commands.leaderboard.noData');
            } else {
                [users, total] = await Promise.all([
                    prisma.guildUser.findMany({
                        where: { guildId: interaction.guildId },
                        orderBy: { xp: 'desc' },
                        skip,
                        take: PAGE_SIZE,
                    }),
                    prisma.guildUser.count({ where: { guildId: interaction.guildId } }),
                ]);
                title = client.t(lang, 'commands.leaderboard.level');
                description = users.length
                    ? users.map((u, i) => {
                        const rank = skip + i + 1;
                        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `**${rank}.**`;
                        return `${medal} <@${u.userId}> — Lvl **${u.level}** (${formatNumber(u.xp)} XP)`;
                    }).join('\n')
                    : client.t(lang, 'commands.leaderboard.noData');
            }

            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

            const embed = createEmbed({
                title,
                description,
                color: type === 'economy' ? config.colors.economy : config.colors.level,
                category: type === 'economy' ? 'economy' : 'leveling',
                footer: { text: `Sayfa ${page + 1} / ${totalPages}` },
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('lb_prev')
                    .setLabel('◀ Önceki')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('lb_next')
                    .setLabel('Sonraki ▶')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= totalPages - 1),
            );

            return { embed, row, totalPages };
        };

        let page = 0;
        const { embed, row } = await buildPage(page);
        const msg = await interaction.editReply({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id && ['lb_prev', 'lb_next'].includes(i.customId),
            time: 120_000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'lb_prev') page--;
            if (i.customId === 'lb_next') page++;
            const { embed: newEmbed, row: newRow } = await buildPage(page);
            await i.update({ embeds: [newEmbed], components: [newRow] });
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => { });
        });
    },
};
