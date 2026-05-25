const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setNameLocalizations({ tr: 'ses' })
        .setDescription('Set the playback volume (1–100)')
        .setDescriptionLocalizations({ tr: 'Ses seviyesini ayarla (1–100)' })
        .addIntegerOption(opt => opt
            .setName('level')
            .setNameLocalizations({ tr: 'seviye' })
            .setDescription('Volume level 1–100')
            .setDescriptionLocalizations({ tr: 'Ses seviyesi 1–100' })
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)),
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

        const level = interaction.options.getInteger('level');
        queue.setVolume(level);

        const bar = buildBar(level);

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.primary,
                components: [{ type: 10, content: `## 🔊 Ses Seviyesi\n${bar} **%${level}**\n\n-# 👤 ${interaction.user.toString()}` }],
            }],
        });
    },
};

function buildBar(vol) {
    const filled = Math.round(vol / 10);
    return '▓'.repeat(filled) + '░'.repeat(10 - filled);
}
