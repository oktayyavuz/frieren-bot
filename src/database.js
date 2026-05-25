const { PrismaClient } = require('@prisma/client');
const logger = require('./utils/logger');

const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ],
});


prisma.$on('info', (e) => logger.info(e.message, 'DB'));
prisma.$on('warn', (e) => logger.warn(e.message, 'DB'));
prisma.$on('error', (e) => logger.error(e.message, 'DB'));


process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = prisma;
