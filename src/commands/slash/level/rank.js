const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, progressBar } = require('../../../utils/helpers');
const { calculateLevel, xpForLevel } = require('../../../systems/leveling');
const prisma = require('../../../database');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setNameLocalizations({ tr: 'seviye' })
        .setDescription('Show rank card')
        .setDescriptionLocalizations({ tr: 'Seviye kartını göster' })
        .addUserOption(opt => opt.setName('user').setDescription('User')),
    cooldown: 10,
    async run(client, interaction, lang) {
        const { checkModule } = require('../../../utils/moduleHelper');
        if (!(await checkModule(interaction, 'levelingEnabled'))) return;

        await interaction.deferReply();
        const target = interaction.options.getUser('user') || interaction.user;
        const guildUser = await getGuildUser(target.id, interaction.guildId);

        const level = guildUser.level;
        const currentLevelXp = xpForLevel(level);
        const nextLevelXp = xpForLevel(level + 1);
        const currentXp = guildUser.xp - currentLevelXp;
        const neededXp = nextLevelXp - currentLevelXp;
        const progress = Math.min(currentXp / neededXp, 1);

        const bar = progressBar(currentXp, neededXp, 20);

        
        const rankPosition = await prisma.guildUser.count({
            where: {
                guildId: interaction.guildId,
                xp: { gt: guildUser.xp },
            },
        });
        const serverRank = rankPosition + 1;

        const embed = createEmbed({
            color: config.colors.level,
            title: `✨ ${target.username}`,
            thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
            fields: [
                { name: '🏆 Seviye', value: `**${level}**`, inline: true },
                { name: '🎖️ Sunucu Sırası', value: `**#${serverRank}**`, inline: true },
                { name: '✨ XP', value: `**${formatNumber(guildUser.xp)}**`, inline: true },
                { name: '💬 Mesaj', value: `**${formatNumber(guildUser.totalMessages)}**`, inline: true },
                { name: '🔊 Ses', value: `**${formatNumber(guildUser.voiceMinutes)}** dk`, inline: true },
                { name: `İlerleme (${Math.floor(progress * 100)}%)`, value: `${bar}\n${formatNumber(currentXp)} / ${formatNumber(neededXp)} XP` },
            ],
        });

        await interaction.editReply({ embeds: [embed] });
    },
};
