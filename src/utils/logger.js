const winston = require('winston');
const chalk = require('chalk');
const path = require('path');


const customFormat = winston.format.printf(({ level, message, timestamp, label }) => {
    let levelStr = level.toUpperCase();
    
    
    switch(level) {
        case 'info': levelStr = chalk.blue(levelStr); break;
        case 'warn': levelStr = chalk.yellow(levelStr); break;
        case 'error': levelStr = chalk.red(levelStr); break;
        case 'debug': levelStr = chalk.magenta(levelStr); break;
    }

    const timestampStr = chalk.gray(timestamp);
    const labelStr = label ? chalk.cyan(`[${label}]`) : '';
    
    return `${timestampStr} ${labelStr} ${levelStr}: ${message}`;
});

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        customFormat
    ),
    defaultMeta: { service: 'frieren-bot' },
    transports: [
        
        new winston.transports.Console(),
        
        new winston.transports.File({ 
            filename: path.join(process.cwd(), 'logs', 'error.log'), 
            level: 'error',
            format: fileFormat 
        }),
        new winston.transports.File({ 
            filename: path.join(process.cwd(), 'logs', 'combined.log'),
            format: fileFormat 
        })
    ]
});


module.exports = {
    info: (message, label) => logger.info(message, { label }),
    warn: (message, label) => logger.warn(message, { label }),
    error: (message, label) => logger.error(message, { label }),
    debug: (message, label) => logger.debug(message, { label }),
    stream: {
        write: (message) => logger.info(message.trim())
    }
};
