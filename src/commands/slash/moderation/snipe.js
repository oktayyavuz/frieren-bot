const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Show the last deleted message')
        .setDescriptionLocalizations({ tr: 'Silinen son mesajı göster' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const snipe = client.snipes.get(interaction.channel.id);

        if (!snipe) {
            return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.snipe.noSnipe'))], ephemeral: true });
        }

        const embed = createEmbed({
            title: client.t(lang, 'commands.snipe.title'),
            description: snipe.content || '*İçerik yok*',
            fields: [ 
                { name: client.t(lang, 'commands.snipe.deletedBy'), value: snipe.author, inline: true },
                { name: '⏰', value: `<t:${Math.floor(snipe.timestamp / 1000)}:R>`, inline: true },
            ],
            category: 'moderation',
        });

        if (snipe.attachmentUrl) {
            embed.setImage(snipe.attachmentUrl);
        }

        await interaction.reply({ embeds: [embed] });
        logger.info(`Snipe: ${interaction.user.tag} sniped a message in ${interaction.channel.name} (${interaction.guild.name})`, 'MOD');
    },
};
