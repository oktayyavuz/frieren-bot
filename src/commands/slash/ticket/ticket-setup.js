const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, successEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setNameLocalizations({ tr: 'ticket-kur' })
        .setDescription('Setup the ticket system')
        .setDescriptionLocalizations({ tr: 'Ticket sistemini kur' })
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel for ticket panel').setRequired(true))
        .addStringOption(opt => opt.setName('title').setDescription('Panel title'))
        .addStringOption(opt => opt.setName('description').setDescription('Panel description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 30,
    async run(client, interaction, lang) {
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title') || client.t(lang, 'systems.ticket.panelTitle');
        const description = interaction.options.getString('description') || client.t(lang, 'systems.ticket.panelDescription');

        
        let category = await prisma.ticketCategory.findFirst({ where: { guildId: interaction.guildId } });
        if (!category) {
            category = await prisma.ticketCategory.create({
                data: { guildId: interaction.guildId, name: 'Genel', emoji: '📩' },
            });
        }

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ticket_create_${category.id}`)
                .setLabel(client.t(lang, 'systems.ticket.createButton'))
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩'),
        );

        const embed = createEmbed({
            title,
            description,
            color: client.config.colors.primary,
            category: 'ticket',
        });

        await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed), button] });
        logger.info(`Ticket Setup: ${interaction.user.tag} set up ticket system in ${interaction.guild.name}`, 'TICKET');
        await interaction.reply({ embeds: [successEmbed('Ticket paneli oluşturuldu!')], ephemeral: true });
    },
};
