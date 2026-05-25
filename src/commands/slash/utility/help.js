const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const logger = require('../../../utils/logger');


const CAT_COLORS = {
    admin:      0x95A5A6,
    economy:    0xF1C40F,
    fun:        0xE91E63,
    games:      0x9B59B6,
    giveaway:   0xFF6B9D,
    level:      0x1ABC9C,
    moderation: 0xE74C3C,
    music:      0x3498DB,
    ticket:     0x2ECC71,
    utility:    0x7F8C8D,
    general:    0x95A5A6,
};


const CAT_META = {
    admin:      { emoji: '⚙️',  label: 'Yönetim'   },
    economy:    { emoji: '💰',  label: 'Ekonomi'   },
    fun:        { emoji: '😄',  label: 'Eğlence'   },
    games:      { emoji: '🎮',  label: 'Oyunlar'   },
    giveaway:   { emoji: '🎉',  label: 'Çekiliş'   },
    level:      { emoji: '✨',  label: 'Seviye'    },
    moderation: { emoji: '🛡️', label: 'Moderasyon'},
    music:      { emoji: '🎵',  label: 'Müzik'     },
    ticket:     { emoji: '🎫',  label: 'Destek'    },
    utility:    { emoji: '🔧',  label: 'Araçlar'   },
    general:    { emoji: '📁',  label: 'Genel'     },
};


function cmdSlashName(cmd) {
    try {
        const loc = cmd.data.name_localizations || cmd.data.toJSON?.()?.name_localizations;
        return loc?.tr || cmd.data.name;
    } catch { return cmd.data.name; }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalizations({ tr: 'yardım' })
        .setDescription('Shows bot commands')
        .setDescriptionLocalizations({ tr: 'Bot komutlarını gösterir' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        logger.info(`Help: ${interaction.user.tag} viewed help in ${interaction.guild.name}`, 'UTILITY');

        
        const categories = {};
        client.slashCommands.forEach(cmd => {
            const cat = cmd.category || 'general';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd);
        });

        
        const CAT_ORDER = ['economy', 'moderation', 'music', 'fun', 'games', 'giveaway', 'level', 'ticket', 'utility', 'admin', 'general'];
        const sortedCats = [
            ...CAT_ORDER.filter(c => categories[c]),
            ...Object.keys(categories).filter(c => !CAT_ORDER.includes(c)),
        ];

        const options = sortedCats.map(cat => {
            const meta = CAT_META[cat] || { emoji: '📁', label: cat };
            return {
                label: meta.label,
                description: `${categories[cat].length} komut`,
                value: cat,
                emoji: meta.emoji,
            };
        });

        options.unshift({ label: 'Ana Sayfa', description: 'Yardım ana sayfasına dön', value: 'home', emoji: '🏠' });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('📂 Bir kategori seçin...')
                .addOptions(options)
        );

        
        const prisma = require('../../../database');
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const helpImage = settings?.helpEmbedImage || client.config.embeds?.helpImage;

        const categorySummary = sortedCats.map(cat => {
            const meta = CAT_META[cat] || { emoji: '📁', label: cat };
            return `${meta.emoji} **${meta.label}** — ${categories[cat].length} komut`;
        }).join('\n');

        const homeContent = [
            `## 🌟 ${client.config.botName} — Yardım Merkezi`,
            '',
            `Merhaba ${interaction.user}! Aşağıdaki menüden bir kategori seçerek komutları inceleyebilirsin.`,
            '',
            categorySummary,
            '',
            `📊 **Toplam Komut:** ${client.slashCommands.size} · 👥 **Sunucu:** ${client.guilds.cache.size}`,
            `🔗 [Davet](${client.config.developer.invite}) · [Website](${client.config.developer.website}) · [Destek](${client.config.developer.support})`,
        ].join('\n');

        const homeComponents = [
            { type: 17, accent_color: 0x5865F2, components: [{ type: 10, content: homeContent }] },
        ];
        if (helpImage) {
            homeComponents[0].components.push({ type: 11, url: helpImage });
        }

        const { resource } = await interaction.reply({
            flags: FLAGS_V2,
            components: [...homeComponents, row.toJSON()],
            withResponse: true,
        });
        const response = resource.message;

        
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 120000,
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: '❌ Bu menüyü sadece komutu kullanan kişi kullanabilir.', ephemeral: true });
            }

            const selected = i.values[0];

            if (selected === 'home') {
                await i.update({
                    flags: FLAGS_V2,
                    components: [...homeComponents, row.toJSON()],
                });
                return;
            }

            const cmds = categories[selected] || [];
            const meta = CAT_META[selected] || { emoji: '📁', label: selected };
            const color = CAT_COLORS[selected] || 0x5865F2;

            
            const sorted = [...cmds].sort((a, b) => cmdSlashName(a).localeCompare(cmdSlashName(b)));

            const cmdLines = sorted.map(c => {
                const slash = cmdSlashName(c);
                return `**\`/${slash}\`** — ${c.data.description}`;
            });

            
            const chunks = [];
            let current = [];
            let len = 0;
            for (const line of cmdLines) {
                if (len + line.length + 1 > 3800 && current.length > 0) {
                    chunks.push(current.join('\n'));
                    current = [];
                    len = 0;
                }
                current.push(line);
                len += line.length + 1;
            }
            if (current.length) chunks.push(current.join('\n'));

            const catComponents = chunks.map((chunk, idx) => ({
                type: 17,
                accent_color: color,
                components: [{
                    type: 10,
                    content: idx === 0
                        ? `## ${meta.emoji} ${meta.label} Komutları\n\n${chunk}`
                        : chunk,
                }],
            }));

            
            catComponents.push({
                type: 17,
                accent_color: color,
                components: [{
                    type: 10,
                    content: `-# ${meta.emoji} ${meta.label} · ${cmds.length} komut · Ana sayfaya dönmek için menüden 🏠 seç`,
                }],
            });

            await i.update({
                flags: FLAGS_V2,
                components: [...catComponents, row.toJSON()],
            });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                row.components[0].setDisabled(true)
            );
            interaction.editReply({ flags: FLAGS_V2, components: [...homeComponents, disabledRow.toJSON()] }).catch(() => {});
        });
    },
};
