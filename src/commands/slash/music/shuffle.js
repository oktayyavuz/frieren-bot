const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

function container(color, content) {
    return { type: 17, accent_color: color, components: [{ type: 10, content }] };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setNameLocalizations({ tr: 'karıştır' })
        .setDescription('Shuffle the music queue')
        .setDescriptionLocalizations({ tr: 'Müzik kuyruğunu karıştır' }),
    cooldown: 3,
    async run(client, interaction) {
        const queue = client.musicQueues.get(interaction.guildId);

        if (!queue?.currentTrack && !queue?.tracks?.length) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.warning, '## ⚠️ Kuyrukta şarkı yok!')],
                ephemeral: true,
            });
        }

        if (queue.tracks.length < 2) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.warning, '## ⚠️ Karıştırmak için en az 2 şarkı olmalı!')],
                ephemeral: true,
            });
        }

        
        const arr = queue.tracks;
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        await interaction.reply({
            flags: FLAGS_V2,
            components: [container(
                config.colors.primary,
                `## 🔀 Kuyruk Karıştırıldı\n**${arr.length}** şarkı rastgele sıraya alındı.\n\n-# 👤 ${interaction.user.toString()}`,
            )],
        });
    },
};
