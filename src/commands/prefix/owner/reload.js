module.exports = {
    name: 'reload',
    aliases: ['rl'],
    ownerOnly: true,
    async run(client, message, args, lang) {
        try {
            client.slashCommands.clear();
            client.prefixCommands.clear();

            const { loadSlashCommands } = require('../../handlers/commandHandler');
            const { loadPrefixCommands } = require('../../handlers/prefixHandler');

            await loadPrefixCommands(client);
            await loadSlashCommands(client);

            client.locales = {};
            client.loadLocales();

            await message.reply('✅ Tüm komutlar ve dil dosyaları yeniden yüklendi!');
        } catch (err) {
            await message.reply(`❌ Hata: ${err.message}`);
        }
    },
};
