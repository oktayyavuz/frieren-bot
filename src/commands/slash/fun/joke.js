const { SlashCommandBuilder } = require('discord.js');
const { FLAGS_V2 } = require('../../../utils/embed');
const config = require('../../../../config');

const JOKES = [
    { setup: 'Programcı neden güneş gözlüğü takar?', punchline: 'Çünkü çok fazla Java (kahve) içer! ☕' },
    { setup: 'Matematik kitabı neden üzgündü?', punchline: 'Çünkü çok fazla sorunu vardı.' },
    { setup: 'Neden bilgisayarlar asla şarkı söylemez?', punchline: 'Çünkü her zaman Windows (pencere) açık kalır.' },
    { setup: 'Bir programcı eşine ne söyledi?', punchline: '"Seni if içinde forever döndürsem de severim."' },
    { setup: 'Tarihçi neden geç kalır?', punchline: 'Çünkü her şeyi geçmişte bırakır.' },
    { setup: 'Balık neden bilgisayar kullanır?', punchline: 'Internet\'e (İnter-net) dalıp gitmek için!' },
    { setup: 'Neden bazı kodlar hem çalışır hem çalışmaz?', punchline: 'Çünkü Schrödinger\'in debug\'ı var.' },
    { setup: 'Yazılımcı kediye ne der?', punchline: '"Git push et, kedim, dün commit etmemişsin."' },
    { setup: 'Bir null değeri bara girdi.', punchline: 'Barmen dedi ki: "Size hizmet veremiyorum."' },
    { setup: 'Neden JavaScript geliştiricisi depresyona girmez?', punchline: 'Çünkü her şeyi undefined bırakır.' },
    { setup: 'Sonsuz döngü ile yorgunluk arasındaki fark nedir?', punchline: 'Yorgunluk eninde sonunda biter.' },
    { setup: 'Discord botları ne yer?', punchline: 'Cache (kaşe) tabletleri!' },
    { setup: 'Neden veritabanı yalnız yaşar?', punchline: 'Çünkü kimse onunla ilişki kuramıyor.' },
    { setup: 'Yazılımcı ne zaman mutlu olur?', punchline: 'Uyku sırasında. Çünkü o zaman hata yoktur.' },
    { setup: 'Neden Python\'cular sakin insanlardır?', punchline: 'Çünkü her şeyin girintisine dikkat ederler.' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setNameLocalizations({ tr: 'şaka' })
        .setDescription('Tell a random joke')
        .setDescriptionLocalizations({ tr: 'Rastgele bir şaka söyle' }),
    cooldown: 5,
    async run(client, interaction) {
        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];

        const content = [
            `## 😄 Şaka`,
            '',
            `❓ *${joke.setup}*`,
            '',
            `💬 **${joke.punchline}**`,
            '',
            `-# 👤 ${interaction.user.toString()}`,
        ].join('\n');

        await interaction.reply({
            flags: FLAGS_V2,
            components: [{
                type: 17,
                accent_color: config.colors.primary,
                components: [{ type: 10, content }],
            }],
        });
    },
};
