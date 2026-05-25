const fs = require('fs');
const path = require('path');

/**
 * Event handler'ları recursive olarak yükler
 */
async function loadEvents(client) {
    const eventsDir = path.join(__dirname, '..', 'events');
    if (!fs.existsSync(eventsDir)) {
        console.log('[HANDLER] Event klasörü bulunamadı, atlanıyor...');
        return;
    }

    let count = 0;

    function readEvents(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                readEvents(fullPath);
            } else if (entry.name.endsWith('.js')) {
                try {
                    delete require.cache[require.resolve(fullPath)];
                    const event = require(fullPath);

                    if (!event.name || !event.execute) {
                        console.warn(`[EVENT] ⚠️ ${entry.name} dosyasında name veya execute eksik.`);
                        continue;
                    }

                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(client, ...args));
                    } else {
                        client.on(event.name, (...args) => event.execute(client, ...args));
                    }

                    count++;
                    console.log(`[EVENT] ✅ ${event.name} eventi yüklendi.`);
                } catch (err) {
                    console.error(`[EVENT] ❌ ${fullPath} yüklenemedi:`, err.message);
                }
            }
        }
    }

    readEvents(eventsDir);
    console.log(`[HANDLER] Toplam ${count} event yüklendi.`);
}

module.exports = { loadEvents };
