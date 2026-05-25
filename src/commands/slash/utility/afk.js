const { SlashCommandBuilder } = require('discord.js');
const prisma = require('../../../database');
const { getUser } = require('../../../utils/helpers');
const logger = require('../../../utils/logger');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Go AFK')
        .setDescriptionLocalizations({ tr: 'AFK moduna geç' })
        .addStringOption(opt => opt.setName('reason').setNameLocalizations({ tr: 'sebep' }).setDescription('AFK reason').setDescriptionLocalizations({ tr: 'AFK sebebi' })),
    cooldown: 10,
    async run(client, interaction, lang) {
        const reason = interaction.options.getString('reason') || 'AFK';
        await getUser(interaction.user.id);

        await prisma.aFK.upsert({
            where: { userId: interaction.user.id },
            update: { reason, createdAt: new Date() },
            create: { userId: interaction.user.id, reason },
        });

        await interaction.reply(client.t(lang, 'commands.afk.set', { user: interaction.user.username, reason }));
        logger.info(`AFK: ${interaction.user.tag} set AFK in ${interaction.guild.name}`, 'UTILITY');
    },
};
