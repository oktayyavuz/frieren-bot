const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { successEmbed, errorEmbed, createEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const prisma = require('../../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selectrole')
        .setNameLocalizations({ tr: 'seçimrol' })
        .setDescription('Set up select menu roles')
        .setDescriptionLocalizations({ tr: 'Seçim menüsü ile rol verme sistemi kur' })
        .addSubcommand(sub => sub.setName('create').setNameLocalizations({ tr: 'oluştur' }).setDescription('Create select role message')
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel').setRequired(true))
            .addStringOption(opt => opt.setName('title').setDescription('Embed title').setRequired(true))
            .addStringOption(opt => opt.setName('description').setDescription('Embed description')))
        .addSubcommand(sub => sub.setName('add').setNameLocalizations({ tr: 'ekle' }).setDescription('Add role to select menu')
            .addStringOption(opt => opt.setName('message-id').setDescription('Message ID').setRequired(true))
            .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true))
            .addStringOption(opt => opt.setName('label').setDescription('Option label'))
            .addStringOption(opt => opt.setName('description').setDescription('Option description'))
            .addStringOption(opt => opt.setName('emoji').setDescription('Option emoji')))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 10,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'create') {
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description') || 'Aşağıdaki menüden roller seçebilirsiniz.';

            const embed = createEmbed({ title, description, color: client.config.colors.primary });

            
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('sr_placeholder')
                    .setPlaceholder('Rol seç...')
                    .addOptions({ label: 'Kuruluyor...', value: 'placeholder', description: '/selectrole add ile rol ekleyin' })
            );

            const msg = await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed), row] });
            await interaction.reply({ embeds: [successEmbed(`✅ Seçim menüsü oluşturuldu! Mesaj ID: \`${msg.id}\`\nŞimdi \`/selectrole add\` ile rol ekleyin.`)], ephemeral: true });
        }

        else if (sub === 'add') {
            const messageId = interaction.options.getString('message-id');
            const role = interaction.options.getRole('role');
            const label = interaction.options.getString('label') || role.name;
            const description = interaction.options.getString('description') || '';
            const emoji = interaction.options.getString('emoji');

            
            let msg;
            for (const [, ch] of interaction.guild.channels.cache) {
                if (!ch.isTextBased()) continue;
                try {
                    msg = await ch.messages.fetch(messageId);
                    if (msg) break;
                } catch (e) { continue; }
            }

            if (!msg) return interaction.reply({ embeds: [errorEmbed('Mesaj bulunamadı!')], ephemeral: true });

            
            await prisma.selectRole.create({
                data: { guildId: interaction.guildId, messageId, channelId: msg.channel.id, roleId: role.id, label, description, emoji },
            });

            
            const allOptions = await prisma.selectRole.findMany({ where: { messageId } });
            const options = allOptions.map(opt => {
                const o = { label: opt.label, value: opt.roleId, description: opt.description || undefined };
                if (opt.emoji) o.emoji = opt.emoji;
                return o;
            });

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`sr_${messageId}`)
                    .setPlaceholder('Rol seç...')
                    .setMinValues(0)
                    .setMaxValues(options.length)
                    .addOptions(options.slice(0, 25))
            );

            await msg.edit({ components: [row] });
            await interaction.reply({ embeds: [successEmbed(`✅ ${role} seçim menüsüne eklendi!`)], ephemeral: true });
        }
    },
};
