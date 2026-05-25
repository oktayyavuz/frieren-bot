const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const logger = require('../../../utils/logger');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setNameLocalizations({ tr: 'embed' })
        .setDescription('Create a custom embed message')
        .setDescriptionLocalizations({ tr: 'Özel embed mesaj oluştur' })
        .addStringOption(opt => opt.setName('title').setNameLocalizations({ tr: 'başlık' }).setDescription('Embed title'))
        .addStringOption(opt => opt.setName('description').setNameLocalizations({ tr: 'açıklama' }).setDescription('Embed description'))
        .addStringOption(opt => opt.setName('color').setNameLocalizations({ tr: 'renk' }).setDescription('Hex color (#FF5733)'))
        .addStringOption(opt => opt.setName('image').setNameLocalizations({ tr: 'resim' }).setDescription('Image URL'))
        .addStringOption(opt => opt.setName('thumbnail').setDescription('Thumbnail URL'))
        .addStringOption(opt => opt.setName('footer').setDescription('Footer text'))
        .addStringOption(opt => opt.setName('author').setNameLocalizations({ tr: 'yazar' }).setDescription('Author text'))
        .addChannelOption(opt => opt.setName('channel').setNameLocalizations({ tr: 'kanal' }).setDescription('Send to specific channel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    cooldown: 10,
    async run(client, interaction, lang) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color');
        const image = interaction.options.getString('image');
        const thumbnail = interaction.options.getString('thumbnail');
        const footer = interaction.options.getString('footer');
        const author = interaction.options.getString('author');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!title && !description) {
            return interaction.reply({ embeds: [errorEmbed('Başlık veya açıklama belirtmelisiniz!')], ephemeral: true });
        }

        const embed = new EmbedBuilder();
        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (color) {
            try { embed.setColor(color); } catch (e) { embed.setColor('#5865F2'); }
        } else {
            embed.setColor('#5865F2');
        }
        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (footer) embed.setFooter({ text: footer });
        if (author) embed.setAuthor({ name: author });
        embed.setTimestamp();

        await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] });
        await interaction.reply({ embeds: [successEmbed(`✅ Embed ${channel} kanalına gönderildi!`)], ephemeral: true });
        logger.info(`Embed: ${interaction.user.tag} created an embed in ${interaction.channel.name} (${interaction.guild.name})`, 'UTILITY');
    },
};
