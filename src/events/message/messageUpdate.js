const prisma = require('../../database');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../../utils/embed');

module.exports = {
    name: 'messageUpdate',
    once: false,
    async execute(client, oldMessage, newMessage) {
        if (!oldMessage.guild) return;
        if (oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        try {
            const settings = await prisma.guildSettings.findUnique({
                where: { id: oldMessage.guild.id },
            });

            if (settings?.loggingEnabled && settings?.messageLogChannel) {
                const logChannel = oldMessage.guild.channels.cache.get(settings.messageLogChannel);
                if (logChannel) {
                    const embed = createEmbed({
                        color: 0xF39C12,
                        title: '✏️ Mesaj Düzenlendi',
                        fields: [
                            { name: 'Kullanıcı', value: `${oldMessage.author?.tag} (${oldMessage.author?.id})`, inline: true },
                            { name: 'Kanal', value: `<#${oldMessage.channel.id}>`, inline: true },
                            { name: 'Eski İçerik', value: oldMessage.content?.slice(0, 1024) || '*İçerik yok*' },
                            { name: 'Yeni İçerik', value: newMessage.content?.slice(0, 1024) || '*İçerik yok*' },
                        ],
                    });

                    await logChannel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] });
                }
            }
        } catch (err) {
            
        }
    },
};
