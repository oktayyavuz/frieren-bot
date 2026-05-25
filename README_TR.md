# Frieren: Beyond Journey's End — Discord Bot 🧙‍♂️✨

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🇬🇧_English-click-gray?style=flat-square" alt="English"></a>
  <a href="README_TR.md"><img src="https://img.shields.io/badge/🇹🇷_Türkçe-active-5865F2?style=flat-square" alt="Türkçe"></a>
</p>

[![Frieren Banner](https://media.giphy.com/media/jERqJkomk4uWdYsNk6/giphy.gif)](https://discord.com/api/oauth2/authorize?client_id=1226773465499959307&permissions=8&scope=bot%20applications.commands)

<p align="center">
  <a href="https://discord.com/api/oauth2/authorize?client_id=1226773465499959307&permissions=8&scope=bot%20applications.commands">
    <img src="https://img.shields.io/badge/Botu_Davet_Et-7289DA?style=for-the-badge&logo=discord&logoColor=white" alt="Davet">
  </a>
  <a href="https://discord.gg/dvCKjxHn35">
    <img src="https://img.shields.io/badge/Destek_Sunucusu-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Destek">
  </a>
  <a href="https://frieren.oktaydev.com">
    <img src="https://img.shields.io/badge/Dashboard-FF6B9D?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Dashboard">
  </a>
</p>

> *"Yolculuğun ötesindeki hikayeler" Discord botu — büyüler, zengin ekonomi, müzik ve çok daha fazlası.*

---

## 🌟 Öne Çıkan Özellikler

| Alan | Özellikler |
|------|-----------|
| 🛡️ **Moderasyon** | Ban, kick, timeout, uyarı, otomod, anti-raid, snipe, purge, geçici ban |
| 💰 **Ekonomi** | Bakiye, çalış, suç, soygun, balık tut, kumar, market, liderlik tablosu |
| 🎵 **Müzik** | YouTube çal, kuyruk, shuffle, loop, ses ayarı, şimdi çalıyor |
| 😄 **Eğlence** | 8-ball, şaka, büyü sistemi (35 büyü, düello), anket, doğum günü |
| 🎮 **Oyunlar** | Blackjack, slot, yazı-tura, sayı tahmin, kelime zinciri, sayı sayma |
| 🎉 **Çekiliş** | Butonlu çekiliş, erken bitirme, yeniden çekilme, dashboard yönetimi |
| ✨ **Seviye** | XP sistemi, level-up bildirimi, seviye ödülleri, sıralama kartı |
| 🎫 **Destek** | Ticket sistemi, transkript, kapatma butonları |
| ⚙️ **Yönetim** | Otorol, buton/seçim/renk rol, istatistik kanalları, hoşgeldin, kurulum |
| 🔧 **Araçlar** | Embed mesaj, hatırlatıcı, AFK, ping, sunucu/kullanıcı bilgisi, doğum günü |

### ✨ Benzersiz Sistemler
- **Büyü Sistemi** — 35 büyü, 6 nadirlik seviyesi (Common → Mythic), study/library/cast/duel alt komutları
- **Yıldız Panosu (Starboard)** — Yeterli ⭐ alan mesajlar otomatik sergi kanalına pinlenir
- **Doğum Günü Sistemi** — Üyeler doğum günü kaydeder, her sabah 09:00'da otomatik kutlama
- **Balık Tutma** — 13 farklı balık türü, olta bonusu, 5 dakika cooldown
- **Component V2** — Tüm yanıtlar modern Discord UI formatında

---

## 📊 Tüm Komutlar

### 💰 Ekonomi (15 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/bakiye` | `/balance` | Cüzdan ve banka bakiyeni gösterir |
| `/günlük` | `/daily` | Günlük ücretsiz ödülünü alırsın |
| `/haftalık` | `/weekly` | Haftalık büyük ödülünü alırsın |
| `/saatlik` | `/hourly` | Her saat başı küçük ödül |
| `/çalış` | `/work` | Rastgele bir işte çalışarak para kazanırsın |
| `/suç` | `/crime` | Suç işleyerek yüksek ama riskli ödül kazanırsın |
| `/soygun` | `/rob` | Başka bir kullanıcının cüzdanından para çalarsın |
| `/transfer` | `/transfer` | Başka bir kullanıcıya para gönderirsin |
| `/yatır` | `/deposit` | Cüzdanından bankaya para yatırırsın |
| `/çek` | `/withdraw` | Bankandan cüzdanına para çekersin |
| `/market` | `/shop` | Sunucuya özel marketten ürün satın alırsın |
| `/envanter` | `/inventory` | Sahip olduğun eşyaları listeler |
| `/sıralama` | `/leaderboard` | En zengin ve en yüksek seviyeli üyeler |
| `/balık-tut` | `/fish` | Balık tut ve Okane kazan! (5dk cooldown) |
| `/kumar` | `/gamble` | Slot makinesiyle şansını dene |

> **Balık Tut:** 13 tür — Çöp → Mythic. Envanterinde olta varsa nadir balık şansın artar.  
> **Kumar:** 6 sembol, ağırlıklı çekiliş, çarpan sistemi (2×–20×).

---

### 🛡️ Moderasyon (13 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/yasakla` | `/ban` | Kalıcı ban. Ceza öncesi kullanıcıya DM gönderir |
| `/at` | `/kick` | Kullanıcıyı sunucudan atar. DM bildirimi gönderir |
| `/sustur` | `/timeout` | Belirli süre susturur. DM bildirimi gönderir |
| `/uyar` | `/warn` | Resmi uyarı verir ve kaydeder. DM gönderir |
| `/uyarılar` | `/warnings` | Kullanıcının uyarılarını gösterir veya temizler |
| `/geçici-ban` | `/tempban` | Süreli ban, otomatik açılır (`10m`, `2h`, `1d`) |
| `/sil` | `/purge` | Toplu mesaj siler (max 100) |
| `/nuke` | `/nuke` | Kanalı silip aynı ayarlarla yeniden oluşturur |
| `/snipe` | `/snipe` | Kanaldaki en son silinen mesajı gösterir |
| `/otomod` | `/automod` | Küfür, spam, link, büyük harf filtrelerini yönetir |
| `/kilitle` | `/lock` | Kanalı herkese kapatır veya açar |
| `/yavaşmod` | `/slowmode` | Kanal mesaj gönderim hızını ayarlar |
| `/yasakkaldır` | `/unban` | Yasaklı kullanıcının engelini kaldırır |

> **Geçici Ban:** `30s` · `10m` · `2h` · `1d` · `7d` formatlarını destekler.

---

### 🎵 Müzik (10 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/çal` | `/play` | YouTube'dan şarkı çalar (arama veya URL) |
| `/atla` | `/skip` | Çalan şarkıyı atlar |
| `/durdur` | `/stop` | Müziği durdurur ve kuyruğu temizler |
| `/duraklat` | `/pause` | Şarkıyı duraklatır |
| `/devam` | `/resume` | Duraklatılmış şarkıyı devam ettirir |
| `/ses` | `/volume` | Ses seviyesini ayarlar (1–100) |
| `/şimdi` | `/nowplaying` | Şu an çalan şarkıyı gösterir |
| `/kuyruk` | `/queue` | Müzik kuyruğunu sayfalı gösterir |
| `/döngü` | `/loop` | Mevcut şarkı için döngü modunu açar/kapatır |
| `/karıştır` | `/shuffle` | Kuyruğu Fisher-Yates algoritmasıyla karıştırır |

> **YouTube Bypass:** `player_client=ios,web` — cookie gerektirmez.  
> **Otomatik Retry:** Hata alınan şarkı 1 kez otomatik yeniden denenir.

---

### 😄 Eğlence (3 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/soru` | `/8ball` | Sihirli 8-top — sorunuza gizemli cevaplar |
| `/şaka` | `/joke` | Rastgele bir yazılım / teknoloji şakası |
| `/büyü` | `/magic` | Büyü sistemi — aşağıdaki alt komutlara bakın |

#### Büyü Alt Komutları (`/büyü`)

| Alt Komut | İngilizce | Açıklama |
|-----------|-----------|---------|
| `çalış` | `study` | Rastgele büyü öğrenir. Yeniyse koleksiyona eklenir; bilinenlerden 50 XP kazanılır (1sa cooldown) |
| `kütüphane` | `library` | Koleksiyonunu nadirliğe göre sıralı gösterir. Başkasının koleksiyonuna bakabilirsin |
| `kullan` | `cast` | Büyü kullanarak XP veya Okane bonusu kazanırsın |
| `düello` | `duel` | Başka kullanıcıya büyü düellosu meydan okursun (Okane bahis, 60sn süre) |

**35 büyü · 6 nadirlik:** Common (⬜) · Uncommon (🟩) · Rare (🟦) · Epic (🟪) · Legendary (🟨) · Mythic (🟥)

---

### 🎮 Oyunlar (6 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/blackjack` | `/blackjack` | 21 oyna — kart çek, dur, ikiye katla |
| `/yazıtura` | `/coinflip` | Yazı-tura bahsi |
| `/slot` | `/slot` | Slot makinesini döndür |
| `/tahmin` | `/guess` | Botun tuttuğu 1–100 sayısını 10 denemede bul |
| `/sayısayma-kur` | `/counting-setup` | Kanala sayı sayma oyunu kurar |
| `/kelimezinciri-kur` | `/wordchain-setup` | Kanala kelime zinciri oyunu kurar |

---

### 🎉 Çekiliş (1 komut, çok alt komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/çekiliş` | `/giveaway` | Çekiliş yönetimi — başlat, bitir, yeniden çek, listele |

> Dashboard üzerinden aktif çekilişleri yönetebilir, erken bitirebilir ve kazananı yeniden çekebilirsin.

---

### ✨ Seviye (1 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/seviye` | `/rank` | XP, seviye ve sunucu sıralamasını gösteren kart |

> Seviye ödülleri `/seviye-ödülleri` komutuyla yöneticiler tarafından ayarlanır.

---

### 🎫 Destek (1 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/ticket-kur` | `/ticket-setup` | Destek (ticket) sistemini kurar |

> Ticket'lar otomatik kanal oluşturur, transkript kaydeder ve kapatma butonları içerir.

---

### 🔧 Araçlar (13 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/yardım` | `/help` | Tüm komutları kategorili menüyle gösterir |
| `/ping` | `/ping` | Bot ve Discord API gecikmesini ölçer (🟢/🟡/🔴) |
| `/bot-bilgi` | `/botinfo` | Uptime, sunucu sayısı, bellek ve teknik detaylar |
| `/sunucu-bilgi` | `/serverinfo` | Üye sayısı, kanallar, roller, boost seviyesi |
| `/kullanıcı-bilgi` | `/userinfo` | Hesap bilgisi, roller, rozetler, banner |
| `/avatar` | `/avatar` | Kullanıcının profil fotoğrafını büyük boyutta gösterir |
| `/afk` | `/afk` | AFK moduna geçersin — etiketleyenlere bildirim gider |
| `/hatırlatıcı` | `/reminder` | Belirli bir süre sonra seni hatırlatır |
| `/embed-mesaj` | `/embed-mesaj` | Özel embed mesaj oluşturur |
| `/embed-rol` | `/embed-rol` | Reaksiyon rollü embed mesaj oluşturur |
| `/r` | `/r` | Mevcut mesaja hızlıca reaksiyon rol ekler |
| `/anket` | `/poll` | 2–5 seçenekli süreli anket, süre dolunca otomatik sonuç |
| `/doğumgünü` | `/birthday` | Doğum günü sistemi — aşağıdaki alt komutlara bakın |

#### Doğum Günü Alt Komutları (`/doğumgünü`)

| Alt Komut | İngilizce | Açıklama |
|-----------|-----------|---------|
| `ayarla` | `set` | Doğum gününü kaydet (gün + ay) |
| `kaldır` | `remove` | Kayıtlı doğum gününü sil |
| `liste` | `list` | Sunucudaki yaklaşan doğum günleri |
| `kontrol` | `check` | Bir kullanıcının doğum gününü gör |
| `kur` | `setup` | Doğum günü kanalını ve rolünü ayarla (Yönetici) |

> Her sabah **09:00**'da otomatik kutlama mesajı ve 24 saatlik doğum günü rolü verilir.

---

### ⚙️ Yönetim (9 komut)

| Komut | İngilizce | Açıklama |
|-------|-----------|---------|
| `/ayarlar` | `/settings` | Bot sistemlerini sunucuya özel açıp kapatır |
| `/kurulum` | `/setup` | Tek tıkla sunucu kanal ve rol kurulum sihirbazı |
| `/hoşgeldin` | `/welcome` | Hoşgeldin/güle güle mesajlarını yapılandırır |
| `/otorol` | `/autorole` | Sunucuya katılınca otomatik verilen rolleri yönetir |
| `/butonrol` | `/buttonrole` | Buton tıklayarak rol verme sistemi kurar |
| `/seçimrol` | `/selectrole` | Açılır menüyle rol verme sistemi kurar |
| `/renk` | `/colorrole` | Renk rolü sistemi |
| `/istatistik` | `/stats-channels` | Canlı üye/kanal sayısı gösteren istatistik kanalları |
| `/seviye-ödülleri` | `/level-rewards` | Belirli seviyelere rol ödülleri atar |

---

## 🚀 Kurulum

### Gereksinimler
- **Node.js** v18 veya üzeri
- **FFmpeg** (müzik için)
- **Python 3 + make + g++** (sodium-native derleme için)

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/oktayyavuz/frieren-bot.git
cd frieren-bot

# 2. Bağımlılıkları yükle
npm install

# 3. .env dosyasını yapılandır
cp .env.example .env
```

`.env` dosyası:
```env
DISCORD_TOKEN=BotTokenin
CLIENT_ID=BotClientIDsi
GUILD_ID=TestSunucusuID        # Sadece test deploy için
DATABASE_URL="file:./dev.db"
BOT_API_KEY=GüçlüBirApiAnahtarı
```

```bash
# 4. Veritabanını hazırla
npx prisma db push
npx prisma generate

# 5. Slash komutlarını Discord'a kaydet
node src/deploy-commands.js

# 6. Botu başlat
npm run start
```

### Dashboard Kurulumu (Next.js)

```bash
cd dashboard
cp .env.example .env.local
# DATABASE_URL="file:../dev.db"  ← Bot DB ile ortak (üst klasörde)
# NEXTAUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET gerekli

npx prisma db push
npm run build
npm run start   # Port 9931
```

---

## 🖥️ VDS Deploy (PM2)

```bash
cd frieren && npm install
cd dashboard && npx prisma db push && npm run build && cd ..
pm2 restart all
```

**PM2 Yapısı:**
- `frieren-bot` — Cluster modu, port yok
- `frieren-dashboard` — Fork modu, port 9931

> **Not:** FFmpeg kurulu değilse: `apt install ffmpeg`  
> **Not:** sodium-native için: `apt install python3 make g++`

---

## 📁 Proje Yapısı

```
frieren/
├── src/
│   ├── commands/
│   │   ├── slash/
│   │   │   ├── admin/          ⚙️  Yönetim komutları
│   │   │   ├── economy/        💰  Ekonomi komutları
│   │   │   ├── fun/            😄  Eğlence komutları
│   │   │   ├── games/          🎮  Oyun komutları
│   │   │   ├── giveaway/       🎉  Çekiliş komutları
│   │   │   ├── level/          ✨  Seviye komutları
│   │   │   ├── moderation/     🛡️  Moderasyon komutları
│   │   │   ├── music/          🎵  Müzik komutları
│   │   │   ├── ticket/         🎫  Destek komutları
│   │   │   └── utility/        🔧  Araç komutları
│   │   └── prefix/owner/       🔑  Sahip araçları (eval, reload)
│   ├── events/                 📡  Discord event handler'ları
│   ├── systems/                ⚙️  Arka plan sistemleri
│   │   ├── music/MusicQueue.js 🎵  Müzik kuyruk yöneticisi
│   │   ├── birthdayChecker.js  🎂  Günlük doğum günü kontrolü
│   │   ├── leveling.js         ✨  XP sistemi
│   │   ├── syncService.js      🔄  Dashboard senkronizasyon
│   │   └── recovery.js         🔁  Başlangıç kurtarma
│   ├── utils/                  🔨  Yardımcı fonksiyonlar
│   ├── api/server.js           🌐  Bot iç HTTP API (port 4917)
│   └── index.js                🚀  Giriş noktası
├── dashboard/                  📊  Next.js dashboard
├── prisma/schema.prisma        🗃️  Bot veritabanı şeması
└── config.js                   ⚙️  Bot yapılandırması
```

---

## 🛠️ Teknolojiler

| Alan | Teknoloji |
|------|-----------|
| Dil | JavaScript (Node.js) |
| Discord | discord.js v14 |
| Veritabanı | Prisma ORM + SQLite |
| Dashboard | Next.js 14 App Router |
| Auth | NextAuth v5 |
| Müzik | @discordjs/voice + yt-dlp-exec |
| Loglama | Winston + Chalk |
| Süreç Yöneticisi | PM2 (cluster) |

---

## 👤 Geliştirici

- **Yapımcı:** [oktayyavuz](https://github.com/oktayyavuz)
- **Website:** [frieren.oktaydev.com](https://frieren.oktaydev.com)
- **Destek:** [Discord Sunucusu](https://discord.gg/dvCKjxHn35)

---

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır.

> [!NOTE]
> Bot, gerçek zamanlı dashboard senkronizasyon sistemiyle birlikte gelir — web panelinden yapılan ayar değişiklikleri bota anında yansır. Bot iç API'si (port 4917) kanal/rol bilgilerini dashboard'a canlı olarak sağlar.
