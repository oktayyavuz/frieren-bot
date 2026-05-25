const prisma = require('../database');
const { FLAGS_V2 } = require('../utils/embed');
const logger = require('../utils/logger');

const MONTH_NAMES = [
    '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

/**
 * Bugün doğum günü olan tüm üyeleri kontrol et ve kutla.
 * ready.js'den her gün 09:00'da çağrılır.
 */
async function checkBirthdays(client) {
    const now = new Date();
    const today = { day: now.getDate(), month: now.getMonth() + 1 };

    logger.info(`Birthday check: ${today.day}/${today.month}`, 'BIRTHDAY');

    const birthdays = await prisma.birthday.findMany({
        where: { day: today.day, month: today.month },
    });

    if (birthdays.length === 0) return;

    
    const byGuild = birthdays.reduce((acc, b) => {
        (acc[b.guildId] = acc[b.guildId] || []).push(b);
        return acc;
    }, {});

    for (const [guildId, entries] of Object.entries(byGuild)) {
        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;

            const settings = await prisma.guildSettings.findUnique({ where: { id: guildId } });
            if (!settings?.birthdayChannelId) continue;

            const channel = guild.channels.cache.get(settings.birthdayChannelId);
            if (!channel) continue;

            for (const entry of entries) {
                try {
                    const member = await guild.members.fetch(entry.userId).catch(() => null);
                    if (!member) continue;

                    
                    const message = (settings.birthdayMessage || '🎂 Bugün {user} doğum günü! Herkese kutlu olsun! 🎉')
                        .replace(/{user}/g, `<@${entry.userId}>`)
                        .replace(/{username}/g, member.user.username);

                    const content = [
                        `## 🎂 Doğum Günü Kutlaması!`,
                        '',
                        message,
                        '',
                        `**${today.day} ${MONTH_NAMES[today.month]}** tarihli doğum günün kutlu olsun! 🎉🥳`,
                    ].join('\n');

                    await channel.send({
                        flags: FLAGS_V2,
                        components: [{
                            type: 17,
                            accent_color: 0xF39C12, 
                            components: [{ type: 10, content }],
                        }],
                    }).catch(() => {});

                    
                    if (settings.birthdayRoleId) {
                        const role = guild.roles.cache.get(settings.birthdayRoleId);
                        if (role) {
                            await member.roles.add(role).catch(() => {});

                            
                            setTimeout(async () => {
                                await member.roles.remove(role).catch(() => {});
                            }, 86400000);
                        }
                    }

                    logger.info(`Birthday: Wished ${member.user.tag} in ${guild.name}`, 'BIRTHDAY');
                } catch (err) {
                    logger.error(`Birthday error for user ${entry.userId}: ${err.message}`, 'BIRTHDAY');
                }
            }
        } catch (err) {
            logger.error(`Birthday guild error (${guildId}): ${err.message}`, 'BIRTHDAY');
        }
    }
}

module.exports = { checkBirthdays };
