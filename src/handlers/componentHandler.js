const prisma = require('../database');

/**
 * Button ve Select Menu interaction'larını yönetir
 */
async function handleComponent(client, interaction) {
    const customId = interaction.customId;

    
    if (customId.startsWith('br_')) {
        await handleButtonRole(client, interaction);
        return;
    }

    
    if (customId.startsWith('sr_')) {
        await handleSelectRole(client, interaction);
        return;
    }

    
    if (customId.startsWith('cr_')) {
        await handleColorRole(client, interaction);
        return;
    }

    
    if (customId.startsWith('ticket_')) {
        await handleTicket(client, interaction);
        return;
    }

    
    if (customId.startsWith('giveaway_')) {
        await handleGiveaway(client, interaction);
        return;
    }

    
    if (customId.startsWith('pr_')) {
        await handlePrivateRoom(client, interaction);
        return;
    }

    
    if (customId.startsWith('music_select_')) {
        await handleMusicSelect(client, interaction);
        return;
    }
}


async function handleButtonRole(client, interaction) {
    const roleId = interaction.customId.replace('br_', '');
    const member = interaction.member;
    const lang = (await getGuildLang(interaction.guildId));

    try {
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            await interaction.reply({
                content: client.t(lang, 'roles.removed', { role: `<@&${roleId}>` }),
                ephemeral: true,
            });
        } else {
            await member.roles.add(roleId);
            await interaction.reply({
                content: client.t(lang, 'roles.added', { role: `<@&${roleId}>` }),
                ephemeral: true,
            });
        }
    } catch (err) {
        await interaction.reply({
            content: client.t(lang, 'errors.roleError'),
            ephemeral: true,
        });
    }
}


async function handleSelectRole(client, interaction) {
    const member = interaction.member;
    const lang = (await getGuildLang(interaction.guildId));

    
    const selectedRoles = interaction.values;

    
    const selectRoles = await prisma.selectRole.findMany({
        where: { messageId: interaction.message.id },
    });

    const allRoleIds = selectRoles.map(sr => sr.roleId);

    try {
        
        for (const roleId of allRoleIds) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
            }
        }

        
        for (const roleId of selectedRoles) {
            await member.roles.add(roleId);
        }

        await interaction.reply({
            content: client.t(lang, 'roles.updated'),
            ephemeral: true,
        });
    } catch (err) {
        await interaction.reply({
            content: client.t(lang, 'errors.roleError'),
            ephemeral: true,
        });
    }
}


async function handleColorRole(client, interaction) {
    const roleId = interaction.customId.replace('cr_', '');
    const member = interaction.member;
    const lang = (await getGuildLang(interaction.guildId));

    
    const colorRoles = await prisma.colorRole.findMany({
        where: { guildId: interaction.guildId },
    });

    const colorRoleIds = colorRoles.map(cr => cr.roleId);

    try {
        
        for (const crId of colorRoleIds) {
            if (member.roles.cache.has(crId)) {
                await member.roles.remove(crId);
            }
        }

        
        await member.roles.add(roleId);

        await interaction.reply({
            content: client.t(lang, 'roles.colorChanged', { role: `<@&${roleId}>` }),
            ephemeral: true,
        });
    } catch (err) {
        await interaction.reply({
            content: client.t(lang, 'errors.roleError'),
            ephemeral: true,
        });
    }
}


async function handleTicket(client, interaction) {
    const { handleTicketInteraction } = require('../systems/ticketManager');
    await handleTicketInteraction(client, interaction);
}


async function handleGiveaway(client, interaction) {
    const { handleGiveawayInteraction } = require('../systems/giveaway');
    await handleGiveawayInteraction(client, interaction);
}


async function handlePrivateRoom(client, interaction) {
    
    
    await interaction.reply({ content: '❌ Bu özellik yakında eklenecek!', ephemeral: true });
}


async function handleMusicSelect(client, interaction) {
    const customId = interaction.customId;
    const searchId = customId.replace('music_select_', '');
    const pending = client.pendingSearches?.get(searchId);
    const lang = (await getGuildLang(interaction.guildId));

    if (!pending) {
        return interaction.reply({
            content: '❌ Bu aramanın süresi dolmuş. Lütfen tekrar `/play` komutunu kullanın.',
            ephemeral: true,
        });
    }

    if (interaction.user.id !== pending.user.id) {
        return interaction.reply({
            content: '❌ Bu menüyü sadece aramayı yapan kişi kullanabilir.',
            ephemeral: true,
        });
    }

    const index = parseInt(interaction.values[0]);
    const track = pending.tracks[index];

    if (!track) {
        return interaction.reply({
            content: '❌ Geçersiz seçim yapıldı.',
            ephemeral: true,
        });
    }

    client.pendingSearches.delete(searchId);
    await interaction.deferUpdate();

    const config = require('../../config');
    const { FLAGS_V2 } = require('../utils/embed');
    const MusicQueue = require('../systems/music/MusicQueue');

    try {
        let queue = client.musicQueues.get(interaction.guildId);

        if (!queue) {
            queue = new MusicQueue({
                guildId: interaction.guildId,
                voiceChannel: pending.voiceChannel,
                textChannel: pending.textChannel,
            });
            await queue.connect();
            client.musicQueues.set(interaction.guildId, queue);

            const origDestroy = queue.destroy.bind(queue);
            queue.destroy = () => { origDestroy(); client.musicQueues.delete(interaction.guildId); };
        }

        const { track: addedTrack, startedNow } = await queue.addTrack(track, pending.user);
        const statusLine = startedNow ? '🎵 **Şimdi Çalıyor**' : `📋 **Kuyruğa Eklendi** — ${queue.tracks.length}. sırada`;
        const textContent = `${statusLine}\n\n**${addedTrack.title}**\n⏱ \`${addedTrack.duration || '?'}\`  •  👤 ${pending.user.toString()}`;

        const container = {
            type: 17,
            accent_color: config.colors.primary,
            components: addedTrack.thumbnail
                ? [{ type: 9, components: [{ type: 10, content: textContent }], accessory: { type: 11, media: { url: addedTrack.thumbnail } } }]
                : [{ type: 10, content: textContent }],
        };

        await interaction.editReply({
            flags: FLAGS_V2,
            components: [container]
        });

    } catch (err) {
        console.error('[Music Select Error]', err);
        const errorContainer = {
            type: 17,
            accent_color: config.colors.error,
            components: [{ type: 10, content: `## ❌ Hata\nŞarkı sıraya eklenirken hata oluştu: ${err.message}` }]
        };
        await interaction.editReply({
            flags: FLAGS_V2,
            components: [errorContainer]
        });
    }
}


async function getGuildLang(guildId) {
    const settings = await prisma.guildSettings.findUnique({ where: { id: guildId } });
    return settings?.language || 'tr';
}

module.exports = { handleComponent };
