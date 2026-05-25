const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Bir dizi embed'i sayfalı olarak gösterir
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('discord.js').EmbedBuilder[]} pages
 * @param {number} timeout - ms cinsinden timeout (varsayılan 120s)
 */
async function paginate(interaction, pages, timeout = 120000) {
    if (pages.length === 0) return;
    if (pages.length === 1) {
        return interaction.editReply({ embeds: [pages[0]] });
    }

    let currentPage = 0;

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('page_first')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('page_prev')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('page_count')
            .setLabel(`1/${pages.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('page_next')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pages.length <= 1),
        new ButtonBuilder()
            .setCustomId('page_last')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(pages.length <= 1),
    );

    const msg = await interaction.editReply({
        embeds: [pages[0]],
        components: [buttons],
    });

    const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: timeout,
    });

    collector.on('collect', async (i) => {
        switch (i.customId) {
            case 'page_first': currentPage = 0; break;
            case 'page_prev': currentPage = Math.max(0, currentPage - 1); break;
            case 'page_next': currentPage = Math.min(pages.length - 1, currentPage + 1); break;
            case 'page_last': currentPage = pages.length - 1; break;
        }

        buttons.components[0].setDisabled(currentPage === 0);
        buttons.components[1].setDisabled(currentPage === 0);
        buttons.components[2].setLabel(`${currentPage + 1}/${pages.length}`);
        buttons.components[3].setDisabled(currentPage === pages.length - 1);
        buttons.components[4].setDisabled(currentPage === pages.length - 1);

        await i.update({ embeds: [pages[currentPage]], components: [buttons] });
    });

    collector.on('end', async () => {
        buttons.components.forEach(b => b.setDisabled(true));
        await msg.edit({ components: [buttons] }).catch(() => { });
    });
}

module.exports = { paginate };
