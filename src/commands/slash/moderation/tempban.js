const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { successEmbed, errorEmbed, FLAGS_V2, embedToV2 } = require('../../../utils/embed');
const { formatDuration } = require('../../../utils/helpers');
const logger = require('../../../utils/logger');
const config = require('../../../../config');

const DURATION_REGEX = /^(\d+)(s|m|h|d)$/i;
const UNIT_TO_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

function parseDuration(str) {
    const match = str.match(DURATION_REGEX);
    if (!match) return null;
    return parseInt(match[1]) * UNIT_TO_MS[match[2].toLowerCase()];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setNameLocalizations({ tr: 'geçici-ban' })
        .setDescription('Temporarily ban a member')
        .setDescriptionLocalizations({ tr: 'Bir üyeyi geçici olarak banla' })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addUserOption(opt => opt
            .setName('user')
            .setNameLocalizations({ tr: 'kullanıcı' })
            .setDescription('User to ban')
            .setDescriptionLocalizations({ tr: 'Banlanacak kullanıcı' })
            .setRequired(true))
        .addStringOption(opt => opt
            .setName('duration')
            .setNameLocalizations({ tr: 'süre' })
            .setDescription('Duration: 10m, 2h, 1d, 30s')
            .setDescriptionLocalizations({ tr: 'Süre: 10m, 2h, 1d, 30s' })
            .setRequired(true))
        .addStringOption(opt => opt
            .setName('reason')
            .setNameLocalizations({ tr: 'sebep' })
            .setDescription('Reason')
            .setDescriptionLocalizations({ tr: 'Sebep' })
            .setMaxLength(512)),
    cooldown: 5,
    async run(client, interaction, lang) {
        const target = interaction.options.getMember('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'Sebep belirtilmedi';

        if (!target) {
            return interaction.reply({ embeds: [errorEmbed('Kullanıcı bu sunucuda bulunamadı.')], ephemeral: true });
        }

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
            return interaction.reply({
                embeds: [errorEmbed('Geçersiz süre formatı! Örnek: `10m`, `2h`, `1d`, `30s`')],
                ephemeral: true,
            });
        }

        if (durationMs < 10_000 || durationMs > 30 * 86_400_000) {
            return interaction.reply({
                embeds: [errorEmbed('Süre 10 saniye ile 30 gün arasında olmalıdır.')],
                ephemeral: true,
            });
        }

        if (!target.bannable) {
            return interaction.reply({
                embeds: [errorEmbed('Bu kullanıcıyı banlayamam! Rolü benden yüksek olabilir.')],
                ephemeral: true,
            });
        }

        if (target.user.id === interaction.user.id) {
            return interaction.reply({ embeds: [errorEmbed('Kendinizi banlayamazsınız!')], ephemeral: true });
        }

        const humanDuration = formatDuration(durationMs);
        const unbanAt = new Date(Date.now() + durationMs);
        const unbanTimestamp = Math.floor(unbanAt.getTime() / 1000);

        
        await target.send({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.error,
                components: [{
                    type: 10,
                    content: `## 🔨 Geçici Ban\n**${interaction.guild.name}** sunucusundan geçici olarak banlandınız.\n\n**Süre:** ${humanDuration}\n**Sebep:** ${reason}\n**Kaldırılma:** <t:${unbanTimestamp}:f>`,
                }],
            }],
        }).catch(() => {});

        await target.ban({ reason: `[Geçici Ban - ${humanDuration}] ${reason} | ${interaction.user.tag}` });

        
        setTimeout(async () => {
            await interaction.guild.bans.remove(target.user.id, 'Geçici ban süresi doldu').catch(() => {});
            logger.info(`Tempban: Auto-unbanned ${target.user.tag} in ${interaction.guild.name}`, 'MOD');
        }, durationMs);

        logger.info(`Tempban: ${interaction.user.tag} tempbanned ${target.user.tag} for ${humanDuration} in ${interaction.guild.name}`, 'MOD');

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.error,
                components: [{
                    type: 10,
                    content: [
                        `## 🔨 Geçici Ban Uygulandı`,
                        `**Kullanıcı:** ${target.user.toString()} (${target.user.tag})`,
                        `**Süre:** ${humanDuration}`,
                        `**Kaldırılma:** <t:${unbanTimestamp}:R>`,
                        `**Sebep:** ${reason}`,
                        `**Moderatör:** ${interaction.user.toString()}`,
                    ].join('\n'),
                }],
            }],
        });
    },
};
