module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(client, guild) {
        console.log(`[GUILD] ❌ Sunucudan ayrıldı: ${guild.name} (${guild.id})`);

        
        const { syncGlobalSettings } = require('../../systems/syncService');
        await syncGlobalSettings(client);
    },
};
