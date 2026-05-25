const { SlashCommandBuilder, PermissionFlagsBits, parseEmoji } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('r')
        .setNameLocalizations({ tr: 'r' })
        .setDescription('Create reaction roles on a message')
        .setDescriptionLocalizations({ tr: 'Bir mesaja reaksiyon rolü ekler' })
        .addStringOption(opt => opt.setName('message_id').setDescription('Message ID').setRequired(true))
        .addStringOption(opt => opt.setName('emoji1').setDescription('Emoji 1'))
        .addRoleOption(opt => opt.setName('role1').setDescription('Role 1'))
        .addStringOption(opt => opt.setName('emoji2').setDescription('Emoji 2'))
        .addRoleOption(opt => opt.setName('role2').setDescription('Role 2'))
        .addStringOption(opt => opt.setName('emoji3').setDescription('Emoji 3'))
        .addRoleOption(opt => opt.setName('role3').setDescription('Role 3'))
        .addStringOption(opt => opt.setName('emoji4').setDescription('Emoji 4'))
        .addRoleOption(opt => opt.setName('role4').setDescription('Role 4'))
        .addStringOption(opt => opt.setName('emoji5').setDescription('Emoji 5'))
        .addRoleOption(opt => opt.setName('role5').setDescription('Role 5'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    cooldown: 5,
    async run(client, interaction, lang) {
        const messageId = interaction.options.getString('message_id');
        const channel = interaction.channel;

        try {
            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (!message) {
                return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.messageNotFound'))], ephemeral: true });
            }

            const pairs = [];
            for (let i = 1; i <= 5; i++) {
                const emoji = interaction.options.getString(`emoji${i}`);
                const role = interaction.options.getRole(`role${i}`);
                if (emoji && role) {
                    pairs.push({ emoji, roleId: role.id });
                }
            }

            if (pairs.length === 0) {
                return interaction.reply({ embeds: [errorEmbed('En az bir emoji ve rol çifti belirtmelisiniz!')], ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });

            const added = [];
            for (const pair of pairs) {
                const parsedEmoji = parseEmoji(pair.emoji);
                const emojiStr = parsedEmoji.id 
                    ? `<${parsedEmoji.animated ? 'a' : ''}:${parsedEmoji.name}:${parsedEmoji.id}>` 
                    : parsedEmoji.name;

                await prisma.reactionRole.upsert({
                    where: {
                        messageId_emoji: {
                            messageId: message.id,
                            emoji: emojiStr
                        }
                    },
                    update: { roleId: pair.roleId },
                    create: {
                        guildId: interaction.guildId,
                        messageId: message.id,
                        emoji: emojiStr,
                        roleId: pair.roleId
                    }
                });

                await message.react(pair.emoji).catch(err => {
                    logger.warn(`Mesaja reaksiyon eklenemedi: ${err.message}`, 'REACTION-ROLE');
                });

                added.push(`${pair.emoji} -> <@&${pair.roleId}>`);
            }

            await interaction.editReply({ 
                embeds: [successEmbed(`Reaksiyon rolleri başarıyla kuruldu!\n\n${added.join('\n')}`)] 
            });

        } catch (error) {
            logger.error('Reaction role komut hatası: ' + error.message, 'REACTION-ROLE');
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed('Kritik bir hata oluştu.')] });
            } else {
                await interaction.reply({ embeds: [errorEmbed('Kritik bir hata oluştu.')], ephemeral: true });
            }
        }
    },
};
