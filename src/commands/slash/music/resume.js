const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setNameLocalizations({ tr: 'devam' })
        .setDescription('Resume a paused song')
        .setDescriptionLocalizations({ tr: 'Duraklatılmış şarkıyı devam ettir' }),
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

        if (!queue.paused) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [{ type: 17, accent_color: config.colors.warning, components: [{ type: 10, content: '## ⚠️ Şarkı zaten çalıyor!\n`/duraklat` ile duraklatabilirsiniz.' }] }],
                ephemeral: true,
            });
        }

        queue.resume();

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.success,
                components: [{ type: 10, content: `## ▶️ Devam Ediyor\n**${queue.currentTrack.title}**\n\n-# 👤 ${interaction.user.toString()}` }],
            }],
        });
    },
};
