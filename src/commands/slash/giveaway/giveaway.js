const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed, successEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const prisma = require('../../../database');
const { scheduleGiveaway } = require('../../../systems/giveaway');
const ms = require('ms');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setNameLocalizations({ tr: 'çekiliş' })
        .setDescription('Giveaway management')
        .setDescriptionLocalizations({ tr: 'Çekiliş yönetimi' })
        .addSubcommand(sub => sub.setName('start').setNameLocalizations({ tr: 'başlat' }).setDescription('Start a giveaway')
            .addStringOption(opt => opt.setName('prize').setNameLocalizations({ tr: 'ödül' }).setDescription('Prize').setRequired(true))
            .addStringOption(opt => opt.setName('duration').setNameLocalizations({ tr: 'süre' }).setDescription('Duration (e.g. 1h, 1d)').setRequired(true))
            .addIntegerOption(opt => opt.setName('winners').setNameLocalizations({ tr: 'kazanan' }).setDescription('Number of winners').setMinValue(1).setMaxValue(20)))
        .addSubcommand(sub => sub.setName('end').setNameLocalizations({ tr: 'bitir' }).setDescription('End a giveaway')
            .addStringOption(opt => opt.setName('message-id').setDescription('Giveaway message ID').setRequired(true)))
        .addSubcommand(sub => sub.setName('reroll').setDescription('Reroll a giveaway')
            .addStringOption(opt => opt.setName('message-id').setDescription('Giveaway message ID').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    cooldown: 10,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'start') {
            const prize = interaction.options.getString('prize');
            const durationStr = interaction.options.getString('duration');
            const winners = interaction.options.getInteger('winners') || 1;
            const duration = ms(durationStr);

            if (!duration || duration < 10000) return interaction.reply({ content: '❌ Süre en az 10 saniye olmalı!', ephemeral: true });

            const endTime = new Date(Date.now() + duration);

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('giveaway_placeholder').setLabel('🎉 Katıl (0)').setStyle(ButtonStyle.Primary),
            );

            const embed = createEmbed({
                title: '🎉 Çekiliş!',
                description: `**Ödül:** ${prize}\n\n**Bitiş:** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n**Katılımcı:** 0\n**Kazanan Sayısı:** ${winners}`,
                category: 'giveaway',
                footer: { text: `Düzenleyen: ${interaction.user.tag}` },
            });

            const msg = await interaction.channel.send({ flags: FLAGS_V2, components: [embedToV2(embed), button] });

            const giveaway = await prisma.giveaway.create({
                data: { guildId: interaction.guildId, channelId: interaction.channel.id, messageId: msg.id, hostId: interaction.user.id, prize, winners, endTime },
            });

            
            const updatedButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`giveaway_${giveaway.id}`).setLabel('🎉 Katıl (0)').setStyle(ButtonStyle.Primary),
            );
            await msg.edit({ components: [updatedButton] });

            
            scheduleGiveaway(client, giveaway);

            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.giveaway.started'), null, 'giveaway')], ephemeral: true });
            logger.info(`Giveaway: ${interaction.user.tag} started a giveaway for ${prize} in ${interaction.guild.name}`, 'ADMIN');
        }

        else if (sub === 'end') {
            const messageId = interaction.options.getString('message-id');
            const { endGiveaway } = require('../../../systems/giveaway');
            const giveaway = await prisma.giveaway.findUnique({ where: { messageId } });
            if (!giveaway) return interaction.reply({ content: '❌ Çekiliş bulunamadı!', ephemeral: true });

            await endGiveaway(client, giveaway.id);
            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.giveaway.ended'))], ephemeral: true });
        }

        else if (sub === 'reroll') {
            const messageId = interaction.options.getString('message-id');
            const giveaway = await prisma.giveaway.findUnique({ where: { messageId } });
            if (!giveaway || !giveaway.ended) return interaction.reply({ content: '❌ Çekiliş bulunamadı veya henüz bitmemiş!', ephemeral: true });

            const participants = JSON.parse(giveaway.participants || '[]');
            const oldWinners = JSON.parse(giveaway.winnerIds || '[]');
            const eligible = participants.filter(id => !oldWinners.includes(id));

            if (eligible.length === 0) return interaction.reply({ content: '❌ Yeniden çekilecek uygun katılımcı yok!', ephemeral: true });

            const newWinner = eligible[Math.floor(Math.random() * eligible.length)];
            const channel = interaction.guild.channels.cache.get(giveaway.channelId);
            if (channel) await channel.send({ content: client.t(lang, 'commands.giveaway.rerolled', { winner: `<@${newWinner}>` }) });
            await interaction.reply({ embeds: [successEmbed(`Yeni kazanan: <@${newWinner}>`)], ephemeral: true });
        }
    },
};
