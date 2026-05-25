const prisma = require('../../database');
const { getGuildSettings } = require('../../utils/helpers');
const { createEmbed, embedToV2, FLAGS_V2 } = require('../../utils/embed');

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(client, oldState, newState) {
        const guild = newState.guild || oldState.guild;
        if (!guild) return;

        const settings = await getGuildSettings(guild.id);

        
        
        
        if (settings.privateRoomEnabled && settings.privateRoomChannelId) {
            
            if (newState.channelId === settings.privateRoomChannelId) {
                try {
                    const channel = await guild.channels.create({
                        name: `🔊 ${newState.member.displayName}'in Odası`,
                        type: 2, 
                        parent: settings.privateRoomCategoryId || null,
                        permissionOverwrites: [
                            {
                                id: newState.member.id,
                                allow: ['ManageChannels', 'MoveMembers', 'MuteMembers', 'DeafenMembers'],
                            },
                        ],
                    });

                    
                    await newState.member.voice.setChannel(channel);

                    
                    await prisma.privateRoom.create({
                        data: {
                            guildId: guild.id,
                            channelId: channel.id,
                            ownerId: newState.member.id,
                        },
                    });
                } catch (err) {
                    console.error('[PRIVATE_ROOM] Oda oluşturma hatası:', err.message);
                }
            }

            
            if (oldState.channelId && oldState.channelId !== newState.channelId) {
                const room = await prisma.privateRoom.findUnique({
                    where: { channelId: oldState.channelId },
                });

                if (room) {
                    const channel = guild.channels.cache.get(oldState.channelId);
                    if (channel && channel.members.size === 0) {
                        await channel.delete().catch(() => { });
                        await prisma.privateRoom.delete({ where: { channelId: oldState.channelId } }).catch(() => { });
                    }
                }
            }
        }

        
        
        
        if (settings.levelingEnabled) {
            
            if (newState.channelId && !oldState.channelId) {
                const interval = setInterval(async () => {
                    try {
                        const member = guild.members.cache.get(newState.member.id);
                        if (!member?.voice?.channelId) {
                            clearInterval(interval);
                            client.voiceXpIntervals.delete(`${guild.id}-${newState.member.id}`);
                            return;
                        }

                        
                        if (!member.voice.deaf && !member.voice.mute) {
                            await prisma.guildUser.upsert({
                                where: { userId_guildId: { userId: newState.member.id, guildId: guild.id } },
                                update: {
                                    xp: { increment: client.config.leveling.xpPerVoiceMinute },
                                    voiceMinutes: { increment: 1 },
                                },
                                create: {
                                    userId: newState.member.id,
                                    guildId: guild.id,
                                    xp: client.config.leveling.xpPerVoiceMinute,
                                    voiceMinutes: 1,
                                },
                            });
                        }
                    } catch (err) {
                        
                    }
                }, 60000); 

                client.voiceXpIntervals.set(`${guild.id}-${newState.member.id}`, interval);
            }

            
            if (oldState.channelId && !newState.channelId) {
                const key = `${guild.id}-${oldState.member.id}`;
                const interval = client.voiceXpIntervals.get(key);
                if (interval) {
                    clearInterval(interval);
                    client.voiceXpIntervals.delete(key);
                }
            }
        }

        
        
        
        if (settings.loggingEnabled && settings.voiceLogChannel) {
            const logChannel = guild.channels.cache.get(settings.voiceLogChannel);
            if (!logChannel) return;

            const member = newState.member || oldState.member;
            if (!member) return;

            let embed;

            
            if (!oldState.channelId && newState.channelId) {
                embed = createEmbed({
                    color: 0x2ECC71,
                    title: '🔊 Sese Katıldı',
                    description: `${member.user.tag} → <#${newState.channelId}>`,
                });
            }
            
            else if (oldState.channelId && !newState.channelId) {
                embed = createEmbed({
                    color: 0xE74C3C,
                    title: '🔇 Sesten Ayrıldı',
                    description: `${member.user.tag} ← <#${oldState.channelId}>`,
                });
            }
            
            else if (oldState.channelId !== newState.channelId) {
                embed = createEmbed({
                    color: 0xF39C12,
                    title: '🔄 Kanal Değiştirdi',
                    description: `${member.user.tag}: <#${oldState.channelId}> → <#${newState.channelId}>`,
                });
            }

            if (embed) {
                await logChannel.send({ flags: FLAGS_V2, components: [embedToV2(embed)] }).catch(() => { });
            }
        }
    },
};
