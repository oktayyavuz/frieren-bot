const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { createEmbed } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setNameLocalizations({ tr: 'sunucu-bilgi' })
        .setDescription('Show server information')
        .setDescriptionLocalizations({ tr: 'Sunucu bilgisi göster' }),
    cooldown: 5,
    async run(client, interaction, lang) {
        await interaction.deferReply();
        const guild = interaction.guild;

        
        await guild.members.fetch();
        const owner = await guild.fetchOwner();

        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categoryCount = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        const verificationLevels = { 0: 'Yok', 1: 'Düşük', 2: 'Orta', 3: 'Yüksek', 4: 'En Yüksek' };

        const embed = createEmbed({
            title: `${client.t(lang, 'commands.serverinfo.title')} — ${guild.name}`,
            thumbnail: guild.iconURL({ dynamic: true, size: 256 }),
            image: guild.bannerURL({ size: 1024 }) || undefined,
            fields: [
                { name: `👑 ${client.t(lang, 'commands.serverinfo.owner')}`, value: owner.user.tag, inline: true },
                { name: '🆔 ID', value: guild.id, inline: true },
                { name: `📅 ${client.t(lang, 'commands.serverinfo.created')}`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: `👥 ${client.t(lang, 'commands.serverinfo.members')}`, value: `**${totalMembers}** (🟢 ${onlineMembers} çevrimiçi)\n👤 ${humanCount} insan • 🤖 ${botCount} bot`, inline: true },
                { name: `📁 ${client.t(lang, 'commands.serverinfo.channels')}`, value: `💬 ${textChannels} yazı • 🔊 ${voiceChannels} ses • 📂 ${categoryCount} kategori`, inline: true },
                { name: `🎭 ${client.t(lang, 'commands.serverinfo.roles')}`, value: `${guild.roles.cache.size}`, inline: true },
                { name: `💎 ${client.t(lang, 'commands.serverinfo.boosts')}`, value: `${guild.premiumSubscriptionCount || 0} boost (Tier ${guild.premiumTier})`, inline: true },
                { name: '🛡️ Doğrulama', value: verificationLevels[guild.verificationLevel] ?? 'Bilinmiyor', inline: true },
                { name: '😀 Emojiler', value: `${guild.emojis.cache.size}`, inline: true },
            ],
            category: 'utility',
        });

        await interaction.editReply({ embeds: [embed] });
        logger.info(`Serverinfo: ${interaction.user.tag} viewed server info in ${guild.name}`, 'UTILITY');
    },
};
