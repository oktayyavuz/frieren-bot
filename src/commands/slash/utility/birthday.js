const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

const MONTH_NAMES = [
    '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function isValidDate(day, month) {
    if (month < 1 || month > 12) return false;
    const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day >= 1 && day <= daysInMonth[month];
}

function container(color, content) {
    return { type: 17, accent_color: color, components: [{ type: 10, content }] };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setNameLocalizations({ tr: 'doğumgünü' })
        .setDescription('Birthday system')
        .setDescriptionLocalizations({ tr: 'Doğum günü sistemi' })
        .addSubcommand(sub => sub
            .setName('set')
            .setNameLocalizations({ tr: 'ayarla' })
            .setDescription('Set your birthday')
            .setDescriptionLocalizations({ tr: 'Doğum gününü ayarla' })
            .addIntegerOption(opt => opt
                .setName('day')
                .setNameLocalizations({ tr: 'gün' })
                .setDescription('Day (1-31)')
                .setDescriptionLocalizations({ tr: 'Gün (1-31)' })
                .setRequired(true).setMinValue(1).setMaxValue(31))
            .addIntegerOption(opt => opt
                .setName('month')
                .setNameLocalizations({ tr: 'ay' })
                .setDescription('Month (1-12)')
                .setDescriptionLocalizations({ tr: 'Ay (1-12)' })
                .setRequired(true).setMinValue(1).setMaxValue(12))
        )
        .addSubcommand(sub => sub
            .setName('remove')
            .setNameLocalizations({ tr: 'kaldır' })
            .setDescription('Remove your birthday')
            .setDescriptionLocalizations({ tr: 'Doğum gününü kaldır' })
        )
        .addSubcommand(sub => sub
            .setName('list')
            .setNameLocalizations({ tr: 'liste' })
            .setDescription('Show upcoming birthdays')
            .setDescriptionLocalizations({ tr: 'Yaklaşan doğum günleri' })
        )
        .addSubcommand(sub => sub
            .setName('check')
            .setNameLocalizations({ tr: 'kontrol' })
            .setDescription('Check a user\'s birthday')
            .setDescriptionLocalizations({ tr: 'Bir kullanıcının doğum gününü gör' })
            .addUserOption(opt => opt
                .setName('user')
                .setNameLocalizations({ tr: 'kullanıcı' })
                .setDescription('User to check')
                .setRequired(false))
        )
        .addSubcommand(sub => sub
            .setName('setup')
            .setNameLocalizations({ tr: 'kur' })
            .setDescription('Configure birthday channel & role (Admin only)')
            .setDescriptionLocalizations({ tr: 'Doğum günü kanalını ve rolünü ayarla (Yönetici)' })
            .addChannelOption(opt => opt
                .setName('channel')
                .setNameLocalizations({ tr: 'kanal' })
                .setDescription('Birthday announcement channel')
                .setRequired(true))
            .addRoleOption(opt => opt
                .setName('role')
                .setNameLocalizations({ tr: 'rol' })
                .setDescription('Role to give on birthday (optional)'))
        ),
    cooldown: 5,
    async run(client, interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        
        if (sub === 'set') {
            const day = interaction.options.getInteger('day');
            const month = interaction.options.getInteger('month');

            if (!isValidDate(day, month)) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.error, `## ❌ Geçersiz Tarih\n**${day} ${MONTH_NAMES[month]}** geçerli bir tarih değil.`)],
                    ephemeral: true,
                });
            }

            await prisma.birthday.upsert({
                where: { userId_guildId: { userId, guildId } },
                update: { day, month },
                create: { userId, guildId, day, month },
            });

            logger.info(`Birthday: ${interaction.user.tag} set birthday to ${day}/${month} in ${interaction.guild.name}`, 'UTILITY');

            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.success, `## 🎂 Doğum Günü Ayarlandı!\n\n**${day} ${MONTH_NAMES[month]}** tarihinde kutlanacak! 🎉\n\n-# Kaldırmak için \`/birthday remove\` kullan.`)],
                ephemeral: true,
            });
        }

        
        if (sub === 'remove') {
            const existing = await prisma.birthday.findUnique({
                where: { userId_guildId: { userId, guildId } },
            });
            if (!existing) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.warning, '## ⚠️ Kayıtlı doğum günün yok.')],
                    ephemeral: true,
                });
            }
            await prisma.birthday.delete({ where: { userId_guildId: { userId, guildId } } });
            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.success, '## ✅ Doğum günün kaldırıldı.')],
                ephemeral: true,
            });
        }

        
        if (sub === 'list') {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentDay = now.getDate();

            const all = await prisma.birthday.findMany({ where: { guildId } });

            if (all.length === 0) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.info, '## 🎂 Doğum Günü Listesi\n\nHenüz kimse doğum gününü kaydetmedi.\n`/birthday set` ile ekleyebilirsiniz!')],
                });
            }

            
            const sorted = [...all].sort((a, b) => {
                const daysA = daysUntilBirthday(a.day, a.month, currentDay, currentMonth);
                const daysB = daysUntilBirthday(b.day, b.month, currentDay, currentMonth);
                return daysA - daysB;
            });

            const lines = sorted.slice(0, 15).map(b => {
                const days = daysUntilBirthday(b.day, b.month, currentDay, currentMonth);
                const label = days === 0 ? '🎉 **BUGÜN!**' : days === 1 ? '⏳ Yarın' : `${days} gün sonra`;
                return `📅 **${b.day} ${MONTH_NAMES[b.month]}** — <@${b.userId}> • ${label}`;
            });

            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.primary, `## 🎂 Yaklaşan Doğum Günleri\n\n${lines.join('\n')}`)],
            });
        }

        
        if (sub === 'check') {
            const target = interaction.options.getUser('user') || interaction.user;
            const record = await prisma.birthday.findUnique({
                where: { userId_guildId: { userId: target.id, guildId } },
            });

            if (!record) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.warning,
                        `## 🎂 Doğum Günü\n${target.id === userId ? 'Henüz doğum gününü kaydetmedin.' : `**${target.username}** doğum gününü kaydetmemiş.`}`)],
                    ephemeral: true,
                });
            }

            const now = new Date();
            const days = daysUntilBirthday(record.day, record.month, now.getDate(), now.getMonth() + 1);
            const label = days === 0 ? '🎉 **BUGÜN!**' : days === 1 ? '⏳ Yarın' : `${days} gün sonra`;

            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.primary,
                    `## 🎂 Doğum Günü\n${target.toString()} — **${record.day} ${MONTH_NAMES[record.month]}**\n\n${label}`)],
                ephemeral: target.id !== userId,
            });
        }

        
        if (sub === 'setup') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.error, '## ❌ Yetersiz Yetki\nBu komutu kullanmak için **Yönetici** yetkisi gerekiyor.')],
                    ephemeral: true,
                });
            }

            const channel = interaction.options.getChannel('channel');
            const role = interaction.options.getRole('role');

            await prisma.guildSettings.update({
                where: { id: guildId },
                data: {
                    birthdayChannelId: channel.id,
                    birthdayRoleId: role?.id || null,
                },
            });

            logger.info(`Birthday setup: ${interaction.user.tag} set channel #${channel.name} in ${interaction.guild.name}`, 'ADMIN');

            const content = [
                `## ✅ Doğum Günü Kurulumu`,
                `📢 **Kanal:** ${channel.toString()}`,
                role ? `🎭 **Rol:** ${role.toString()}` : '🎭 **Rol:** Yok',
                '',
                'Her sabah 09:00\'da doğum günleri kontrol edilir.',
            ].join('\n');

            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.success, content)],
            });
        }
    },
};

/** Bugünden kaç gün sonra o doğum günü gelir (0 = bugün, max 365) */
function daysUntilBirthday(day, month, todayDay, todayMonth) {
    const now = new Date();
    const thisYear = now.getFullYear();
    let bday = new Date(thisYear, month - 1, day);
    const today = new Date(thisYear, todayMonth - 1, todayDay);
    if (bday < today) bday.setFullYear(thisYear + 1);
    return Math.round((bday - today) / 86400000);
}
