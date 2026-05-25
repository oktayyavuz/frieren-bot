const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed, createEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats-channels')
        .setNameLocalizations({ tr: 'istatistik' })
        .setDescription('Manage stats channels')
        .setDescriptionLocalizations({ tr: 'İstatistik kanallarını yönet' })
        .addSubcommand(sub => sub.setName('setup').setNameLocalizations({ tr: 'kur' }).setDescription('Create stats channels')
            .setDescriptionLocalizations({ tr: 'İstatistik kanalları oluştur' }))
        .addSubcommand(sub => sub.setName('remove').setNameLocalizations({ tr: 'kaldır' }).setDescription('Remove stats channels'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 30,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'setup') {
            await interaction.deferReply({ ephemeral: true });

            
            const category = await interaction.guild.channels.create({
                name: `📊 ${interaction.guild.name} İstatistikleri`,
                type: ChannelType.GuildCategory,
            });

            const types = [
                { type: 'total_members', name: `👥 Toplam Üye: ${interaction.guild.memberCount}` },
                { type: 'bot_count', name: `🤖 Bot: ${interaction.guild.members.cache.filter(m => m.user.bot).size}` },
                { type: 'channel_count', name: `📁 Kanal: ${interaction.guild.channels.cache.size}` },
                { type: 'online_count', name: `🟢 Çevrimiçi: ${interaction.guild.members.cache.filter(m => m.presence?.status !== 'offline').size}` },
            ];

            for (const stat of types) {
                const channel = await interaction.guild.channels.create({
                    name: stat.name,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: ['Connect'] },
                    ],
                });

                await prisma.statsChannel.create({
                    data: { guildId: interaction.guildId, channelId: channel.id, type: stat.type },
                });
            }

            
            await prisma.guildSettings.update({
                where: { id: interaction.guildId },
                data: { statsEnabled: true, statsCategoryId: category.id },
            });

            await interaction.editReply({ embeds: [successEmbed('✅ İstatistik kanalları oluşturuldu! Her 5 dakikada bir otomatik güncellenir.')] });
        }

        else if (sub === 'remove') {
            await interaction.deferReply({ ephemeral: true });

            const statsChannels = await prisma.statsChannel.findMany({ where: { guildId: interaction.guildId } });
            const settings = await prisma.guildSettings.findUnique({ where: { id: interaction.guildId } });

            
            for (const stat of statsChannels) {
                const channel = interaction.guild.channels.cache.get(stat.channelId);
                if (channel) await channel.delete().catch(() => { });
            }

            
            if (settings?.statsCategoryId) {
                const cat = interaction.guild.channels.cache.get(settings.statsCategoryId);
                if (cat) await cat.delete().catch(() => { });
            }

            
            await prisma.statsChannel.deleteMany({ where: { guildId: interaction.guildId } });
            await prisma.guildSettings.update({
                where: { id: interaction.guildId },
                data: { statsEnabled: false, statsCategoryId: null },
            });

            await interaction.editReply({ embeds: [successEmbed('✅ İstatistik kanalları kaldırıldı!')] });
        }
    },
};
