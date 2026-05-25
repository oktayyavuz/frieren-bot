module.exports = {
    name: 'eval',
    aliases: ['e'],
    ownerOnly: true,
    async run(client, message, args, lang) {
        if (args.length === 0) return message.reply('❌ Kod giriniz!');

        const code = args.join(' ');
        try {
            let result = eval(code);
            if (result instanceof Promise) result = await result;
            if (typeof result !== 'string') result = require('util').inspect(result, { depth: 2 });

            if (result.length > 1900) result = result.slice(0, 1900) + '...';

            await message.reply(`\`\`\`js\n${result}\n\`\`\``);
        } catch (err) {
            await message.reply(`\`\`\`js\n${err.message}\n\`\`\``);
        }
    },
};
