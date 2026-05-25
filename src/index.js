require('dotenv').config();

require('events').EventEmitter.defaultMaxListeners = 25;

const FrierenClient = require('./client');
const { loadSlashCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { loadPrefixCommands } = require('./handlers/prefixHandler');
const prisma = require('./database');
const logger = require('./utils/logger');
const botApi = require('./api/server');

const client = new FrierenClient();




async function start() {
    logger.info('═══════════════════════════════════════════', 'SYSTEM');
    logger.info(`  ${client.config.botName} Bot - Başlatılıyor...`, 'SYSTEM');
    logger.info('═══════════════════════════════════════════', 'SYSTEM');

    
    try {
        await prisma.$connect();
        logger.info('✅ Veritabanı bağlantısı başarılı.', 'DB');
    } catch (err) {
        logger.error('❌ Veritabanı bağlantı hatası: ' + err.message, 'DB');
        process.exit(1);
    }

    
    await loadEvents(client);
    await loadPrefixCommands(client);
    await loadSlashCommands(client);

    
    await client.login(client.config.token);
}




process.on('uncaughtException', (err) => {
    logger.error('Yakalanmamış hata:', 'FATAL');
    console.error(err);
});

process.on('unhandledRejection', (err) => {
    logger.error('İşlenmemiş promise reddi:', 'FATAL');
    console.error(err);
});




async function gracefulShutdown(signal) {
    logger.info(`${signal} sinyali alındı. Kapatılıyor...`, 'SHUTDOWN');

    try {
        
        await prisma.$disconnect();
        logger.info('Veritabanı bağlantısı kapatıldı.', 'SHUTDOWN');

        
        botApi.stop();

        
        if (client) client.destroy();
        logger.info('Discord bağlantısı kapatıldı.', 'SHUTDOWN');
    } catch (err) {
        logger.error('Kapatma hatası: ' + err.message, 'SHUTDOWN');
    }

    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


start().catch((err) => {
    logger.error('Başlatma sırasında kritik hata: ' + err.message, 'SYSTEM');
    console.error(err);
});
