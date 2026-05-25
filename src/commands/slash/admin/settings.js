const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed } = require('../../../utils/embed');
const prisma = require('../../../database');
const { getGuildSettings } = require('../../../utils/helpers');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setNameLocalizations({ tr: 'ayarlar' })
        .setDescription('Manage server settings')
        .setDescriptionLocalizations({ tr: 'Sunucu ayarlarını yönet' })
        .addSubcommand(sub => sub.setName('view').setDescription('View current settings'))
        .addSubcommand(sub => sub.setName('language').setNameLocalizations({ tr: 'dil' }).setDescription('Set server language')
            .addStringOption(opt => opt.setName('lang').setDescription('Language').addChoices({ name: 'Türkçe', value: 'tr' }, { name: 'English', value: 'en' }).setRequired(true)))
        .addSubcommand(sub => sub.setName('prefix').setDescription('Set command prefix')
            .addStringOption(opt => opt.setName('prefix').setDescription('New prefix').setRequired(true).setMaxLength(5)))
        .addSubcommand(sub => sub.setName('log').setDescription('Set log channel')
            .addStringOption(opt => opt.setName('type').setDescription('Log type').addChoices(
                { name: 'Mod Log', value: 'modLogChannel' },
                { name: 'Message Log', value: 'messageLogChannel' },
                { name: 'Voice Log', value: 'voiceLogChannel' },
                { name: 'Server Log', value: 'serverLogChannel' },
            ).setRequired(true))
            .addChannelOption(opt => opt.setName('channel').setDescription('Log channel')))
        .addSubcommand(sub => sub.setName('module').setDescription('Toggle module')
            .addStringOption(opt => opt.setName('name').setDescription('Module').addChoices(
                { name: 'Economy', value: 'economyEnabled' },
                { name: 'Leveling', value: 'levelingEnabled' },
                { name: 'Moderation', value: 'moderationEnabled' },
                { name: 'Tickets', value: 'ticketEnabled' },
                { name: 'Welcome', value: 'welcomeEnabled' },
                { name: 'Logging', value: 'loggingEnabled' },
            ).setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    cooldown: 5,
    async run(client, interaction, lang) {
        const sub = interaction.options.getSubcommand();
        const settings = await getGuildSettings(interaction.guildId);

        if (sub === 'view') {
            const e = v => v ? '🟢 **Açık**' : '🔴 **Kapalı**';
            const ch = id => id ? `<#${id}>` : '`Ayarlanmadı`';
            
            const desc = [
                '## ⚙️ Sunucu Yönetim Paneli',
                '',
                '### 🌐 Genel Ayarlar',
                `• **Sunucu Dili:** \`${settings.language.toUpperCase()}\``,
                `• **Komut Ön Eki (Prefix):** \`${settings.prefix}\``,
                '',
                '### 🧩 Modüller',
                `• **💰 Ekonomi:** ${e(settings.economyEnabled)}`,
                `• **✨ Seviye Sistemi:** ${e(settings.levelingEnabled)}`,
                `• **🛡️ Moderasyon:** ${e(settings.moderationEnabled)}`,
                `• **🎫 Ticket Sistemi:** ${e(settings.ticketEnabled)}`,
                `• **👋 Hoş Geldin:** ${e(settings.welcomeEnabled)}`,
                `• **📋 Loglama:** ${e(settings.loggingEnabled)}`,
                '',
                '### 📝 Log Kanalları',
                `• **Mod Log:** ${ch(settings.modLogChannel)}`,
                `• **Mesaj Log:** ${ch(settings.messageLogChannel)}`,
                `• **Ses Log:** ${ch(settings.voiceLogChannel)}`,
                `• **Sunucu Log:** ${ch(settings.serverLogChannel)}`,
                '',
                '-# Ayarları değiştirmek için `/ayarlar dil`, `/ayarlar prefix`, `/ayarlar modül` veya `/ayarlar log` komutlarını kullanabilirsiniz.'
            ].join('\n');

            const embed = createEmbed({
                title: `📊 ${interaction.guild.name} Ayarları`,
                description: desc,
                category: 'admin',
            });
            await interaction.reply({ embeds: [embed] });
        }

        else if (sub === 'language') {
            const newLang = interaction.options.getString('lang');
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { language: newLang } });
            await interaction.reply({ embeds: [successEmbed(`✅ Dil **${newLang.toUpperCase()}** olarak ayarlandı!`, null, 'admin')] });
            logger.info(`Settings: ${interaction.user.tag} changed language to ${newLang} in ${interaction.guild.name}`, 'ADMIN');
        }

        else if (sub === 'prefix') {
            const newPrefix = interaction.options.getString('prefix');
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { prefix: newPrefix } });
            await interaction.reply({ embeds: [successEmbed(`✅ Prefix \`${newPrefix}\` olarak ayarlandı!`, null, 'admin')] });
            logger.info(`Settings: ${interaction.user.tag} changed prefix to ${newPrefix} in ${interaction.guild.name}`, 'ADMIN');
        }

        else if (sub === 'log') {
            const type = interaction.options.getString('type');
            const channel = interaction.options.getChannel('channel');
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { [type]: channel?.id || null } });
            await interaction.reply({ embeds: [successEmbed(client.t(lang, 'commands.settings.updated'), null, 'admin')] });
            logger.info(`Settings: ${interaction.user.tag} updated log channel ${type} in ${interaction.guild.name}`, 'ADMIN');
        }

        else if (sub === 'module') {
            const name = interaction.options.getString('name');
            const current = settings[name];
            await prisma.guildSettings.update({ where: { id: interaction.guildId }, data: { [name]: !current } });
            const status = !current ? '✅ Etkin' : '❌ Devre Dışı';
            await interaction.reply({ embeds: [successEmbed(`${name.replace('Enabled', '')} → **${status}**`, null, 'admin')] });
            logger.info(`Settings: ${interaction.user.tag} toggled module ${name} to ${!current} in ${interaction.guild.name}`, 'ADMIN');
        }
    },
};
