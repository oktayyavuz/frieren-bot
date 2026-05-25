const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const prisma = require('../database');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../utils/embed');
const config = require('../../config');

/**
 * Ticket interaction handler
 */
async function handleTicketInteraction(client, interaction) {
    const customId = interaction.customId;
    const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });
    const lang = settings?.language || 'tr';

    
    if (customId.startsWith('ticket_create_')) {
        let categoryId = customId.replace('ticket_create_', '');
        
        if (categoryId === 'default') {
            const firstCategory = await prisma.ticketCategory.findFirst({
                where: { guildId: interaction.guildId }
            });
            categoryId = firstCategory?.id || null;
        } else {
            categoryId = parseInt(categoryId);
            if (isNaN(categoryId)) categoryId = null; 
        }

        await createTicket(client, interaction, categoryId, lang);
        return;
    }

    
    if (customId === 'ticket_close') {
        await closeTicket(client, interaction, lang);
        return;
    }

    
    if (customId === 'ticket_transcript') {
        await generateTranscript(client, interaction, lang);
        return;
    }

    
    if (customId === 'ticket_delete') {
        await interaction.reply({ content: '⏳ Kanal 5 saniye içinde silinecek...', ephemeral: false });
        setTimeout(async () => {
            await interaction.channel.delete().catch(() => { });
        }, 5000);
        return;
    }
}

/**
 * Yeni ticket oluştur
 */
async function createTicket(client, interaction, categoryId, lang) {
    
    const existingTicket = await prisma.ticket.findFirst({
        where: {
            guildId: interaction.guildId,
            userId: interaction.user.id,
            status: 'open',
        },
    });

    if (existingTicket) {
        return interaction.reply({
            content: `❌ Zaten açık bir talebin var: <#${existingTicket.channelId}>`,
            ephemeral: true,
        });
    }

    const category = categoryId ? await prisma.ticketCategory.findUnique({ where: { id: categoryId } }) : null;

    
    const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category?.categoryChannelId || null,
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
            },
            {
                id: client.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
            },
        ],
    });

    
    if (category?.staffRoleId) {
        await channel.permissionOverwrites.edit(category.staffRoleId, {
            ViewChannel: true,
            SendMessages: true,
        });
    }

    
    await prisma.ticket.create({
        data: {
            guildId: interaction.guildId,
            channelId: channel.id,
            userId: interaction.user.id,
            userTag: interaction.user.tag, 
            categoryId: category?.id || null,
        },
    });

    
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel(client.t(lang, 'systems.ticket.closeButton'))
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('ticket_transcript')
            .setLabel(client.t(lang, 'systems.ticket.transcriptButton'))
            .setStyle(ButtonStyle.Secondary),
    );

    const embed = createEmbed({
        color: config.colors.primary,
        title: `🎫 Destek Talebi`,
        description: `Merhaba ${interaction.user}!\n\nDestek talebin oluşturuldu. Lütfen sorununuzu detaylı bir şekilde açıklayın.\nBir yetkili en kısa sürede size yardımcı olacaktır.`,
        fields: [
            { name: 'Kategori', value: category?.name || 'Genel', inline: true },
            { name: 'Oluşturan', value: interaction.user.tag, inline: true },
        ],
    });

    await channel.send({ flags: FLAGS_V2, components: [embedToV2(embed), buttons] });

    await interaction.reply({
        content: client.t(lang, 'systems.ticket.created', { channel: `<#${channel.id}>` }),
        ephemeral: true,
    });
}

/**
 * Ticket kapat
 */
