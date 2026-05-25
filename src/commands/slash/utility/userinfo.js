const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setNameLocalizations({ tr: 'kullanıcı-bilgi' })
        .setDescription('Show user information')
        .setDescriptionLocalizations({ tr: 'Kullanıcı bilgisi göster' })
        .addUserOption(opt => opt.setName('user').setDescription('User')),
    cooldown: 5,
    async run(client, interaction, lang) {
        await interaction.deferReply();

        const target = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id)
            || await interaction.guild.members.fetch(target.id).catch(() => null);

        
        const fetchedUser = await client.users.fetch(target.id, { force: true }).catch(() => target);
        const bannerUrl = fetchedUser.bannerURL({ size: 1024 });
        const accentColor = fetchedUser.accentColor;

        const roles = member?.roles?.cache
            ?.filter(r => r.id !== interaction.guild.id)
            ?.sort((a, b) => b.position - a.position)
            ?.map(r => r.toString())
            ?.slice(0, 15) ?? [];

        const badges = [];
        const flags = fetchedUser.flags?.toArray() ?? [];
        const badgeMap = {
            ActiveDeveloper: '👨‍💻',
            BugHunterLevel1: '🐛',
            BugHunterLevel2: '🐛',
            HypeSquadOnlineHouse1: '🏠',
            HypeSquadOnlineHouse2: '🏠',
            HypeSquadOnlineHouse3: '🏠',
            HypeSquadEvents: '🏆',
            PremiumEarlySupporter: '⭐',
            VerifiedBotDeveloper: '✅',
            Staff: '🔨',
            Partner: '🤝',
        };
        for (const flag of flags) {
            if (badgeMap[flag]) badges.push(badgeMap[flag]);
        }

        const fields = [
            { name: '👤 Tag', value: target.tag, inline: true },
            { name: '🆔 ID', value: target.id, inline: true },
            { name: '🤖 Bot', value: target.bot ? 'Evet' : 'Hayır', inline: true },
            { name: `📅 ${client.t(lang, 'commands.userinfo.accountCreated')}`, value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
        ];

        if (member) {
            fields.push({ name: `📥 ${client.t(lang, 'commands.userinfo.joinedServer')}`, value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true });
            if (member.nickname) {
                fields.push({ name: '📝 Sunucu Adı', value: member.nickname, inline: true });
            }
        }

        if (badges.length) {
            fields.push({ name: '🎖️ Rozetler', value: badges.join(' '), inline: true });
        }

        if (roles.length) {
            fields.push({
                name: `🎭 ${client.t(lang, 'commands.userinfo.roles')} (${member?.roles?.cache?.size - 1 || 0})`,
                value: roles.join(' ') || 'Yok',
            });
        }

        const embed = createEmbed({
            title: client.t(lang, 'commands.userinfo.title'),
            thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
            image: bannerUrl || undefined,
            color: accentColor || undefined,
            fields,
            category: 'utility',
        });

        await interaction.editReply({ embeds: [embed] });
        logger.info(`Userinfo: ${interaction.user.tag} viewed info of ${target.tag} in ${interaction.guild.name}`, 'UTILITY');
    },
};
