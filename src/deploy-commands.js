const { loadSlashCommands } = require('./handlers/commandHandler');
const FrierenClient = require('./client');

const client = new FrierenClient();

async function deploy() {
    console.log('[DEPLOY] Komutlar yükleniyor...');
    await loadSlashCommands(client);
    console.log('[DEPLOY] İşlem tamamlandı.');
    
    
    setTimeout(() => {
        process.exit(0);
    }, 1000);
}

deploy().catch(err => {
    console.error('[DEPLOY] Hata:', err);
    process.exit(1);
});
