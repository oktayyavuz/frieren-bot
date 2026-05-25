const prisma = require('../database');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../utils/embed');
const config = require('../../config');


const giveawayTimers = new Map();

/**
 * Giveaway timer'larını başlat (recovery ve yeni oluşturma için)
 */
async function startGiveawayTimers(client) {
    const activeGiveaways = await prisma.giveaway.findMany({
        where: { ended: false },
    });

    for (const giveaway of activeGiveaways) {
        scheduleGiveaway(client, giveaway);
    }

    console.log(`[GIVEAWAY] ${activeGiveaways.length} aktif çekiliş yüklendi.`);
}

/**
 * Tek bir giveaway için timer kur
 */
function scheduleGiveaway(client, giveaway) {
    const remaining = giveaway.endTime.getTime() - Date.now();

    if (remaining <= 0) {
        
        endGiveaway(client, giveaway.id);
        return;
    }

    const timer = setTimeout(() => {
        endGiveaway(client, giveaway.id);
    }, remaining);

    giveawayTimers.set(giveaway.id, timer);
}

/**
 * Giveaway sonuçlandır
 */
async function endGiveaway(client, giveawayId) {
    try {
        const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId } });
        if (!giveaway || giveaway.ended) return;

        const guild = client.guilds.cache.get(giveaway.guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(giveaway.channelId);
        if (!channel) return;

        let participants;
        try {
            participants = JSON.parse(giveaway.participants || '[]');
        } catch (e) {
            participants = [];
        }

        
        const winnerIds = [];
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(giveaway.winners, shuffled.length); i++) {
            winnerIds.push(shuffled[i]);
        }

        
        await prisma.giveaway.update({
            where: { id: giveawayId },
            data: {
                ended: true,
                winnerIds: JSON.stringify(winnerIds),
            },
        });

        
        try {
            const message = await channel.messages.fetch(giveaway.messageId);
            const settings = await prisma.guildSettings.findUnique({ where: { id: giveaway.guildId } });
            const lang = settings?.language || 'tr';

            let winnerText;
            if (winnerIds.length === 0) {
                winnerText = client.t(lang, 'commands.giveaway.noWinner');
            } else {
                winnerText = winnerIds.map(id => `<@${id}>`).join(', ');
            }

            const embed = createEmbed({
                color: config.colors.error,
                title: `🎉 Çekiliş Sona Erdi!`,
                description: `**Ödül:** ${giveaway.prize}\n**Kazanan${winnerIds.length > 1 ? 'lar' : ''}:** ${winnerText}`,
                fields: [
                    { name: 'Katılımcı Sayısı', value: `${participants.length}`, inline: true },
                    { name: 'Düzenleyen', value: `<@${giveaway.hostId}>`, inline: true },
                ],
                footer: { text: 'Çekiliş sona erdi' },
            });

            await message.edit({ flags: FLAGS_V2, components: [embedToV2(embed)] });

            
            if (winnerIds.length > 0) {
                await channel.send({
                    content: `🎉 Tebrikler ${winnerIds.map(id => `<@${id}>`).join(', ')}! **${giveaway.prize}** kazandınız!`,
                });
            }
        } catch (err) {
            
        }

        
        giveawayTimers.delete(giveawayId);
    } catch (err) {
        console.error('[GIVEAWAY] Sonuçlandırma hatası:', err);
    }
}

/**
 * Giveaway butonuna basıldığında
 */
async function handleGiveawayInteraction(client, interaction) {
    const giveawayId = parseInt(interaction.customId.replace('giveaway_', ''));
    const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId } });

    if (!giveaway || giveaway.ended) {
        return interaction.reply({ content: '❌ Bu çekiliş sona ermiş!', ephemeral: true });
    }

    const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
    const lang = settings?.language || 'tr';

    let participants;
    try {
        participants = JSON.parse(giveaway.participants || '[]');
    } catch (e) {
        participants = [];
    }

    if (participants.includes(interaction.user.id)) {
        
        participants = participants.filter(id => id !== interaction.user.id);
        await prisma.giveaway.update({
            where: { id: giveawayId },
            data: { participants: JSON.stringify(participants) },
        });
        return interaction.reply({
            content: client.t(lang, 'commands.giveaway.leave'),
            ephemeral: true,
        });
    }

    
    participants.push(interaction.user.id);
    await prisma.giveaway.update({
        where: { id: giveawayId },
        data: { participants: JSON.stringify(participants) },
    });

    
    try {
        const message = await interaction.channel.messages.fetch(giveaway.messageId);
        const embed = createEmbed({
            color: config.colors.primary,
            title: `🎉 Çekiliş!`,
            description: `**Ödül:** ${giveaway.prize}\n\n**Bitiş:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>\n**Katılımcı:** ${participants.length}\n**Kazanan Sayısı:** ${giveaway.winners}`,
            footer: { text: `Düzenleyen: ${(await client.users.fetch(giveaway.hostId)).tag}` },
        });
        await message.edit({ flags: FLAGS_V2, components: [embedToV2(embed)] });
    } catch (e) { }

    return interaction.reply({
        content: client.t(lang, 'commands.giveaway.join'),
        ephemeral: true,
    });
}

module.exports = { startGiveawayTimers, scheduleGiveaway, endGiveaway, handleGiveawayInteraction };
