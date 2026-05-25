/**
 * Frieren botu için büyü listesi
 * Nadirlik: Common < Uncommon < Rare < Epic < Legendary < Mythic
 */
const spells = [
    
    {
        id: 'grapes_sour',
        name: 'Mavi Üzümleri Ekşiye Dönüştüren Büyü',
        description: 'Mavi üzümlerin tadını ekşiye çevirerek Fern\'i sinirlendirmenize yarar.',
        rarity: 'Common', emoji: '🍇', power: 5,
    },
    {
        id: 'clean_statue',
        name: 'Bronz Heykel Temizleme Büyüsü',
        description: 'Tarihi bronz heykelleri pırıl pırıl yapar. Himmel buna bayılırdı.',
        rarity: 'Common', emoji: '🗿', power: 5,
    },
    {
        id: 'warm_tea',
        name: 'Çayı Daima Sıcak Tutan Büyü',
        description: 'Uzun yolculuklarda içeceğiniz asla soğumaz.',
        rarity: 'Common', emoji: '☕', power: 5,
    },
    {
        id: 'laundry_smell',
        name: 'Kıyafetlerin Yeni Yıkanmış Gibi Kokmasını Sağlayan Büyü',
        description: 'En kirli yolculuklarda bile mis gibi kokarsınız.',
        rarity: 'Common', emoji: '👘', power: 5,
    },
    {
        id: 'light_orb',
        name: 'Işık Küresi',
        description: 'Avucunuzda küçük bir ışık küresi oluşturur. Mağaralarda çok işe yarar.',
        rarity: 'Common', emoji: '💡', power: 5,
    },
    {
        id: 'repair_cloth',
        name: 'Kumaş Onarım Büyüsü',
        description: 'Yırtık ve hasarlı kumaşları onarır. Elf dikiş makinesi gibidir.',
        rarity: 'Common', emoji: '🧵', power: 5,
    },
    {
        id: 'fire_starter',
        name: 'Ateş Yakma Büyüsü',
        description: 'Parmak ucuyla çakmak görevi görür. Çamurlu ormanlarda hayat kurtarır.',
        rarity: 'Common', emoji: '🔥', power: 6,
    },
    {
        id: 'water_purify',
        name: 'Su Arıtma Büyüsü',
        description: 'Kirli suyu içilebilir hale getirir. Uzun yolculukların olmazmazı.',
        rarity: 'Common', emoji: '💧', power: 6,
    },
    {
        id: 'minor_heal',
        name: 'Küçük İyileştirme Büyüsü',
        description: 'Küçük kesik ve yaraları kapatır. Pratik ama çok güçlü değil.',
        rarity: 'Common', emoji: '🩹', power: 7,
    },

    
    {
        id: 'detect_mimic',
        name: 'Mimic Tespit Etme Büyüsü',
        description: '%99 ihtimalle sandığın mimic olduğunu söyler, ama Frieren yine de içine bakacaktır.',
        rarity: 'Uncommon', emoji: '📦', power: 15,
    },
    {
        id: 'wind_blade',
        name: 'Rüzgar Bıçağı',
        description: 'Havayı keskin bir bıçak gibi şekillendiren saldırı büyüsü.',
        rarity: 'Uncommon', emoji: '🌬️', power: 18,
    },
    {
        id: 'earth_wall',
        name: 'Toprak Duvarı',
        description: 'Yerden kısa bir duvar çıkararak saldırıları engeller.',
        rarity: 'Uncommon', emoji: '🪨', power: 20,
    },
    {
        id: 'illusion_copy',
        name: 'Yanılsama Kopyası',
        description: 'Kısa süreli bir görsel yanılsama oluşturarak düşmanı şaşırtır.',
        rarity: 'Uncommon', emoji: '🪞', power: 22,
    },
    {
        id: 'silence_field',
        name: 'Sessizlik Alanı',
        description: 'Küçük bir alanda sesi tamamen keser. Bazı büyüleri geçersiz kılar.',
        rarity: 'Uncommon', emoji: '🔇', power: 20,
    },
    {
        id: 'paralyze',
        name: 'Felç Büyüsü',
        description: 'Hedefi kısa süreliğine hareket edemez hale getirir.',
        rarity: 'Uncommon', emoji: '⚡', power: 25,
    },

    
    {
        id: 'see_through_clothes',
        name: 'Kıyafetlerin Arkasını Gösteren Büyü',
        description: 'Sadece yaşlı adamların ilgisini çeken, etik olarak tartışmalı bir büyü.',
        rarity: 'Rare', emoji: '👁️', power: 35,
    },
    {
        id: 'mana_shield',
        name: 'Mana Kalkanı',
        description: 'Saldırıları hafifçe sönümleyen koruyucu enerji kalkanı oluşturur.',
        rarity: 'Rare', emoji: '🛡️', power: 40,
    },
    {
        id: 'ice_lance',
        name: 'Buz Mızrağı',
        description: 'Hedefe fırlatılan keskin buz kristali. Yaralamak için değil dondurmak için.',
        rarity: 'Rare', emoji: '🧊', power: 38,
    },
    {
        id: 'telekinesis',
        name: 'Telepsikokinezi',
        description: 'Nesneleri uzaktan hareket ettirir. Tembeller için ideal.',
        rarity: 'Rare', emoji: '🔮', power: 42,
    },
    {
        id: 'tracking_rune',
        name: 'İz Takip Runu',
        description: 'İşaretlenen bir nesnenin veya kişinin yerini tespit eder.',
        rarity: 'Rare', emoji: '🧭', power: 35,
    },

    
    {
        id: 'zoltraak',
        name: 'Zoltraak (Sıradan Saldırı Büyüsü)',
        description: 'Artık "sıradan" olarak kabul edilen, Frieren\'in ustalaştığı güçlü bir saldırı büyüsü.',
        rarity: 'Epic', emoji: '💜', power: 65,
    },
    {
        id: 'time_slow',
        name: 'Zaman Yavaşlatma',
        description: 'Kısa bir süre için yakın alandaki zamanı yavaşlatır. Oldukça yorucu bir büyü.',
        rarity: 'Epic', emoji: '⏳', power: 70,
    },
    {
        id: 'soul_bind',
        name: 'Ruh Bağı',
        description: 'İki varlık arasında mistik bir bağ kurar. Eski bir antlaşma büyüsü.',
        rarity: 'Epic', emoji: '💠', power: 60,
    },
    {
        id: 'grand_barrier',
        name: 'Büyük Bariyer',
        description: 'Geniş bir alanı tamamen kaplayan savunma büyüsü. Koruma için kullanılır.',
        rarity: 'Epic', emoji: '🔷', power: 68,
    },
    {
        id: 'gravity_crush',
        name: 'Yerçekimi Ezme',
        description: 'Hedef üzerindeki yerçekimini onlarca kat artırır. Ağır büyü.',
        rarity: 'Epic', emoji: '⚫', power: 72,
    },

    
    {
        id: 'flower_field',
        name: 'Çiçek Bahçesi Oluşturma Büyüsü',
        description: 'Frieren\'in en sevdiği büyü. Her yeri güzel çiçeklerle donatır.',
        rarity: 'Legendary', emoji: '🌸', power: 88,
    },
    {
        id: 'frieren_copy',
        name: 'Frieren\'in Yanılsama Kopyası',
        description: 'Frieren\'in geliştirdiği, gerçekten kandıran mükemmel bir yanılsama büyüsü.',
        rarity: 'Legendary', emoji: '🌀', power: 90,
    },
    {
        id: 'demon_barrier',
        name: 'Demon Kral\'ın Bariyeri',
        description: 'Demon Kral\'dan kalan kadim koruma büyüsü. Neredeyse kırılmaz.',
        rarity: 'Legendary', emoji: '👑', power: 95,
    },
    {
        id: 'revive',
        name: 'Diriliş Büyüsü',
        description: 'Son nefesindeki birisini geri döndürmenin son çaresi. Kullanımı çok ağır maliyet ister.',
        rarity: 'Legendary', emoji: '✨', power: 92,
    },

    
    {
        id: 'heaven_pierce',
        name: 'Gökyüzünü Delen Büyü',
        description: 'Efsanelere konu olan, gökyüzünü gerçekten delebileceği söylenen büyü.',
        rarity: 'Mythic', emoji: '🌟', power: 100,
    },
    {
        id: 'end_magic',
        name: 'Son Büyü',
        description: 'Frieren\'in henüz tamamlamadığı efsanevi büyü. Belki de hiç tamamlanamayacak...',
        rarity: 'Mythic', emoji: '🔑', power: 100,
    },
];

