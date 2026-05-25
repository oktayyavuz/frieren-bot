const fs = require('fs');
const path = require('path');

/**
 * Prefix komutlarını yükler
 */
async function loadPrefixCommands(client) {
    const prefixDir = path.join(__dirname, '..', 'commands', 'prefix');
    if (!fs.existsSync(prefixDir)) {
        console.log('[HANDLER] Prefix komut klasörü bulunamadı, atlanıyor...');
        return;
    }

    let count = 0;

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

                    if (!command.name || !command.run) {
                        console.warn(`[PREFIX] ⚠️ ${entry.name} dosyasında name veya run eksik.`);
                        continue;
                    }

                    client.prefixCommands.set(command.name, command);
                    if (command.aliases) {
                        for (const alias of command.aliases) {
                            client.prefixCommands.set(alias, command);
                        }
                    }

                    count++;
                    console.log(`[PREFIX] ✅ ${command.name} yüklendi.`);
                } catch (err) {
                    console.error(`[PREFIX] ❌ ${fullPath} yüklenemedi:`, err.message);
                }
            }
        }
    }

    readCommands(prefixDir);
    console.log(`[HANDLER] Toplam ${count} prefix komut yüklendi.`);
}

module.exports = { loadPrefixCommands };
