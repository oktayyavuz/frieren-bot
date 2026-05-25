const { ActivityType } = require('discord.js');
const { startRecovery } = require('../../systems/recovery');
const { checkBirthdays } = require('../../systems/birthdayChecker');
const botApi = require('../../api/server');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('═══════════════════════════════════════════');
        console.log(`  ✅ ${client.config.botName} Bot çevrimiçi!`);
        console.log(`  📊 ${client.guilds.cache.size} sunucu | ${client.users.cache.size} kullanıcı`);
        console.log(`  🏷️  ${client.user.tag}`);
        console.log('═══════════════════════════════════════════');

        
        client.user.setPresence({
            activities: [{
                name: `{servers} sunucu | /yardım`,
                type: ActivityType.Watching,
            }],
            status: 'online',
        });

        
        botApi.start(client);

        
        
        
        await startRecovery(client);

        
        
        
        scheduleDailyBirthdays(client);
    },
};

function scheduleDailyBirthdays(client) {
    const runAt9AM = () => {
        const now = new Date();
        const next9AM = new Date(now);
        next9AM.setHours(9, 0, 0, 0);
        if (next9AM <= now) next9AM.setDate(next9AM.getDate() + 1);
        const delay = next9AM - now;

        setTimeout(() => {
            checkBirthdays(client).catch(console.error);
            setInterval(() => checkBirthdays(client).catch(console.error), 86400000);
        }, delay);
    };

    runAt9AM();
}
