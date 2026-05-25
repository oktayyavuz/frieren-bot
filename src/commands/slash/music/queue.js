const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setNameLocalizations({ tr: 'kuyruk' })
        .setDescription('Show the music queue')
        .setDescriptionLocalizations({ tr: 'Müzik kuyruğunu göster' }),
    cooldown: 3,
    async run(client, interaction, lang) {
        const queue = client.musicQueues.get(interaction.guildId);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [{
                    type: 17,
                    accent_color: config.colors.warning,
                    components: [{ type: 10, content: '## 🎵 Müzik Kuyruğu\nŞu an çalan bir şarkı yok.' }],
                }],
            });
        }

        const current = queue.currentTrack;
        const statusIcon = queue.paused ? '⏸' : '▶️';

        let content = `## 🎵 Müzik Kuyruğu\n\n`;
        content += `**${statusIcon} Şu An Çalıyor:**\n`;
        content += `🎵 **${current.title}** \`${current.duration || '?'}\`\n`;
        content += `👤 ${current.requestedBy}\n`;

        if (queue.tracks.length > 0) {
            content += `\n**📋 Sıradakiler (${queue.tracks.length} şarkı):**\n`;
            const shown = queue.tracks.slice(0, 10);
            content += shown.map((t, i) =>
                `\`${i + 1}.\` **${t.title}** \`${t.duration || '?'}\` — 👤 ${t.requestedBy}`
            ).join('\n');
            if (queue.tracks.length > 10) {
                content += `\n*...ve ${queue.tracks.length - 10} şarkı daha*`;
            }
        } else {
            content += `\n*Kuyrukta başka şarkı yok.*`;
        }

        content += `\n\n🔊 Ses: **%${queue.volume}**  •  ${queue.paused ? '⏸ Duraklatıldı' : '▶️ Çalıyor'}`;

        const container = {
            type: 17,
            accent_color: config.colors.primary,
            components: current.thumbnail
                ? [{
                    type: 9,
                    components: [{ type: 10, content }],
                    accessory: { type: 11, media: { url: current.thumbnail } },
                }]
                : [{ type: 10, content }],
        };

        await interaction.reply({ flags: FLAGS_V2, components: [container] });
    },
};
