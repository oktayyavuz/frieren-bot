const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setNameLocalizations({ tr: 'şimdi' })
        .setDescription('Show the currently playing song')
        .setDescriptionLocalizations({ tr: 'Şu an çalan şarkıyı göster' }),
    cooldown: 3,
    async run(client, interaction, lang) {
        const queue = client.musicQueues.get(interaction.guildId);

        if (!queue?.currentTrack) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [{ type: 17, accent_color: config.colors.warning, components: [{ type: 10, content: '## 🎵 Şu an çalan bir şarkı yok!' }] }],
                ephemeral: true,
            });
        }

        const track = queue.currentTrack;
        const statusEmoji = queue.paused ? '⏸️' : '▶️';
        const queueInfo = queue.tracks.length > 0
            ? `\n📋 Kuyrukta **${queue.tracks.length}** şarkı daha var`
            : '\n✅ Kuyrukta başka şarkı yok';

        const textContent = [
            `## ${statusEmoji} Şu An Çalıyor`,
            '',
            `**${track.title}**`,
            `⏱ \`${track.duration || '?'}\`  •  🔊 \`%${queue.volume}\``,
            `👤 İstekte Bulunan: ${track.requestedBy?.toString() ?? 'Bilinmiyor'}`,
            queueInfo,
        ].join('\n');

        const container = {
            type: 17,
            accent_color: config.colors.primary,
            components: track.thumbnail
                ? [{ type: 9, components: [{ type: 10, content: textContent }], accessory: { type: 11, media: { url: track.thumbnail } } }]
                : [{ type: 10, content: textContent }],
        };

        await interaction.reply({ flags: FLAGS_V2, components: [container] });
    },
};
