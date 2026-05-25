const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-mesaj')
        .setNameLocalizations({ tr: 'embed-mesaj' })
        .setDescription('Create an extremely detailed embed message')
        .setDescriptionLocalizations({ tr: 'Çok detaylı bir embed mesajı oluşturur' })
        
        .addStringOption(opt => opt.setName('author_name').setDescription('Author name'))
        .addStringOption(opt => opt.setName('author_icon').setDescription('Author Icon URL'))
        .addStringOption(opt => opt.setName('author_url').setDescription('Author URL'))
        
        .addStringOption(opt => opt.setName('title').setDescription('Embed title'))
        .addStringOption(opt => opt.setName('url').setDescription('Title URL'))
        .addStringOption(opt => opt.setName('description').setDescription('Main description'))
        .addStringOption(opt => opt.setName('color').setDescription('Hex color (#FFFFFF)'))
        
        .addStringOption(opt => opt.setName('image').setDescription('Large Image URL'))
        .addStringOption(opt => opt.setName('thumbnail').setDescription('Small Thumbnail URL'))
        
        .addStringOption(opt => opt.setName('footer_text').setDescription('Footer text'))
        .addStringOption(opt => opt.setName('footer_icon').setDescription('Footer Icon URL'))
        
        .addBooleanOption(opt => opt.setName('timestamp').setDescription('Show timestamp'))
        
        .addChannelOption(opt => opt.setName('channel').setDescription('Target channel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    cooldown: 10,
    async run(client, interaction, lang) {
        const authorName = interaction.options.getString('author_name');
        const authorIcon = interaction.options.getString('author_icon');
        const authorUrl = interaction.options.getString('author_url');
        const title = interaction.options.getString('title');
        const url = interaction.options.getString('url');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || '#9B59B6';
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');
        const footerText = interaction.options.getString('footer_text');
        const footerIcon = interaction.options.getString('footer_icon');
        const showTimestamp = interaction.options.getBoolean('timestamp');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            const embed = new EmbedBuilder();

            if (authorName) {
                embed.setAuthor({
                    name: authorName,
                    iconURL: authorIcon || null,
                    url: authorUrl || null
                });
            }

            if (title) embed.setTitle(title);
            if (url) embed.setURL(url);
            if (description) embed.setDescription(description.replace(/\\n/g, '\n'));
            
            try { 
                embed.setColor(color); 
            } catch (e) { 
                embed.setColor('#9B59B6'); 
            }

            if (image) embed.setImage(image);
            if (thumbnail) embed.setThumbnail(thumbnail);

            if (footerText) {
                embed.setFooter({
                    text: footerText,
                    iconURL: footerIcon || null
                });
            }

            if (showTimestamp) embed.setTimestamp();

            if (!title && !description && !image && !authorName) {
                return interaction.reply({ embeds: [errorEmbed('En az bir içerik alanı doldurmalısınız!')], ephemeral: true });
            }

            await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] });
            await interaction.reply({ embeds: [successEmbed(`✅ Embed ${channel} kanalına gönderildi!`)], ephemeral: true });

        } catch (error) {
            logger.error('Embed-mesaj hatası: ' + error.message, 'EMBED');
            await interaction.reply({ embeds: [errorEmbed('Embed gönderilirken bir hata oluştu. Lütfen URL\'leri ve renk kodunu kontrol edin.')], ephemeral: true });
        }
    },
};
