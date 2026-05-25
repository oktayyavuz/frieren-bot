const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, embedToV2, FLAGS_V2 } = require('../../../utils/embed');
const logger = require('../../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Recreate the channel')
        .setDescriptionLocalizations({ tr: 'Kanalı sıfırdan oluştur' })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    cooldown: 30,
    async run(client, interaction, lang) {
        const channel = interaction.channel;
        const position = channel.position;
        const parent = channel.parent;

        const newChannel = await channel.clone({ reason: `Nuke by ${interaction.user.tag}` });
        await newChannel.setPosition(position);
        await channel.delete();
        logger.info(`Nuke: ${interaction.user.tag} nuked ${channel.name} in ${interaction.guild.name}`, 'MOD');
        await newChannel.send({ flags: FLAGS_V2, components: [embedToV2(successEmbed(client.t(lang, 'commands.nuke.success')))] });
    },
};
