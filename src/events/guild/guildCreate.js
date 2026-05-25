const { getGuildSettings } = require('../../utils/helpers');
const prisma = require('../../database');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(client, guild) {
        console.log(`[GUILD] ✅ Yeni sunucuya katıldı: ${guild.name} (${guild.id})`);

        
        await getGuildSettings(guild.id);

        
        const { syncGlobalSettings } = require('../../systems/syncService');
        await syncGlobalSettings(client);
    },
};
