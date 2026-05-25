const { Collection } = require('discord.js');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../utils/embed');


const joinTracker = new Collection();

/**
 * Anti-raid kontrolü
 */
async function checkAntiRaid(client, member, settings) {
    const guildId = member.guild.id;

    if (!joinTracker.has(guildId)) {
        joinTracker.set(guildId, []);
    }

    const joins = joinTracker.get(guildId);
    const now = Date.now();
    const interval = settings.antiRaidInterval || 10000;

    
    const recentJoins = joins.filter(t => now - t < interval);
    recentJoins.push(now);
    joinTracker.set(guildId, recentJoins);

    
    if (recentJoins.length >= (settings.antiRaidLimit || 10)) {
        console.log(`[ANTI-RAID] ${member.guild.name} sunucusunda raid tespit edildi!`);

        const action = settings.antiRaidAction || 'kick';
        const lang = settings.language;

        
        const recentMembers = await member.guild.members.fetch({ limit: recentJoins.length });
        const newest = [...recentMembers.values()]
            .sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)
            .slice(0, recentJoins.length);

        for (const m of newest) {
            if (m.user.bot) continue;
            if (m.permissions.has('Administrator')) continue;

            try {
                switch (action) {
                    case 'kick':
                        await m.kick('[Anti-Raid] Otomatik işlem');
                        break;
                    case 'ban':
                        await m.ban({ reason: '[Anti-Raid] Otomatik işlem' });
                        break;
                    case 'timeout':
                        await m.timeout(600000, '[Anti-Raid] Otomatik işlem'); 
                        break;
                }
            } catch (err) {
                
            }
        }

        
        if (settings.modLogChannel) {
            const logChannel = member.guild.channels.cache.get(settings.modLogChannel);
            if (logChannel) {
                const embed = createEmbed({
                    color: 0xE74C3C,
                    title: '🚨 Anti-Raid Aktif!',
                    description: client.t(lang, 'systems.antiRaid.triggered', {
                        count: recentJoins.length,
                        interval: Math.floor(interval / 1000),
                        action: action,
                    }),
                    fields: [
                        { name: 'Etkilenen Üyeler', value: newest.map(m => m.user.tag).join('\n').slice(0, 1024) || 'Yok' },
                    ],
                });
                await logChannel.send({ content: '@everyone', flags: FLAGS_V2, components: [embedToV2(embed)] }).catch(() => { });
            }
        }

        
        joinTracker.set(guildId, []);
    }
}

module.exports = { checkAntiRaid };
