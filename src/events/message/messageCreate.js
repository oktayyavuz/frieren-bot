const { getGuildSettings, getGuildUser } = require('../../utils/helpers');
const { processAutomod } = require('../../systems/automod');
const { processLeveling } = require('../../systems/leveling');
const { processAfkCheck } = require('../../systems/afk');
const { processCounting } = require('../../systems/counting');
const { processWordChain } = require('../../systems/wordChain');
const prisma = require('../../database');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        
        if (message.author.bot) return;
        
        if (!message.guild) return;

        const settings = await getGuildSettings(message.guild.id);
        const lang = settings.language;

        
        
        
        if (settings.moderationEnabled && settings.automodEnabled) {
            const blocked = await processAutomod(client, message, settings);
            if (blocked) return; 
        }

        
        
        
        await processAfkCheck(client, message, lang);

        
        
        
        if (settings.levelingEnabled) {
            await processLeveling(client, message, settings);
        }

        
        
        
        await processCounting(client, message);

        
        
        
        await processWordChain(client, message);

        
        
        
        const prefix = settings.prefix || client.config.defaultPrefix;
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.prefixCommands.get(commandName);
            if (!command) return;

            
            if (command.ownerOnly) {
                
                const app = await client.application.fetch();
                if (message.author.id !== app.owner?.id) return;
            }

            try {
                await command.run(client, message, args, lang);
            } catch (err) {
                console.error(`[PREFIX] ${commandName} hatası:`, err);
                message.reply('❌ Komut çalıştırılırken bir hata oluştu!').catch(() => { });
            }
        }
    },
};
