const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, createEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setNameLocalizations({ tr: 'otorol' })
        .setDescription('Manage auto-roles')
        .setDescriptionLocalizations({ tr: 'Otomatik rolleri yönet' })
        .addSubcommand(sub => sub.setName('add').setNameLocalizations({ tr: 'ekle' }).setDescription('Add auto-role')
            .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)))
        .addSubcommand(sub => sub.setName('remove').setNameLocalizations({ tr: 'kaldır' }).setDescription('Remove auto-role')
            .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true)))
        .addSubcommand(sub => sub.setName('list').setNameLocalizations({ tr: 'liste' }).setDescription('List auto-roles'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        let autoRoles = JSON.parse(settings?.autoRoles || '[]');

        if (sub === 'add') {
            const role = interaction.options.getRole('role');
            if (!autoRoles.includes(role.id)) autoRoles.push(role.id);
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { autoRoles: JSON.stringify(autoRoles) } });
            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.autorole.added', { role: role.toString() }))] });
        }
        else if (sub === 'remove') {
            const role = interaction.options.getRole('role');
            autoRoles = autoRoles.filter(id => id !== role.id);
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { autoRoles: JSON.stringify(autoRoles) } });
            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.autorole.removed', { role: role.toString() }))] });
        }
        else if (sub === 'list') {
            const list = autoRoles.length > 0 ? autoRoles.map(id => `<@&${id}>`).join('\n') : 'Yok';
            await interaction.reply({ embeds: [createEmbed({ title: client.t(lang, 'commands.autorole.list'), description: list })] });
        }
    },
};
