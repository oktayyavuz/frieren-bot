const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

const RESPONSES = [
    
    { text: 'Kesinlikle evet!',                 type: 'positive' },
    { text: 'Buna tamamen inanıyorum.',          type: 'positive' },
    { text: 'Öyle görünüyor.',                   type: 'positive' },
    { text: 'Evet, şüphen olmasın.',             type: 'positive' },
    { text: 'Tüm işaretler evet diyor.',         type: 'positive' },
    { text: 'Görünüşe göre öyle.',               type: 'positive' },
    
    { text: 'Şu an söylemek zor.',               type: 'neutral' },
    { text: 'Biraz belirsiz, tekrar sor.',        type: 'neutral' },
    { text: 'Şimdi sormak doğru değil.',         type: 'neutral' },
    { text: 'Daha sonra tekrar sor.',             type: 'neutral' },
    { text: 'Buna güvenemem.',                   type: 'neutral' },
    
    { text: 'Sanmıyorum.',                        type: 'negative' },
    { text: 'Hayır.',                             type: 'negative' },
    { text: 'Kesinlikle hayır.',                  type: 'negative' },
    { text: 'İşaretler hayır diyor.',             type: 'negative' },
    { text: 'Görünüşe göre hayır.',               type: 'negative' },
];

const TYPE_COLORS = {
    positive: config.colors.success,
    neutral:  config.colors.warning,
    negative: config.colors.error,
};

const TYPE_EMOJIS = {
    positive: '✅',
    neutral:  '🤔',
    negative: '❌',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .setDescriptionLocalizations({ tr: 'Sihirli topa bir soru sor' })
        .addStringOption(opt => opt
            .setName('question')
            .setNameLocalizations({ tr: 'soru' })
            .setDescription('Your question')
            .setDescriptionLocalizations({ tr: 'Sorunuz' })
            .setRequired(true)
            .setMaxLength(256)),
    cooldown: 3,
    async run(client, interaction) {
        const question = interaction.options.getString('question');
        const pick = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

        const content = [
            `## 🎱 Sihirli Top`,
            `**❓ ${question}**`,
            '',
            `${TYPE_EMOJIS[pick.type]} *${pick.text}*`,
            '',
            `-# 👤 ${interaction.user.toString()}`,
        ].join('\n');

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: TYPE_COLORS[pick.type],
                components: [{ type: 10, content }],
            }],
        });
    },
};
