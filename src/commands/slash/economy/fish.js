const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../../utils/embed');
const { getGuildUser, formatNumber, discordTimestamp } = require('../../../utils/helpers');
const prisma = require('../../../database');
const config = require('../../../../config');
const logger = require('../../../utils/logger');

const FISH_COOLDOWN = 5 * 60 * 1000; 

const FISH_TABLE = [
    
    { emoji: '🥾',  name: 'Eski Çizme',         min: 0,    max: 5,    weight: 15, rarity: 'Çöp'     },
    { emoji: '🧦',  name: 'Islak Çorap',         min: 0,    max: 5,    weight: 12, rarity: 'Çöp'     },
    { emoji: '🐟',  name: 'Küçük Balık',         min: 10,   max: 30,   weight: 25, rarity: 'Common'  },
    { emoji: '🐠',  name: 'Tropik Balık',        min: 20,   max: 60,   weight: 20, rarity: 'Common'  },
    { emoji: '🦐',  name: 'Karides',             min: 15,   max: 45,   weight: 18, rarity: 'Common'  },
    { emoji: '🦑',  name: 'Ahtapot',             min: 40,   max: 100,  weight: 14, rarity: 'Uncommon'},
    { emoji: '🐡',  name: 'Balon Balığı',        min: 50,   max: 120,  weight: 12, rarity: 'Uncommon'},
    { emoji: '🦞',  name: 'Istakoz',             min: 80,   max: 200,  weight: 8,  rarity: 'Rare'    },
    { emoji: '🐙',  name: 'Dev Ahtapot',         min: 120,  max: 300,  weight: 6,  rarity: 'Rare'    },
    { emoji: '🐬',  name: 'Yunus',               min: 200,  max: 500,  weight: 4,  rarity: 'Epic'    },
    { emoji: '🦈',  name: 'Köpekbalığı',         min: 300,  max: 700,  weight: 3,  rarity: 'Epic'    },
    { emoji: '🐋',  name: 'Mavi Balina',         min: 500,  max: 1200, weight: 2,  rarity: 'Legendary'},
    { emoji: '🌟',  name: 'Frieren\'in Balığı',  min: 1000, max: 3000, weight: 1,  rarity: 'Mythic'  },
];

const RARITY_COLORS = {
    'Çöp':       '⬛',
    'Common':    '⬜',
    'Uncommon':  '🟩',
    'Rare':      '🟦',
    'Epic':      '🟪',
    'Legendary': '🟨',
    'Mythic':    '🟥',
};

function weightedPick() {
    const total = FISH_TABLE.reduce((s, f) => s + f.weight, 0);
    let rnd = Math.random() * total;
    for (const fish of FISH_TABLE) {
        rnd -= fish.weight;
        if (rnd <= 0) return fish;
    }
    return FISH_TABLE[0];
}

const WAIT_MESSAGES = [
    'Yem suya düştü... 🎣',
    'Bekle, bir şeyler hissettim... 🌊',
    'Oltada hafif bir çekilme var... 🎣',
    'Sualtı çok sakin bu gece... 🌙',
    'Frieren\'in büyülü gölünde avlanıyorsun... ✨',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setNameLocalizations({ tr: 'balık-tut' })
        .setDescription('Go fishing and earn Okane!')
        .setDescriptionLocalizations({ tr: 'Balık tut ve Okane kazan!' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        const { checkModule } = require('../../../utils/moduleHelper');
        if (!(await checkModule(interaction, 'economyEnabled'))) return;

        const guildUser = await getGuildUser(interaction.user.id, interaction.guildId);
        const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
        const currency = settings?.currencyName || config.economy.currencyName;

        
        let inventory = [];
        try { inventory = JSON.parse(guildUser.inventory || '[]'); } catch {}
        const hasRod = inventory.some(i => i.name?.toLowerCase().includes('olta') || i.name?.toLowerCase().includes('fishing'));

        
        const cooldownKey = `fish-${interaction.guildId}-${interaction.user.id}`;
        if (!client._fishCooldowns) client._fishCooldowns = new Map();
        const lastFish = client._fishCooldowns.get(cooldownKey) || 0;
        const remaining = FISH_COOLDOWN - (Date.now() - lastFish);

        if (remaining > 0) {
            const nextTime = new Date(Date.now() + remaining);
            return interaction.reply({
                embeds: [errorEmbed(`⏱ Oltanı tekrar suya atmak için beklemen lazım!\n${discordTimestamp(nextTime)} bekleniyor.`)],
                ephemeral: true,
            });
        }

        client._fishCooldowns.set(cooldownKey, Date.now());
        await interaction.deferReply();

        
        await new Promise(r => setTimeout(r, 1500));

        
        const table = hasRod
            ? FISH_TABLE.map(f => ({ ...f, weight: f.rarity === 'Çöp' ? Math.max(1, f.weight - 5) : f.weight + 2 }))
            : FISH_TABLE;

        const caught = weightedPick.call({ table }) ?? weightedPick();

        
        const value = Math.floor(Math.random() * (caught.max - caught.min + 1)) + caught.min;

        if (value > 0) {
            await prisma.guildUser.update({
                where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                data: { balance: { increment: value } },
            });
        }

        const waitMsg = WAIT_MESSAGES[Math.floor(Math.random() * WAIT_MESSAGES.length)];
        const rarityStr = `${RARITY_COLORS[caught.rarity]} ${caught.rarity}`;

        let resultMsg;
        if (value === 0) {
            resultMsg = `*${waitMsg}*\n\n${caught.emoji} **${caught.name}** yakaladın.\nNe yazık ki satış değeri yok. Geçmiş olsun!`;
        } else {
            resultMsg = `*${waitMsg}*\n\n${caught.emoji} **${caught.name}** yakaladın! ${rarityStr}\n\n💰 **+${formatNumber(value)} ${currency}** kazandın!`;
        }

        if (hasRod) resultMsg += '\n-# 🎣 Olta bonusu aktif!';

        logger.info(`Fish: ${interaction.user.tag} caught ${caught.name} (${formatNumber(value)} ${currency}) in ${interaction.guild.name}`, 'ECONOMY');

        await interaction.editReply({
            embeds: [value > 0 ? successEmbed(resultMsg, null, 'economy') : errorEmbed(resultMsg)],
        });
    },
};
