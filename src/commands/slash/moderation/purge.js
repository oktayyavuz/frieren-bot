const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setNameLocalizations({ tr: 'sil' })
        .setDescription('Bulk delete messages')
        .setDescriptionLocalizations({ tr: 'Toplu mesaj sil' })
        .addIntegerOption(opt => opt.setName('amount').setNameLocalizations({ tr: 'miktar' }).setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
        .addUserOption(opt => opt.setName('user').setNameLocalizations({ tr: 'kullanıcı' }).setDescription('Only delete from this user'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    cooldown: 5,
    async run(client, interaction, lang) {
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        await interaction.deferReply({ ephemeral: true });

        let messages = await interaction.channel.messages.fetch({ limit: amount });

        if (targetUser) {
            messages = messages.filter(m => m.author.id === targetUser.id);
        }

        
        const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;
        messages = messages.filter(m => m.createdTimestamp > twoWeeks);

        try {
            const deleted = await interaction.channel.bulkDelete(messages, true);
            logger.info(`Purge: ${interaction.user.tag} deleted ${deleted.size} messages in ${interaction.channel.name} (${interaction.guild.name})`, 'MOD');
            await interaction.editReply({
                embeds: [successEmbed(client.t(lang, 'commands.purge.success', { count: deleted.size }), null, 'moderation')],
            });
        } catch (err) {
            await interaction.editReply({
                embeds: [errorEmbed(`Hata: ${err.message}`)],
            });
        }
    },
};
