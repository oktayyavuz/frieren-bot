const prisma = require('../database');
const { errorEmbed } = require('./embed');

/**
 * Bir modülün aktif olup olmadığını kontrol eder
 * @param {string} moduleName - Kontrol edilecek modül adı (economyEnabled, levelingEnabled vb.)
 * @returns {Promise<boolean>} true = aktif, false = kapalı
 */
async function checkModule(interaction, moduleName) {
    const settings = await prisma.guildSettings.findUnique({
        where: { id: interaction.guildId }
    });

    if (!settings) return true; 

    if (!settings[moduleName]) {
        const lang = settings.language || 'tr';
        const displayNames = {
            economyEnabled: { tr: 'Ekonomi', en: 'Economy' },
            levelingEnabled: { tr: 'Seviye', en: 'Leveling' },
            moderationEnabled: { tr: 'Moderasyon', en: 'Moderation' },
            ticketEnabled: { tr: 'Bilet (Ticket)', en: 'Ticket' },
            welcomeEnabled: { tr: 'Hoş Geldin', en: 'Welcome' },
            loggingEnabled: { tr: 'Loglama', en: 'Logging' }
        };

        const moduleDisplayName = displayNames[moduleName]?.[lang] || 'Sistem';
        
        const message = lang === 'tr' 
            ? `❌ **${moduleDisplayName}** sistemi şu an bu sunucuda devre dışı bırakılmış.`
            : `❌ **${moduleDisplayName}** system is currently disabled in this server.`;

        await interaction.reply({ 
            embeds: [errorEmbed(message)], 
            ephemeral: true 
        }).catch(() => {});
        
        return false;
    }

    return true;
}

module.exports = { checkModule };
