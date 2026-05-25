const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setNameLocalizations({ tr: 'durdur' })
        .setDescription('Stop music and clear the queue')
        .setDescriptionLocalizations({ tr: 'Müziği durdur ve kuyruğu temizle' }),
    cooldown: 2,
    async run(client, interaction, lang) {
        const queue = client.musicQueues.get(interaction.guildId);

        if (!queue) {
            return interaction.reply({
                flags: FLAGS_V2,
                components: [{ type: 17, accent_color: config.colors.warning, components: [{ type: 10, content: '## ⚠️ Şu an çalan bir şey yok!' }] }],
                ephemeral: true,
            });
        }

        queue.destroy();
        client.musicQueues.delete(interaction.guildId);

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.error,
                components: [{ type: 10, content: `## ⏹️ Durduruldu\nMüzik durduruldu ve kuyruk temizlendi.\n\n-# 👤 ${interaction.user.toString()}` }],
            }],
        });
    },
};
