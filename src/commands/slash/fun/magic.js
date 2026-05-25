const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const { getGuildUser, formatNumber } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');
const { getRandomSpell, RARITY_COLORS, RARITY_EMOJIS, RARITY_ORDER } = require('../../../utils/spells');
const spells = require('../../../utils/spells');


const pendingDuels = new Map();

function container(color, content, extra = []) {
    return { type: 17, accent_color: color, components: [{ type: 10, content }, ...extra] };
}

function rarityOrder(r) {
    return RARITY_ORDER.indexOf(r);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('magic')
        .setNameLocalizations({ tr: 'büyü' })
        .setDescription('Frieren\'s Magic System')
        .setDescriptionLocalizations({ tr: 'Frieren Büyü Sistemi' })
        .addSubcommand(sub =>
            sub.setName('study')
               .setNameLocalizations({ tr: 'çalış' })
               .setDescription('Study magic to find new spells (1h cooldown)')
               .setDescriptionLocalizations({ tr: 'Yeni büyüler bulmak için çalış (1 saatte bir)' })
        )
        .addSubcommand(sub =>
            sub.setName('library')
               .setNameLocalizations({ tr: 'kütüphane' })
               .setDescription('View your spell collection (Grimoire)')
               .setDescriptionLocalizations({ tr: 'Büyü koleksiyonunu gör (Grimoire)' })
               .addUserOption(opt => opt.setName('user').setDescription('View another user\'s grimoire'))
        )
        .addSubcommand(sub =>
            sub.setName('cast')
               .setNameLocalizations({ tr: 'kullan' })
               .setDescription('Cast one of your spells for a random effect')
               .setDescriptionLocalizations({ tr: 'Sahip olduğun büyülerden birini kullan' })
               .addStringOption(opt => opt
                   .setName('spell')
                   .setNameLocalizations({ tr: 'büyü' })
                   .setDescription('Spell name or ID')
                   .setDescriptionLocalizations({ tr: 'Büyü adı veya ID\'si' })
                   .setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('duel')
               .setNameLocalizations({ tr: 'düello' })
               .setDescription('Challenge someone to a magic duel!')
               .setDescriptionLocalizations({ tr: 'Birini büyü düellosuna davet et!' })
               .addUserOption(opt => opt
                   .setName('opponent')
                   .setNameLocalizations({ tr: 'rakip' })
                   .setDescription('Who to duel')
                   .setDescriptionLocalizations({ tr: 'Düello rakibi' })
                   .setRequired(true))
               .addIntegerOption(opt => opt
                   .setName('bet')
                   .setNameLocalizations({ tr: 'bahis' })
                   .setDescription('Okane bet (optional)')
                   .setDescriptionLocalizations({ tr: 'Okane bahisi (opsiyonel)' })
                   .setMinValue(0))
        ),
    cooldown: 3,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        
        
        
        if (sub === 'study') {
            await interaction.deferReply();

            const dbUser = await getGuildUser(userId, guildId);
            const collected = JSON.parse(dbUser.magicCollection || '[]');
            const spell = getRandomSpell();
            const alreadyHas = collected.some(s => s.id === spell.id);

            if (!alreadyHas) {
                collected.push({ id: spell.id, name: spell.name, collectedAt: new Date().toISOString() });
                await prisma.guildUser.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { magicCollection: JSON.stringify(collected) },
                });

                const content = [
                    `## ✨ Yeni Büyü Keşfedildi!`,
                    '',
                    `${RARITY_EMOJIS[spell.rarity]} **${spell.emoji} ${spell.name}**`,
                    `*${spell.description}*`,
                    '',
                    `Nadirlik: **${spell.rarity}**  •  Güç: **${spell.power}**`,
                    `Grimoire: **${collected.length} / ${spells.length}** büyü`,
                ].join('\n');

                return interaction.editReply({
                    flags: FLAGS_V2,
                    components: [container(RARITY_COLORS[spell.rarity], content)],
                });
            } else {
                
                await prisma.guildUser.update({
                    where: { userId_guildId: { userId, guildId } },
                    data: { xp: { increment: 50 } },
                });

                const content = [
                    `## 📖 Çalışma Tamamlandı`,
                    '',
                    `Bugün yeni bir büyü bulamadın ama mevcut büyülerini pekiştirdin.`,
                    `**+50 XP** kazandın!`,
                    '',
                    `Grimoire: **${collected.length} / ${spells.length}** büyü`,
                ].join('\n');

                return interaction.editReply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.info, content)],
                });
            }
        }

        
        
        
        if (sub === 'library') {
            const target = interaction.options.getUser('user') || interaction.user;
            const dbUser = await getGuildUser(target.id, guildId);
            const collected = JSON.parse(dbUser.magicCollection || '[]');

            if (collected.length === 0) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.warning,
                        `## 📜 Boş Grimoire\n${target.id === userId ? 'Henüz hiç büyü toplamadın!' : `${target.username} henüz büyü toplamadı!`}\n\`/magic study\` komutuyla başla.`)],
                    ephemeral: true,
                });
            }

            
            const sorted = [...collected].sort((a, b) => {
                const sa = spells.find(s => s.id === a.id);
                const sb = spells.find(s => s.id === b.id);
                return rarityOrder(sb?.rarity || 'Common') - rarityOrder(sa?.rarity || 'Common');
            });

            const lines = sorted.map(c => {
                const s = spells.find(x => x.id === c.id);
                return `${RARITY_EMOJIS[s?.rarity || 'Common']} ${s?.emoji || '✨'} **${c.name}**`;
            });

            
            const page = lines.slice(0, 20).join('\n');
            const content = [
                `## 📜 ${target.username}'in Grimoire\'u`,
                `Keşfedilen: **${collected.length} / ${spells.length}** büyü`,
                '',
                page,
                collected.length > 20 ? `\n*...ve ${collected.length - 20} büyü daha*` : '',
            ].join('\n');

            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.primary, content)],
            });
        }

        
        
        
        if (sub === 'cast') {
            const spellQuery = interaction.options.getString('spell').toLowerCase();
            const dbUser = await getGuildUser(userId, guildId);
            const collected = JSON.parse(dbUser.magicCollection || '[]');

            if (collected.length === 0) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.warning, '## ❌ Hiç büyün yok!\n`/magic study` ile büyü topla.')],
                    ephemeral: true,
                });
            }

            const found = collected.find(c => {
                const s = spells.find(x => x.id === c.id);
                return c.id === spellQuery || c.name.toLowerCase().includes(spellQuery) || s?.name.toLowerCase().includes(spellQuery);
            });

            if (!found) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.error, `## ❌ Büyü Bulunamadı\n"${spellQuery}" adında bir büyün yok.\n\`/magic library\` ile koleksiyonunu kontrol et.`)],
                    ephemeral: true,
                });
            }

            const spell = spells.find(s => s.id === found.id);

            
            const effects = [
                { desc: `+${spell.power * 3} XP kazandın! 📈`, fn: () => prisma.guildUser.update({ where: { userId_guildId: { userId, guildId } }, data: { xp: { increment: spell.power * 3 } } }) },
                { desc: `+${spell.power * 2} Okane hissetti! 💰`, fn: () => prisma.guildUser.update({ where: { userId_guildId: { userId, guildId } }, data: { balance: { increment: spell.power * 2 } } }) },
                { desc: 'Büyü saf görünümlü bir ışık yarattı. Etkisi bilinmiyor... 🌟', fn: () => Promise.resolve() },
                { desc: `Büyünün gücü etrafındaki havayı elektrik yükledi. +${spell.power} XP 🔋`, fn: () => prisma.guildUser.update({ where: { userId_guildId: { userId, guildId } }, data: { xp: { increment: spell.power } } }) },
            ];

            const effect = effects[Math.floor(Math.random() * effects.length)];
            await effect.fn();

            const content = [
                `## ${spell.emoji} ${spell.name}`,
                `*${spell.description}*`,
                '',
                `> ${effect.desc}`,
                '',
                `-# 👤 ${interaction.user.toString()} • Güç: ${spell.power}`,
            ].join('\n');

            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(RARITY_COLORS[spell.rarity], content)],
            });
        }

        
        
        
        if (sub === 'duel') {
            const opponent = interaction.options.getMember('opponent');
            const bet = interaction.options.getInteger('bet') ?? 0;

            if (opponent.user.id === userId) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.error, '## ❌ Kendine meydan okuyamazsın!')],
                    ephemeral: true,
                });
            }
            if (opponent.user.bot) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.error, '## ❌ Botlarla dövüşemezsin!')],
                    ephemeral: true,
                });
            }

            const challengerData = await getGuildUser(userId, guildId);
            const challengerSpells = JSON.parse(challengerData.magicCollection || '[]');

            if (challengerSpells.length === 0) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.error, '## ❌ Hiç büyün yok!\n`/magic study` ile büyü topla.')],
                    ephemeral: true,
                });
            }
            if (bet > 0 && challengerData.balance < bet) {
                return interaction.reply({
                    flags: FLAGS_V2,
                    components: [container(config.colors.error, `## ❌ Yeterli bakiyen yok!\nBakiye: **${formatNumber(challengerData.balance)} Okane**`)],
                    ephemeral: true,
                });
            }

            const duelKey = `${opponent.user.id}-${guildId}`;
            pendingDuels.set(duelKey, {
                challengerId: userId,
                challengerName: interaction.user.username,
                bet,
                timestamp: Date.now(),
            });

            
            setTimeout(() => pendingDuels.delete(duelKey), 60000);

            const betLine = bet > 0 ? `\n💰 **Bahis:** ${formatNumber(bet)} Okane` : '';
            const content = [
                `## ⚔️ Büyü Düellosu Daveti!`,
                '',
                `${interaction.user.toString()} → ${opponent.toString()}${betLine}`,
                '',
                `${opponent.toString()}, **60 saniye** içinde \`/magic duel\` komutunu kullanarak karşılık ver!`,
                '*(Rakip aynı komutu sana karşı kullanmalı)*',
                '',
                `-# Spellcaster: ${interaction.user.toString()}`,
            ].join('\n');

            return interaction.reply({
                flags: FLAGS_V2,
                components: [container(config.colors.moderation, content)],
            });
        }
    },
};

module.exports.pendingDuels = pendingDuels;
