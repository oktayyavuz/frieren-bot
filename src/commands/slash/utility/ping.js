const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Show bot latency')
        .setDescriptionLocalizations({ tr: 'Bot gecikmesini göster' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const start = Date.now();
        await interaction.deferReply();
        const latency = Date.now() - start;
        const ws = client.ws.ping;

        const status = ws < 100 ? '🟢' : ws < 200 ? '🟡' : '🔴';

        const embed = createEmbed({
            title: '🏓 Pong!',
            fields: [
                { name: '⏱️ Yanıt Süresi', value: `**${latency}ms**`, inline: true },
                { name: `${status} WebSocket`, value: `**${ws}ms**`, inline: true },
            ],
            category: 'utility',
        });

        await interaction.editReply({ embeds: [embed] });
        logger.info(`Ping: ${interaction.user.tag} — RTT ${latency}ms / WS ${ws}ms`, 'UTILITY');
    },
};
