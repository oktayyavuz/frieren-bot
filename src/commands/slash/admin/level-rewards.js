const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-rewards')
        .setNameLocalizations({ tr: 'seviye-ödülleri' })
        .setDescription('Manage level rewards')
        .setDescriptionLocalizations({ tr: 'Seviye ödüllerini yönet' })
        .addSubcommand(sub => sub.setName('add').setNameLocalizations({ tr: 'ekle' }).setDescription('Add level reward')
            .addIntegerOption(opt => opt.setName('level').setNameLocalizations({ tr: 'seviye' }).setDescription('Level').setRequired(true).setMinValue(1))
            .addRoleOption(opt => opt.setName('role').setNameLocalizations({ tr: 'rol' }).setDescription('Role to give').setRequired(true)))
        .addSubcommand(sub => sub.setName('remove').setNameLocalizations({ tr: 'kaldır' }).setDescription('Remove level reward')
            .addIntegerOption(opt => opt.setName('level').setDescription('Level').setRequired(true)))
        .addSubcommand(sub => sub.setName('list').setNameLocalizations({ tr: 'liste' }).setDescription('List level rewards'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'add') {
            const level = interaction.options.getInteger('level');
            const role = interaction.options.getRole('role');

            await prisma.levelReward.upsert({
                where: { guildId_level: { guildId: interaction.guildId, level } },
                update: { roleId: role.id },
                create: { guildId: interaction.guildId, level, roleId: role.id },
            });

            await interaction.reply({ embeds: [successEmbed(`✅ Seviye **${level}** ödülü: ${role}`)] });
        }

        else if (sub === 'remove') {
            const level = interaction.options.getInteger('level');
            try {
                await prisma.levelReward.delete({ where: { guildId_level: { guildId: interaction.guildId, level } } });
                await interaction.reply({ embeds: [successEmbed(`✅ Seviye ${level} ödülü kaldırıldı!`)] });
            } catch (e) {
                await interaction.reply({ embeds: [errorEmbed('Ödül bulunamadı!')], ephemeral: true });
            }
        }

        else if (sub === 'list') {
            const rewards = await prisma.levelReward.findMany({
                where: { guildId: interaction.guildId },
                orderBy: { level: 'asc' },
            });

            if (rewards.length === 0) {
                return interaction.reply({ embeds: [createEmbed({ description: 'Henüz seviye ödülü tanımlanmamış.' })] });
            }

            const embed = createEmbed({
                title: '🏆 Seviye Ödülleri',
                description: rewards.map(r => `**Seviye ${r.level}** → <@&${r.roleId}>`).join('\n'),
            });

            await interaction.reply({ embeds: [embed] });
        }
    },
};
