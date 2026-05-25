const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setNameLocalizations({ tr: 'atla' })
        .setDescription('Skip the current song')
        .setDescriptionLocalizations({ tr: 'Mevcut şarkıyı atla' }),
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

        const skipped = queue.currentTrack.title;
        queue.skip();

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.primary,
                components: [{ type: 10, content: `## ⏭️ Atlandı\n**${skipped}**\n\n-# 👤 ${interaction.user.toString()}` }],
            }],
        });
    },
};
