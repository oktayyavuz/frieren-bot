require('dotenv').config();

module.exports = {
    
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    defaultPrefix: process.env.DEFAULT_PREFIX || '!',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'tr',
    botName: process.env.BOT_NAME || 'Frieren',
    developer: {
        name: 'Pc',
        github: 'https://github.com/oktayyavuz', 
        website: 'https://frieren.oktaydev.com',
        support: 'https://discord.gg/dvCKjxHn35',
        invite: 'https://discord.com/api/oauth2/authorize?client_id=1226773465499959307&permissions=8&scope=bot%20applications.commands',
    },

    
    databaseUrl: process.env.DATABASE_URL,

    
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    port: parseInt(process.env.PORT) || 3000,

    
    colors: {
        primary: 0x9B59B6,    
        success: 0x2ECC71,    
        error: 0xE74C3C,      
        warning: 0xF39C12,    
        info: 0x3498DB,       
        economy: 0xF1C40F,    
        level: 0x1ABC9C,      
        moderation: 0xE67E22,  
    },

    
    economy: {
        currencyName: 'Okane',
        currencyEmoji: '💰',
        dailyAmount: { min: 100, max: 300 },
        weeklyAmount: { min: 500, max: 1500 },
        hourlyAmount: { min: 20, max: 80 },
        workAmount: { min: 50, max: 200 },
        crimeAmount: { min: 100, max: 500 },
        crimeFailChance: 0.4,
        robFailChance: 0.5,
        robMaxPercent: 0.3,
        startBalance: 0,
    },

    
    leveling: {
        xpPerMessage: { min: 15, max: 25 },
        xpPerVoiceMinute: 5,
        xpCooldown: 60000, 
        levelUpFormula: (level) => 5 * (level ** 2) + 50 * level + 100,
    },

    
    moderation: {
        defaultSpamLimit: 5,       
        defaultSpamInterval: 5000, 
        defaultCapsPercent: 70,    
        defaultCapsMinLength: 10,  
    },

    
    antiRaid: {
        joinLimit: 10,         
        joinInterval: 10000,   
        action: 'kick',        
    },

    
    statsUpdateInterval: 300000, 

    
    emojis: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        loading: '⏳',
        money: '💰',
        xp: '✨',
        level: '🏆',
        mod: '🛡️',
        music: '🎵',
        ticket: '🎫',
        giveaway: '🎉',
        afk: '💤',
        info: 'ℹ️',
        crown: '👑',
        star: '⭐',
    },

    
    embeds: {
        defaultImage: 'https://media.giphy.com/media/jERqJkomk4uWdYsNk6/giphy.gif',
        help: 'https://media.giphy.com/media/eb4fOYtSa27H1GOO4E/giphy.gif',
        economy: 'https://media.giphy.com/media/DObgk0NPQh57OBQmzX/giphy.gif',
        leveling: 'https://media.giphy.com/media/QtZSl6mcqfmvCBI2cb/giphy.gif',
        moderation: 'https://media.giphy.com/media/jtDEDcqMjDVODssiEs/giphy.gif',
        games: 'https://media.giphy.com/media/shkh5vfrJ56BAoeWqt/giphy.gif',
        general: 'https://media.giphy.com/media/jERqJkomk4uWdYsNk6/giphy.gif',
        utility: 'https://media.giphy.com/media/eb4fOYtSa27H1GOO4E/giphy.gif',
        ticket: 'https://media.giphy.com/media/eb4fOYtSa27H1GOO4E/giphy.gif',
        admin: 'https://media.giphy.com/media/DObgk0NPQh57OBQmzX/giphy.gif',
        giveaway: 'https://media.giphy.com/media/eb4fOYtSa27H1GOO4E/giphy.gif',
        success: 'https://media.giphy.com/media/jERqJkomk4uWdYsNk6/giphy.gif',
        error: 'https://media.giphy.com/media/eb4fOYtSa27H1GOO4E/giphy.gif'
    }
};
