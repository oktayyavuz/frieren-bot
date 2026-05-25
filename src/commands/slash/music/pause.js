const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setNameLocalizations({ tr: 'duraklat' })
        .setDescription('Pause the current song')
        .setDescriptionLocalizations({ tr: 'Mevcut şarkıyı duraklat' }),
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

        if (queue.paused) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [{ type: 17, accent_color: config.colors.warning, components: [{ type: 10, content: '## ⚠️ Şarkı zaten duraklatılmış!\n`/devam` ile devam ettirebilirsiniz.' }] }],
                ephemeral: true,
            });
        }

        queue.pause();

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.warning,
                components: [{ type: 10, content: `## ⏸️ Duraklatıldı\n**${queue.currentTrack.title}**\n\n-# 👤 ${interaction.user.toString()}` }],
            }],
        });
    },
};
