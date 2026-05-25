const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const MusicQueue = require('../../../systems/music/MusicQueue');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

function errorContainer(msg) {
    return { type: 17, accent_color: config.colors.error, components: [{ type: 10, content: `## ❌ Hata\n${msg}` }] };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setNameLocalizations({ tr: 'çal' })
        .setDescription('Play a song — search YouTube or paste a URL')
        .setDescriptionLocalizations({ tr: 'Bir şarkı çal — YouTube\'da ara veya URL yapıştır' })
        .addStringOption(opt => opt
            .setName('query')
            .setNameLocalizations({ tr: 'sorgu' })
            .setDescription('Song name or YouTube URL')
            .setDescriptionLocalizations({ tr: 'Şarkı adı veya YouTube URL' })
            .setRequired(true)),
    cooldown: 3,
    async run(client, interaction, lang) {
        await interaction.deferReply();

        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member?.voice?.channel;

        if (!voiceChannel) {
            return interaction.editReply({ flags: FLAGS_V2, components: [errorContainer('Bir ses kanalında olmanız gerekiyor!')] });
        }

        const perms = voiceChannel.permissionsFor(interaction.guild.members.me);
        if (!perms.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
            return interaction.editReply({ flags: FLAGS_V2, components: [errorContainer('Ses kanalına bağlanma veya konuşma yetkim yok!')] });
        }

        try {
            let queue = client.musicQueues.get(interaction.guildId);

            if (!queue) {
                queue = new MusicQueue({
                    guildId: interaction.guildId,
                    voiceChannel,
                    textChannel: interaction.channel,
                });
                await queue.connect();
                client.musicQueues.set(interaction.guildId, queue);

                
                const origDestroy = queue.destroy.bind(queue);
                queue.destroy = () => { origDestroy(); client.musicQueues.delete(interaction.guildId); };
            } else if (queue.voiceChannel.id !== voiceChannel.id) {
                return interaction.editReply({
                    flags: FLAGS_V2,
                    components: [{
                        type: 17, accent_color: config.colors.warning,
                        components: [{ type: 10, content: `## ⚠️ Farklı Kanal\nBot zaten <#${queue.voiceChannel.id}> kanalında!\nO kanala katılın veya önce \`/stop\` komutunu kullanın.` }],
                    }],
                });
            }

            const isUrl = /^https?:\/\//.test(query);

            if (isUrl) {
                const { track, startedNow } = await queue.addTrack(query, interaction.user);
                const statusLine = startedNow ? '🎵 **Şimdi Çalıyor**' : `📋 **Kuyruğa Eklendi** — ${queue.tracks.length}. sırada`;

                const textContent = `${statusLine}\n\n**${track.title}**\n⏱ \`${track.duration || '?'}\`  •  👤 ${interaction.user.toString()}`;

                const container = {
                    type: 17,
                    accent_color: config.colors.primary,
                    components: track.thumbnail
                        ? [{ type: 9, components: [{ type: 10, content: textContent }], accessory: { type: 11, media: { url: track.thumbnail } } }]
                        : [{ type: 10, content: textContent }],
                };

                await interaction.editReply({ flags: FLAGS_V2, components: [container] });
                logger.info(`Music: ${interaction.user.tag} played "${track.title}" in ${interaction.guild.name}`, 'MUSIC');
            } else {
                const ytdlp = require('yt-dlp-exec');
                const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

                const result = await ytdlp(`ytsearch5:${query}`, {
                    dumpSingleJson: true,
                    noWarnings: true,
                    noCheckCertificates: true,
                    preferFreeFormats: true,
                    flatPlaylist: true,
                    extractorArgs: 'youtube:player_client=ios,web',
                });

                const entries = result.entries || (result.url ? [result] : []);
                if (!entries || entries.length === 0) {
                    return interaction.editReply({ flags: FLAGS_V2, components: [errorContainer('Aradığınız şarkı bulunamadı!')] });
                }

                function _fmt(seconds) {
                    const h = Math.floor(seconds / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const s = Math.floor(seconds % 60);
                    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    return `${m}:${String(s).padStart(2, '0')}`;
                }

                const tracks = entries.slice(0, 5).map(entry => ({
                    title: entry.title || 'Bilinmeyen',
                    url: entry.webpage_url || entry.url,
                    duration: entry.duration ? _fmt(entry.duration) : 'Canlı',
                    durationSec: entry.duration || 0,
                    thumbnail: entry.thumbnail || null,
                }));

                if (!client.pendingSearches) client.pendingSearches = new Map();
                const searchId = interaction.id;
                client.pendingSearches.set(searchId, {
                    tracks,
                    voiceChannel,
                    textChannel: interaction.channel,
                    user: interaction.user,
                });

                setTimeout(() => {
                    if (client.pendingSearches.has(searchId)) {
                        client.pendingSearches.delete(searchId);
                    }
                }, 60000);

                const menu = new StringSelectMenuBuilder()
                    .setCustomId(`music_select_${searchId}`)
                    .setPlaceholder('Lütfen bir şarkı seçin...')
                    .addOptions(tracks.map((t, idx) => ({
                        label: t.title.substring(0, 100),
                        description: `Süre: ${t.duration}`,
                        value: String(idx),
                    })));

                const row = new ActionRowBuilder().addComponents(menu);

                const textContent = [
                    `## 🔍 Arama Sonuçları: "${query}"`,
                    '',
                    tracks.map((t, idx) => `**${idx + 1}.** ${t.title} \`[${t.duration}]\``).join('\n'),
                    '',
                    '-# Lütfen oynamasını istediğiniz parçayı aşağıdaki menüden seçin.'
                ].join('\n');

                const container = {
                    type: 17,
                    accent_color: config.colors.primary,
                    components: [{ type: 10, content: textContent }]
                };

                await interaction.editReply({
                    flags: FLAGS_V2,
                    components: [container, row]
                });
            }
        } catch (err) {
            logger.error(`Music play error: ${err.message}`, 'MUSIC');
            await interaction.editReply({ flags: FLAGS_V2, components: [errorContainer(err.message)] });
        }
    },
};
