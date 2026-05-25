const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const { formatDuration } = require('../../../utils/helpers');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setNameLocalizations({ tr: 'bot-bilgi' })
        .setDescription('Show bot information')
        .setDescriptionLocalizations({ tr: 'Bot bilgisi göster' }),
    cooldown: 10,
    async run(client, interaction, lang) {
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const embed = createEmbed({
            title: client.t(lang, 'commands.botinfo.title'),
            thumbnail: client.user.displayAvatarURL(),
            fields: [
                { name: `⏰ ${client.t(lang, 'commands.botinfo.uptime')}`, value: formatDuration(client.uptime), inline: true },
                { name: `🌐 ${client.t(lang, 'commands.botinfo.servers')}`, value: `${client.guilds.cache.size}`, inline: true },
                { name: `👥 ${client.t(lang, 'commands.botinfo.users')}`, value: `${client.users.cache.size}`, inline: true },
                { name: `💾 ${client.t(lang, 'commands.botinfo.memory')}`, value: `${memUsage} MB`, inline: true },
                { name: `📡 ${client.t(lang, 'commands.botinfo.ping')}`, value: `${client.ws.ping}ms`, inline: true },
                { name: '📦 Komut', value: `${client.slashCommands.size} slash`, inline: true },
                { name: '🔗 Linkler', value: `[Davet Et](${client.config.developer.invite}) • [Website](${client.config.developer.website}) • [GitHub](${client.config.developer.github}) • [Destek](${client.config.developer.support})`, inline: false },
            ],
            category: 'general',
        });

        await interaction.reply({ embeds: [embed] });
        logger.info(`Botinfo: ${interaction.user.tag} viewed bot info in ${interaction.guild.name}`, 'UTILITY');
    },
};
