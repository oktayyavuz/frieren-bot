const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successEmbed, errorEmbed, createEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const prisma = require('../../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buttonrole')
        .setNameLocalizations({ tr: 'butonrol' })
        .setDescription('Set up button roles')
        .setDescriptionLocalizations({ tr: 'Buton ile rol verme sistemi kur' })
        .addSubcommand(sub => sub.setName('create').setNameLocalizations({ tr: 'oluştur' }).setDescription('Create button role message')
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel').setRequired(true))
            .addStringOption(opt => opt.setName('title').setDescription('Embed title').setRequired(true))
            .addStringOption(opt => opt.setName('description').setDescription('Embed description')))
        .addSubcommand(sub => sub.setName('add').setNameLocalizations({ tr: 'ekle' }).setDescription('Add role button to existing message')
            .addStringOption(opt => opt.setName('message-id').setDescription('Message ID').setRequired(true))
            .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true))
            .addStringOption(opt => opt.setName('label').setDescription('Button label'))
            .addStringOption(opt => opt.setName('emoji').setDescription('Button emoji')))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 10,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'create') {
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description') || 'Aşağıdaki butonlara tıklayarak rol alabilirsiniz.';

            const embed = createEmbed({ title, description, color: client.config.colors.primary });
            const msg = await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] });

            await interaction.reply({ embeds: [successEmbed(`✅ Buton rol mesajı oluşturuldu! Mesaj ID: \`${msg.id}\`\nŞimdi \`/buttonrole add\` ile buton ekleyin.`)], ephemeral: true });
        }

        else if (sub === 'add') {
            const messageId = interaction.options.getString('message-id');
            const role = interaction.options.getRole('role');
            const label = interaction.options.getString('label') || role.name;
            const emoji = interaction.options.getString('emoji') || '✅';

            
            let msg;
            for (const [, ch] of interaction.guild.channels.cache) {
                if (!ch.isTextBased()) continue;
                try {
                    msg = await ch.messages.fetch(messageId);
                    if (msg) break;
                } catch (e) { continue; }
            }

            if (!msg) return interaction.reply({ embeds: [errorEmbed('Mesaj bulunamadı!')], ephemeral: true });

            
            await prisma.buttonRole.create({
                data: { guildId: interaction.guildId, messageId, channelId: msg.channel.id, roleId: role.id, emoji, label },
            });

            
            const allButtons = await prisma.buttonRole.findMany({ where: { messageId } });
            const rows = [];
            let currentRow = new ActionRowBuilder();

            for (let i = 0; i < allButtons.length; i++) {
                const br = allButtons[i];
                const button = new ButtonBuilder()
                    .setCustomId(`br_${br.roleId}`)
                    .setLabel(br.label)
                    .setStyle(ButtonStyle.Secondary);

                try { button.setEmoji(br.emoji); } catch (e) { }

                currentRow.addComponents(button);

                if ((i + 1) % 5 === 0 || i === allButtons.length - 1) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
            }

            await msg.edit({ components: rows.slice(0, 5) });
            await interaction.reply({ embeds: [successEmbed(`✅ ${role} buton rolü eklendi!`)], ephemeral: true });
        }
    },
};
