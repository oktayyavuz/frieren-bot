const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setNameLocalizations({ tr: 'anket' })
        .setDescription('Create a poll with up to 5 options')
        .setDescriptionLocalizations({ tr: 'En fazla 5 seçenekli anket oluştur' })
        .addStringOption(opt => opt
            .setName('question')
            .setNameLocalizations({ tr: 'soru' })
            .setDescription('Poll question')
            .setDescriptionLocalizations({ tr: 'Anket sorusu' })
            .setRequired(true)
            .setMaxLength(256))
        .addStringOption(opt => opt
            .setName('option1')
            .setNameLocalizations({ tr: 'seçenek1' })
            .setDescription('Option 1')
            .setDescriptionLocalizations({ tr: '1. Seçenek' })
            .setRequired(true)
            .setMaxLength(100))
        .addStringOption(opt => opt
            .setName('option2')
            .setNameLocalizations({ tr: 'seçenek2' })
            .setDescription('Option 2')
            .setDescriptionLocalizations({ tr: '2. Seçenek' })
            .setRequired(true)
            .setMaxLength(100))
        .addStringOption(opt => opt
            .setName('option3')
            .setNameLocalizations({ tr: 'seçenek3' })
            .setDescription('Option 3 (optional)')
            .setDescriptionLocalizations({ tr: '3. Seçenek (opsiyonel)' })
            .setMaxLength(100))
        .addStringOption(opt => opt
            .setName('option4')
            .setNameLocalizations({ tr: 'seçenek4' })
            .setDescription('Option 4 (optional)')
            .setDescriptionLocalizations({ tr: '4. Seçenek (opsiyonel)' })
            .setMaxLength(100))
        .addStringOption(opt => opt
            .setName('option5')
            .setNameLocalizations({ tr: 'seçenek5' })
            .setDescription('Option 5 (optional)')
            .setDescriptionLocalizations({ tr: '5. Seçenek (opsiyonel)' })
            .setMaxLength(100))
        .addIntegerOption(opt => opt
            .setName('duration')
            .setNameLocalizations({ tr: 'süre' })
            .setDescription('Poll duration in minutes (default: 60, max: 1440)')
            .setDescriptionLocalizations({ tr: 'Anket süresi dakika cinsinden (varsayılan: 60, max: 1440)' })
            .setMinValue(1)
            .setMaxValue(1440)),
    cooldown: 10,
    async run(client, interaction) {
        const question = interaction.options.getString('question');
        const durationMin = interaction.options.getInteger('duration') ?? 60;

        const options = [
            interaction.options.getString('option1'),
            interaction.options.getString('option2'),
            interaction.options.getString('option3'),
            interaction.options.getString('option4'),
            interaction.options.getString('option5'),
        ].filter(Boolean);

        const endsAt = new Date(Date.now() + durationMin * 60 * 1000);
        const endsTimestamp = Math.floor(endsAt.getTime() / 1000);

        const optionLines = options.map((opt, i) => `${EMOJIS[i]} ${opt}`).join('\n');

        const content = [
            `## 📊 ${question}`,
            '',
            optionLines,
            '',
            `⏱ Bitiş: <t:${endsTimestamp}:R> (<t:${endsTimestamp}:f>)`,
            `-# 📌 ${interaction.user.toString()} tarafından oluşturuldu`,
        ].join('\n');

        const container = {
            type: 17,
            accent_color: config.colors.primary,
            components: [{ type: 10, content }],
        };

        const { resource } = await interaction.reply({ flags: FLAGS_V2, components: [container], withResponse: true });
        const msg = resource.message;
        for (let i = 0; i < options.length; i++) {
            await msg.react(EMOJIS[i]).catch(() => {});
        }

        
        setTimeout(async () => {
            try {
                const pollMsg = await msg.fetch();
                const results = options.map((opt, i) => {
                    const reaction = pollMsg.reactions.cache.get(EMOJIS[i]);
                    const count = (reaction?.count ?? 1) - 1; 
                    return { label: opt, count };
                });

                const total = results.reduce((s, r) => s + r.count, 0);
                const maxCount = Math.max(...results.map(r => r.count));

                const resultLines = results.map((r, i) => {
                    const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
                    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
                    const crown = r.count === maxCount && maxCount > 0 ? ' 👑' : '';
                    return `${EMOJIS[i]} **${r.label}**${crown}\n\`${bar}\` **${pct}%** (${r.count} oy)`;
                }).join('\n\n');

                const resultContent = [
                    `## 📊 Anket Sonuçları: ${question}`,
                    '',
                    resultLines,
                    '',
                    `**Toplam oy:** ${total}`,
                    `-# ✅ Anket sona erdi`,
                ].join('\n');

                await interaction.editReply({
                    flags: FLAGS_V2,
                    components: [{ type: 17, accent_color: config.colors.success, components: [{ type: 10, content: resultContent }] }],
                });

                logger.info(`Poll: "${question}" ended in ${interaction.guild.name} — ${total} votes`, 'UTILITY');
            } catch (e) {
                
            }
        }, durationMin * 60 * 1000);

        logger.info(`Poll: ${interaction.user.tag} created "${question}" in ${interaction.guild.name}`, 'UTILITY');
    },
};
