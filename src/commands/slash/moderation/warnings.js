const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, errorEmbed, successEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setNameLocalizations({ tr: 'uyarılar' })
        .setDescription('Show or clear user warnings')
        .setDescriptionLocalizations({ tr: 'Kullanıcı uyarılarını göster veya temizle' })
        .addUserOption(opt => opt.setName('user').setNameLocalizations({ tr: 'kullanıcı' }).setDescription('User').setRequired(true))
        .addBooleanOption(opt => opt.setName('clear').setNameLocalizations({ tr: 'temizle' }).setDescription('Clear all warnings'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    cooldown: 5,
    async run(client, interaction, lang) {
        const target = interaction.options.getUser('user');
        const clear = interaction.options.getBoolean('clear');

        if (clear) {
            await prisma.warning.deleteMany({ where: { userId: target.id, guildId: interaction.guildId } });
            return interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.warnings.cleared', { user: target.tag }))] });
        }

        const warnings = await prisma.warning.findMany({
            where: { userId: target.id, guildId: interaction.guildId },
            orderBy: { createdAt: 'desc' },
        });

        if (warnings.length === 0) {
            return interaction.reply({ embeds: [createEmbed({ description: client.t(lang, 'commands.warnings.noWarnings') })] });
        }

        const fields = warnings.map((w, i) => ({
            name: `#${i + 1} — <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`,
            value: `**Sebep:** ${w.reason}\n**Moderatör:** <@${w.moderatorId}>`,
        }));

        const embed = createEmbed({
            title: client.t(lang, 'commands.warnings.title', { user: target.tag }),
            color: 0xF39C12,
            fields: fields.slice(0, 25),
            category: 'moderation',
        });

        await interaction.reply({ embeds: [embed] });    
        logger.info(`Warnings: ${interaction.user.tag} viewed warnings of ${target.tag} in ${interaction.guild.name}`, 'MOD');
    
    },
};
