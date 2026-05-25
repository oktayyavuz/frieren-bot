const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../../config');

/**
 * Slash komutlarını recursive olarak yükler ve Discord API'ye kaydeder
 */
async function loadSlashCommands(client) {
    const commandsDir = path.join(__dirname, '..', 'commands', 'slash');
    if (!fs.existsSync(commandsDir)) {
        console.log('[HANDLER] Slash komut klasörü bulunamadı, atlanıyor...');
        return;
    }

    const commandData = [];

    function readCommands(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                readCommands(fullPath);
            } else if (entry.name.endsWith('.js')) {
                try {
                    
                    delete require.cache[require.resolve(fullPath)];
                    const command = require(fullPath);

                    if (!command.data || !command.run) {
                        console.warn(`[HANDLER] ⚠️ ${entry.name} dosyasında data veya run eksik, atlanıyor.`);
                        continue;
                    }

                    
                    const category = path.relative(commandsDir, dir) || 'general';
                    command.category = category;

                    client.slashCommands.set(command.data.name, command);
                    commandData.push(command.data.toJSON());
                    console.log(`[SLASH] ✅ /${command.data.name} (${category}) yüklendi.`);
                } catch (err) {
                    console.error(`[HANDLER] ❌ ${fullPath} yüklenemedi:`, err.message);
                }
            }
        }
    }

    readCommands(commandsDir);
    console.log(`[HANDLER] Toplam ${commandData.length} slash komut yüklendi.`);

    
    try {
        const rest = new REST({ version: '10' }).setToken(config.token);
        console.log('[HANDLER] Slash komutları Discord API\'ye kaydediliyor...');

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commandData }
        );

        console.log('[HANDLER] ✅ Slash komutlar başarıyla kaydedildi!');
    } catch (err) {
        console.error('[HANDLER] ❌ Slash komut kayıt hatası:', err.message);
    }
}

module.exports = { loadSlashCommands };
