const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const { getGuildUser } = require('../../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setNameLocalizations({ tr: 'envanter' })
        .setDescription('Show your inventory')
        .setDescriptionLocalizations({ tr: 'Envanterini göster' })
        .addUserOption(opt => opt.setName('user').setDescription('User')),
    cooldown: 5,
    async run(client, interaction, lang) {
        const target = interaction.options.getUser('user') || interaction.user;
        const guildUser = await getGuildUser(target.id, interaction.guildId);

        let inventory;
        try {
            inventory = JSON.parse(guildUser.inventory || '[]');
        } catch (e) {
            inventory = [];
        }

        if (inventory.length === 0) {
            return interaction.reply({ embeds: [createEmbed({ description: client.t(lang, 'commands.inventory.empty') })] });
        }

        
        const grouped = {};
        for (const item of inventory) {
            if (!grouped[item.name]) grouped[item.name] = 0;
            grouped[item.name]++;
        }

        const description = Object.entries(grouped)
            .map(([name, count]) => `🔹 **${name}** x${count}`)
            .join('\n');

        const embed = createEmbed({
            title: `${client.t(lang, 'commands.inventory.title')} — ${target.username}`,
            description,
            thumbnail: target.displayAvatarURL({ dynamic: true }),
        });

        await interaction.reply({ embeds: [embed] });
    },
};