/** Nadirlik sıralaması ve renkleri */
const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const RARITY_COLORS = {
    Common:    0x95A5A6,  
    Uncommon:  0x2ECC71,  
    Rare:      0x3498DB,  
    Epic:      0x9B59B6,  
    Legendary: 0xF39C12,  
    Mythic:    0xE74C3C,  
};
const RARITY_EMOJIS = {
    Common:    '⬜',
    Uncommon:  '🟩',
    Rare:      '🟦',
    Epic:      '🟪',
    Legendary: '🟨',
    Mythic:    '🟥',
};

/** Ağırlıklı rastgele büyü seç (nadir büyüler daha az çıkar) */
function getRandomSpell() {
    const weights = { Common: 40, Uncommon: 25, Rare: 18, Epic: 10, Legendary: 5, Mythic: 2 };
    const pool = spells.map(s => ({ spell: s, weight: weights[s.rarity] }));
    const total = pool.reduce((sum, p) => sum + p.weight, 0);
    let rnd = Math.random() * total;
    for (const { spell, weight } of pool) {
        rnd -= weight;
        if (rnd <= 0) return spell;
    }
    return spells[0];
}

module.exports = spells;
module.exports.RARITY_ORDER = RARITY_ORDER;
module.exports.RARITY_COLORS = RARITY_COLORS;
module.exports.RARITY_EMOJIS = RARITY_EMOJIS;
module.exports.getRandomSpell = getRandomSpell;
