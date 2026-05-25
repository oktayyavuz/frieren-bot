const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, parseEmoji } = require('discord.js');
const { successEmbed, errorEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-rol')
        .setNameLocalizations({ tr: 'embed-rol' })
        .setDescription('Create a detailed embed with reaction roles')
        .setDescriptionLocalizations({ tr: 'Detaylı bir embed ve reaksiyon rolleri oluşturur' })
        
        .addStringOption(opt => opt.setName('title').setDescription('Embed title'))
        .addStringOption(opt => opt.setName('description').setDescription('Embed description'))
        .addStringOption(opt => opt.setName('color').setDescription('Hex color'))
        .addStringOption(opt => opt.setName('image').setDescription('Image URL'))
        
        .addStringOption(opt => opt.setName('emoji1').setDescription('Emoji 1'))
        .addRoleOption(opt => opt.setName('role1').setDescription('Role 1'))
        .addStringOption(opt => opt.setName('emoji2').setDescription('Emoji 2'))
        .addRoleOption(opt => opt.setName('role2').setDescription('Role 2'))
        .addStringOption(opt => opt.setName('emoji3').setDescription('Emoji 3'))
        .addRoleOption(opt => opt.setName('role3').setDescription('Role 3'))
        
        .addChannelOption(opt => opt.setName('channel').setDescription('Target channel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 15,
    async run(client, interaction, lang) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || '#9B59B6';
        const image = interaction.options.getString('image');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const pairs = [];
        for (let i = 1; i <= 3; i++) {
            const emoji = interaction.options.getString(`emoji${i}`);
            const role = interaction.options.getRole(`role${i}`);
            if (emoji && role) {
                pairs.push({ emoji, roleId: role.id });
            }
        }

        if (pairs.length === 0) {
            return interaction.reply({ embeds: [errorEmbed('En az bir reaksiyon rolü eklemelisiniz!')], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTimestamp();

            if (title) embed.setTitle(title);
            if (description) embed.setDescription(description.replace(/\\n/g, '\n'));
            if (image) embed.setImage(image);

            const sentMessage = await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] });

            const added = [];
            for (const pair of pairs) {
                const parsedEmoji = parseEmoji(pair.emoji);
                const emojiStr = parsedEmoji.id 
                    ? `<${parsedEmoji.animated ? 'a' : ''}:${parsedEmoji.name}:${parsedEmoji.id}>` 
                    : parsedEmoji.name;

                await prisma.reactionRole.create({
                    data: {
                        guildId: interaction.guildId,
                        messageId: sentMessage.id,
                        emoji: emojiStr,
                        roleId: pair.roleId
                    }
                });

                await sentMessage.react(pair.emoji).catch(() => null);
                added.push(`${pair.emoji} -> <@&${pair.roleId}>`);
            }

            await interaction.editReply({ 
                embeds: [successEmbed(`Embed ve reaksiyon rolleri başarıyla kanal ${channel} içinde oluşturuldu!\n\n${added.join('\n')}`)] 
            });

        } catch (error) {
            logger.error('Embed-rol hatası: ' + error.message, 'EMBED-ROL');
            await interaction.editReply({ embeds: [errorEmbed('Bir hata oluştu. Lütfen ayarları kontrol edin.')] });
        }
    },
};
