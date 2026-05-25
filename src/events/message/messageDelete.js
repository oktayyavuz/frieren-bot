const prisma = require('../../database');

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(client, message) {
        if (!message.guild) return;
        if (message.author?.bot) return;

        
        try {
            client.snipes.set(message.channel.id, {
                content: message.content || '',
                author: message.author?.tag || 'Bilinmiyor',
                authorId: message.author?.id,
                attachmentUrl: message.attachments.first()?.proxyURL || null,
                timestamp: Date.now(),
            });

            
            await prisma.snipe.create({
                data: {
                    guildId: message.guild.id,
                    channelId: message.channel.id,
                    userId: message.author?.id || '0',
                    content: message.content || '',
                    attachmentUrl: message.attachments.first()?.proxyURL || null,
                },
            });

            
            const snipes = await prisma.snipe.findMany({
                where: { channelId: message.channel.id },
                orderBy: { createdAt: 'desc' },
                skip: 10,
            });
            if (snipes.length > 0) {
                await prisma.snipe.deleteMany({
                    where: { id: { in: snipes.map(s => s.id) } },
                });
            }
        } catch (err) {
            
        }

        
        
        
        try {
            const settings = await prisma.guildSettings.findUnique({
                where: { id: message.guild.id },
            });

            if (settings?.loggingEnabled && settings?.messageLogChannel) {
                const logChannel = message.guild.channels.cache.get(settings.messageLogChannel);
                if (logChannel) {
                    const { createEmbed, embedToV2, FLAGS_V2 } = require('../../utils/embed');
                    const embed = createEmbed({
                        color: 0xE74C3C,
                        title: '🗑️ Mesaj Silindi',
                        fields: [
                            { name: 'Kullanıcı', value: `${message.author?.tag || 'Bilinmiyor'} (${message.author?.id || '?'})`, inline: true },
                            { name: 'Kanal', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'İçerik', value: message.content?.slice(0, 1024) || '*İçerik yok*' },
                        ],
                    });

                    if (message.attachments.size > 0) {
                        embed.addFields({ name: 'Ek', value: message.attachments.map(a => a.proxyURL).join('\n').slice(0, 1024) });
                    }

                    await logChannel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] });
                }
            }
        } catch (err) {
            
        }
    },
};
