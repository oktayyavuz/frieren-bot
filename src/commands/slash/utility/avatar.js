const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setNameLocalizations({ tr: 'avatar' })
        .setDescription('Show user avatar')
        .setDescriptionLocalizations({ tr: 'Kullanıcının avatarını göster' })
        .addUserOption(opt => opt.setName('user').setDescription('User')),
    cooldown: 3,
    async run(client, interaction, lang) {
        const user = interaction.options.getUser('user') || interaction.user;
        const embed = createEmbed({
            title: `🖼️ ${user.username}`,
            image: user.displayAvatarURL({ dynamic: true, size: 1024 }),
            category: 'utility',
        });
        await interaction.reply({ embeds: [embed] });
        logger.info(`Avatar: ${interaction.user.tag} viewed avatar of ${user.tag} in ${interaction.guild.name}`, 'UTILITY');
    },
};
