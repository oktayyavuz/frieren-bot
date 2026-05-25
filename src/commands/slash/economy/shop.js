const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, errorEmbed, successEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setNameLocalizations({ tr: 'market' })
        .setDescription('Shop system')
        .setDescriptionLocalizations({ tr: 'Market sistemi' })
        .addSubcommand(sub => sub.setName('list').setNameLocalizations({ tr: 'liste' }).setDescription('Show shop items')
            .setDescriptionLocalizations({ tr: 'Market ürünlerini göster' }))
        .addSubcommand(sub => sub.setName('buy').setNameLocalizations({ tr: 'satınal' }).setDescription('Buy an item')
            .setDescriptionLocalizations({ tr: 'Ürün satın al' })
            .addIntegerOption(opt => opt.setName('id').setDescription('Item ID').setRequired(true)))
        .addSubcommand(sub => sub.setName('add').setNameLocalizations({ tr: 'ekle' }).setDescription('Add item to shop (Admin)')
            .setDescriptionLocalizations({ tr: 'Markete ürün ekle (Yönetici)' })
            .addStringOption(opt => opt.setName('name').setNameLocalizations({ tr: 'isim' }).setDescription('Item name').setRequired(true))
            .addIntegerOption(opt => opt.setName('price').setNameLocalizations({ tr: 'fiyat' }).setDescription('Price').setRequired(true).setMinValue(1))
            .addRoleOption(opt => opt.setName('role').setNameLocalizations({ tr: 'rol' }).setDescription('Role to give (optional)'))
            .addStringOption(opt => opt.setName('description').setNameLocalizations({ tr: 'açıklama' }).setDescription('Description'))
            .addStringOption(opt => opt.setName('emoji').setDescription('Emoji'))
            .addIntegerOption(opt => opt.setName('stock').setDescription('Stock (-1 = unlimited)').setMinValue(-1)))
        .addSubcommand(sub => sub.setName('remove').setNameLocalizations({ tr: 'kaldır' }).setDescription('Remove item from shop (Admin)')
            .addIntegerOption(opt => opt.setName('id').setDescription('Item ID').setRequired(true))),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || client.config.economy.currencyName;
        const emoji = settings?.currencyEmoji || client.config.economy.currencyEmoji;

        if (sub === 'list') {
            const items = await prisma.shopItem.findMany({ where: { guildId: interaction.guildId } });
            if (items.length === 0) {
                return interaction.reply({ embeds: [createEmbed({ description: client.t(lang, 'commands.shop.empty') })] });
            }

            const description = items.map(item => {
                const stock = item.stock === -1 ? '∞' : item.stock;
                const role = item.roleId ? ` → <@&${item.roleId}>` : '';
                return `${item.emoji} **${item.name}** — ${formatNumber(item.price)} ${currency}\n> ${item.description || 'Açıklama yok'}${role}\n> ID: \`${item.id}\` | Stok: ${stock}`;
            }).join('\n\n');

            const embed = createEmbed({
                title: client.t(lang, 'commands.shop.title'),
                description,
                color: client.config.colors.economy,
                category: 'economy'
            });
            await interaction.reply({ embeds: [embed] });
        }

        else if (sub === 'buy') {
            const itemId = interaction.options.getInteger('id');
            const item = await prisma.shopItem.findFirst({ where: { id: itemId, guildId: interaction.guildId } });
            if (!item) return interaction.reply({ embeds: [errorEmbed('Ürün bulunamadı!')], ephemeral: true });
            if (item.stock === 0) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.shop.outOfStock'))], ephemeral: true });

            const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
            if (guildUser.balance < item.price) return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'commands.shop.noMoney'))], ephemeral: true });

            
            await prisma.guildUser.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                data: { balance: { decrement: item.price } },
            });

            
            if (item.stock > 0) {
                await prisma.shopItem.update({ where: { id: item.id }, data: { stock: { decrement: 1 } } });
            }

            
            if (item.roleId) {
                try {
                    await interaction.member.roles.add(item.roleId);
                } catch (e) { }
            }

            
            let inventory = JSON.parse(guildUser.inventory || '[]');
            inventory.push({ id: item.id, name: item.name, boughtAt: Date.now() });
            await prisma.guildUser.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                data: { inventory: JSON.stringify(inventory) },
            });

            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.shop.bought', { item: item.name }), null, 'economy')] });
        }

        else if (sub === 'add') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.adminOnly'))], ephemeral: true });
            }

            const name = interaction.options.getString('name');
            const price = interaction.options.getInteger('price');
            const role = interaction.options.getRole('role');
            const description = interaction.options.getString('description') || '';
            const itemEmoji = interaction.options.getString('emoji') || '🛒';
            const stock = interaction.options.getInteger('stock') ?? -1;

            const item = await prisma.shopItem.create({
                data: { guildId: interaction.guildId, name, description, price, roleId: role?.id || null, emoji: itemEmoji, stock },
            });

            logger.info(`Shop: ${interaction.user.tag} added item ${name} for ${price} in ${interaction.guild.name}`, 'ADMIN');
            await interaction.reply({ embeds: [successEmbed(`✅ **${name}** markete eklendi! (ID: ${item.id})`, null, 'economy')] });
        }

        else if (sub === 'remove') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ embeds: [errorEmbed(client.t(lang, 'errors.adminOnly'))], ephemeral: true });
            }

            const itemId = interaction.options.getInteger('id');
            try {
                await prisma.shopItem.delete({ where: { id: itemId } });
                logger.info(`Shop: ${interaction.user.tag} removed item ID ${itemId} in ${interaction.guild.name}`, 'ADMIN');
                await interaction.reply({ embeds: [successEmbed('✅ Ürün marketten kaldırıldı!', null, 'economy')] });
            } catch (e) {
                await interaction.reply({ embeds: [errorEmbed('Ürün bulunamadı!')], ephemeral: true });
            }
        }
    },
};
