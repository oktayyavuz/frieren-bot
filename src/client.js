const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./utils/logger');

class FrierenClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildPresences,
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User,
                Partials.GuildMember,
            ],
        });

        this.slashCommands = new Collection();
        this.prefixCommands = new Collection();
        this.cooldowns = new Collection();
        this.snipes = new Collection();
        this.antiSpamMap = new Collection();
        this.voiceXpIntervals = new Collection();
        this.musicQueues = new Map();

        this.config = config;

        this.locales = {};
        this.loadLocales();
    }

    loadLocales() {
        const localesDir = path.join(__dirname, 'locales');
        if (!fs.existsSync(localesDir)) return;

        const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const lang = file.replace('.json', '');
            try {
                this.locales[lang] = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf-8'));
                logger.info(`${lang} dil dosyası yüklendi.`, 'LOCALE');
            } catch (err) {
                logger.error(`${lang} dosyası yüklenemedi: ${err.message}`, 'LOCALE');
            }
        }
    }

    /**
     * Çeviri al
     * @param {string} lang - Dil kodu (tr, en)
     * @param {string} key - Çeviri anahtarı (dot notation: "commands.balance.title")
     * @param {Object} replacements - Değişken değiştirmeleri ({ user: "Ali", amount: 100 })
     */
    t(lang, key, replacements = {}) {
        const locale = this.locales[lang] || this.locales[config.defaultLanguage] || {};
        const keys = key.split('.');
        let value = locale;

        for (const k of keys) {
            value = value?.[k];
        }

        if (typeof value !== 'string') {
            let fallback = this.locales[config.defaultLanguage];
            for (const k of keys) {
                fallback = fallback?.[k];
            }
            value = typeof fallback === 'string' ? fallback : key;
        }

        for (const [rKey, rValue] of Object.entries(replacements)) {
            value = value.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(rValue));
        }

        return value;
    }
}

module.exports = FrierenClient;
