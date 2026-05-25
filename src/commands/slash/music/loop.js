const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setNameLocalizations({ tr: 'döngü' })
        .setDescription('Toggle loop mode for the current song')
        .setDescriptionLocalizations({ tr: 'Mevcut şarkı için döngü modunu aç/kapat' }),
    cooldown: 2,
    async run(client, interaction, lang) {
        const queue = client.musicQueues.get(interaction.guildId);

        if (!queue?.currentTrack) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [{ type: 17, accent_color: config.colors.warning, components: [{ type: 10, content: '## ⚠️ Şu an çalan bir şarkı yok!' }] }],
                ephemeral: true,
            });
        }

        const nowLooping = queue.toggleLoop();
        const icon = nowLooping ? '🔁' : '➡️';
        const statusText = nowLooping
            ? `## 🔁 Döngü Açık\n**${queue.currentTrack.title}** sürekli tekrarlanacak.`
            : `## ➡️ Döngü Kapalı\nŞarkılar normal sırayla çalacak.`;

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: nowLooping ? config.colors.primary : config.colors.warning,
                components: [{ type: 10, content: statusText }],
            }],
        });
    },
};