async function closeTicket(client, interaction, lang) {
    const ticket = await prisma.ticket.findUnique({ where: { channelId: interaction.channel.id } });
    if (!ticket) {
        return interaction.reply({ content: '❌ Bu kanal bir ticket değil!', ephemeral: true });
    }

    await prisma.ticket.update({
        where: { channelId: interaction.channel.id },
        data: { status: 'closed', closedAt: new Date() },
    });

    
    await interaction.channel.permissionOverwrites.edit(ticket.userId, {
        SendMessages: false,
    });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_transcript')
            .setLabel(client.t(lang, 'systems.ticket.transcriptButton'))
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('ticket_delete')
            .setLabel(client.t(lang, 'systems.ticket.deleteButton'))
            .setStyle(ButtonStyle.Danger),
    );

    const embed = createEmbed({
        color: config.colors.error,
        description: `🔒 ${client.t(lang, 'systems.ticket.closed')}`,
    });

    await interaction.reply({ embeds: [embed], components: [buttons] });
}

/**
 * Transkript oluştur
 */
async function generateTranscript(client, interaction, lang) {
    await interaction.deferReply({ ephemeral: true });

    
    let allMessages = [];
    let lastId = null;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const fetchedMessages = await interaction.channel.messages.fetch(options);
        if (fetchedMessages.size === 0) break;

        allMessages.push(...fetchedMessages.values());
        lastId = fetchedMessages.last().id;

        
        if (allMessages.length >= 1000) break;
    }

    const sorted = allMessages.reverse();

    
    const ticketData = await prisma.ticket.findUnique({ 
        where: { channelId: interaction.channel.id },
        include: { category: true }
    });

    
    const structuredTranscript = sorted.map(msg => ({
        id: msg.id,
        authorName: msg.author.tag,
        authorAvatar: msg.author.displayAvatarURL({ dynamic: true }),
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        
        isStaff: msg.member?.permissions.has(PermissionFlagsBits.ManageMessages) || 
                 (ticketData?.category?.staffRoleId && msg.member?.roles.cache.has(ticketData.category.staffRoleId)) || 
                 false,
        attachments: msg.attachments.map(att => ({
            name: att.name,
            url: att.url,
            proxyURL: att.proxyURL,
            contentType: att.contentType,
            size: att.size,
            
            width: att.width,
            height: att.height
        })),
        embeds: msg.embeds.map(e => ({
            title: e.title,
            description: e.description,
            url: e.url,
            color: e.color,
            timestamp: e.timestamp,
            footer: e.footer ? { text: e.footer.text, iconURL: e.footer.iconURL } : null,
            image: e.image ? { 
                url: e.image.url, 
                proxyURL: e.image.proxyURL,
                width: e.image.width,
                height: e.image.height
            } : null,
            thumbnail: e.thumbnail ? { 
                url: e.thumbnail.url,
                proxyURL: e.thumbnail.proxyURL,
                width: e.thumbnail.width,
                height: e.thumbnail.height
            } : null,
            author: e.author ? { name: e.author.name, iconURL: e.author.iconURL, url: e.author.url } : null,
            fields: e.fields.map(f => ({ name: f.name, value: f.value, inline: f.inline }))
        }))
    }));

    
    const ticket = await prisma.ticket.update({
        where: { channelId: interaction.channel.id },
        data: { 
            transcript: JSON.stringify(structuredTranscript),
            status: 'closed',
            closedAt: new Date()
        },
    });

    
    let textTranscript = `=== Ticket Transkript ===\nKanal: ${interaction.channel.name}\nTarih: ${new Date().toLocaleString('tr-TR')}\n========================\n\n`;
    for (const msg of sorted) {
        textTranscript += `[${msg.createdAt.toLocaleString('tr-TR')}] ${msg.author.tag}: ${msg.content || '[Ek/Dosya]'}\n`;
    }

    
    const transcriptUrl = `${config.baseUrl}/dashboard/${interaction.guildId}/tickets/${ticket.id}/transcript`;

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Web Paneli\'nde Görüntüle')
            .setStyle(ButtonStyle.Link)
            .setURL(transcriptUrl)
    );

    const buffer = Buffer.from(textTranscript, 'utf-8');
    await interaction.editReply({
        content: `📝 Transkript oluşturuldu! Aşağıdaki butona tıklayarak web panelinden inceleyebilirsin.`,
        files: [{ attachment: buffer, name: `transcript-${interaction.channel.name}.txt` }],
        components: [row]
    });
}

module.exports = { handleTicketInteraction };
