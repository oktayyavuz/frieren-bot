const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setNameLocalizations({ tr: 'otomod' })
        .setDescription('Auto-moderation settings')
        .setDescriptionLocalizations({ tr: 'Oto-moderasyon ayarları' })
        .addSubcommand(sub => sub
            .setName('toggle')
            .setDescription('Toggle a feature')
            .addStringOption(opt => opt.setName('feature').setDescription('Feature to toggle').setRequired(true).addChoices(
                { name: 'Oto-Mod (Genel)', value: 'automodEnabled' },
                { name: 'Küfür Engel', value: 'antiSwearEnabled' },
                { name: 'Spam Koruması', value: 'antiSpamEnabled' },
                { name: 'Caps Lock Engel', value: 'antiCapsEnabled' },
                { name: 'Link Engel', value: 'antiLinkEnabled' },
                { name: 'Anti-Raid', value: 'antiRaidEnabled' },
            ))
        )
        .addSubcommand(sub => sub
            .setName('status')
            .setDescription('Show automod status')
        )
        .addSubcommand(sub => sub
            .setName('panic')
            .setDescription('Toggle all protections at once')
            .addBooleanOption(opt => opt.setName('enable').setDescription('Enable or disable').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'toggle') {
            const feature = interaction.options.getString('feature');
            const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
            const currentValue = settings?.[feature] || false;
            const newValue = !currentValue;

            await prisma.guildSettings.update({
                where: { id: interaction.guildId },
                data: { [feature]: newValue },
            });

            const featureNames = {
                automodEnabled: 'Oto-Mod',
                antiSwearEnabled: 'Küfür Engel',
                antiSpamEnabled: 'Spam Koruması',
                antiCapsEnabled: 'Caps Lock Engel',
                antiLinkEnabled: 'Link Engel',
                antiRaidEnabled: 'Anti-Raid',
            };

            const msg = newValue
                ? client.t(lang, 'commands.automod.enabled', { feature: featureNames[feature] })
                : client.t(lang, 'commands.automod.disabled', { feature: featureNames[feature] });

            await interaction.reply({ embeds: [successEmbed(msg)] });
        }

        else if (sub === 'status') {
            const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
            const e = (v) => v ? '✅' : '❌';

            const embed = createEmbed({
                title: `🛡️ ${client.t(lang, 'commands.automod.status')}`,
                fields: [
                    { name: 'Oto-Mod', value: e(settings?.automodEnabled), inline: true },
                    { name: 'Küfür Engel', value: e(settings?.antiSwearEnabled), inline: true },
                    { name: 'Spam Koruması', value: e(settings?.antiSpamEnabled), inline: true },
                    { name: 'Caps Lock Engel', value: e(settings?.antiCapsEnabled), inline: true },
                    { name: 'Link Engel', value: e(settings?.antiLinkEnabled), inline: true },
                    { name: 'Anti-Raid', value: e(settings?.antiRaidEnabled), inline: true },
                ],
            });

            await interaction.reply({ embeds: [embed.setThumbnail(client.config.embeds.moderation)] });
        }

        else if (sub === 'panic') {
            const enable = interaction.options.getBoolean('enable');
            await prisma.guildSettings.update({
                where: { id: interaction.guildId },
                data: {
                    automodEnabled: enable,
                    antiSwearEnabled: enable,
                    antiSpamEnabled: enable,
                    antiCapsEnabled: enable,
                    antiLinkEnabled: enable,
                    antiRaidEnabled: enable,
                },
            });

            const msg = enable ? '🚨 Tüm korumalar **ETKİNLEŞTİRİLDİ**!' : '⚠️ Tüm korumalar **DEVRE DIŞI** bırakıldı!';
            await interaction.reply({ embeds: [successEmbed(msg)] });
        }
    },
};
