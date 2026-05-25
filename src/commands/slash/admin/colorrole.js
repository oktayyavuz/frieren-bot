const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successEmbed, errorEmbed, createEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const prisma = require('../../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('colorrole')
        .setNameLocalizations({ tr: 'renk' })
        .setDescription('Color role system')
        .setDescriptionLocalizations({ tr: 'Renk rolü sistemi' })
        .addSubcommand(sub => sub.setName('create').setNameLocalizations({ tr: 'oluştur' }).setDescription('Create color role panel')
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel').setRequired(true)))
        .addSubcommand(sub => sub.setName('add').setNameLocalizations({ tr: 'ekle' }).setDescription('Add a color role')
            .addStringOption(opt => opt.setName('name').setNameLocalizations({ tr: 'isim' }).setDescription('Color name').setRequired(true))
            .addStringOption(opt => opt.setName('color').setNameLocalizations({ tr: 'renk' }).setDescription('Hex color (e.g. #FF5733)').setRequired(true))
            .addStringOption(opt => opt.setName('emoji').setDescription('Emoji')))
        .addSubcommand(sub => sub.setName('panel').setDescription('Update color panel')
            .addStringOption(opt => opt.setName('message-id').setDescription('Panel message ID').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 10,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'add') {
            const name = interaction.options.getString('name');
            const color = interaction.options.getString('color').replace('#', '');
            const emoji = interaction.options.getString('emoji') || '🎨';

            
            const role = await interaction.guild.roles.create({
                name: `🎨 ${name}`,
                color: parseInt(color, 16),
                reason: 'Renk rolü sistemi',
            });

            await prisma.colorRole.create({
                data: { guildId: interaction.guildId, roleId: role.id, name, color, emoji },
            });

            await interaction.reply({ embeds: [successEmbed(`✅ Renk rolü oluşturuldu: ${role}\nŞimdi \`/colorrole panel\` ile paneli güncelleyin.`)] });
        }

        else if (sub === 'create') {
            const channel = interaction.options.getChannel('channel');

            const colorRoles = await prisma.colorRole.findMany({ where: { guildId: interaction.guildId } });
            if (colorRoles.length === 0) {
                return interaction.reply({ embeds: [errorEmbed('Önce `/colorrole add` ile renk rolleri ekleyin!')], ephemeral: true });
            }

            const embed = createEmbed({
                title: '🎨 Renk Rolleri',
                description: 'Aşağıdaki butonlara tıklayarak renk rolü seçebilirsiniz.\n⚠️ Aynı anda sadece bir renk rolü aktif olabilir.',
                color: client.config.colors.primary,
                fields: colorRoles.map(cr => ({
                    name: `${cr.emoji} ${cr.name}`,
                    value: `#${cr.color}`,
                    inline: true,
                })),
            });

            const rows = [];
            let currentRow = new ActionRowBuilder();

            for (let i = 0; i < colorRoles.length; i++) {
                const cr = colorRoles[i];
                const button = new ButtonBuilder()
                    .setCustomId(`cr_${cr.roleId}`)
                    .setLabel(cr.name)
                    .setStyle(ButtonStyle.Secondary);
                try { button.setEmoji(cr.emoji); } catch (e) { }
                currentRow.addComponents(button);

                if ((i + 1) % 5 === 0 || i === colorRoles.length - 1) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
            }

            await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed), ...rows.slice(0, 5)] });
            await interaction.reply({ embeds: [successEmbed('✅ Renk rolü paneli oluşturuldu!')], ephemeral: true });
        }

        else if (sub === 'panel') {
            const messageId = interaction.options.getString('message-id');
            const colorRoles = await prisma.colorRole.findMany({ where: { guildId: interaction.guildId } });

            if (colorRoles.length === 0) return interaction.reply({ embeds: [errorEmbed('Renk rolü bulunamadı!')], ephemeral: true });

            
            let msg;
            for (const [, ch] of interaction.guild.channels.cache) {
                if (!ch.isTextBased()) continue;
                try { msg = await ch.messages.fetch(messageId); if (msg) break; } catch (e) { continue; }
            }

            if (!msg) return interaction.reply({ embeds: [errorEmbed('Mesaj bulunamadı!')], ephemeral: true });

            const rows = [];
            let currentRow = new ActionRowBuilder();

            for (let i = 0; i < colorRoles.length; i++) {
                const cr = colorRoles[i];
                const button = new ButtonBuilder()
                    .setCustomId(`cr_${cr.roleId}`)
                    .setLabel(cr.name)
                    .setStyle(ButtonStyle.Secondary);
                try { button.setEmoji(cr.emoji); } catch (e) { }
                currentRow.addComponents(button);

                if ((i + 1) % 5 === 0 || i === colorRoles.length - 1) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
            }

            await msg.edit({ components: rows.slice(0, 5) });
            await interaction.reply({ embeds: [successEmbed('✅ Panel güncellendi!')], ephemeral: true });
        }
    },
};
