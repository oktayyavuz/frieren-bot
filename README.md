# Frieren: Beyond Journey's End — Discord Bot 🧙‍♂️✨

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🇬🇧_English-active-5865F2?style=flat-square" alt="English"></a>
  <a href="README_TR.md"><img src="https://img.shields.io/badge/🇹🇷_Türkçe-click-gray?style=flat-square" alt="Türkçe"></a>
</p>

[![Frieren Banner](https://media.giphy.com/media/jERqJkomk4uWdYsNk6/giphy.gif)](https://discord.com/api/oauth2/authorize?client_id=1226773465499959307&permissions=8&scope=bot%20applications.commands)

<p align="center">
  <a href="https://discord.com/api/oauth2/authorize?client_id=1226773465499959307&permissions=8&scope=bot%20applications.commands">
    <img src="https://img.shields.io/badge/Invite_Bot-7289DA?style=for-the-badge&logo=discord&logoColor=white" alt="Invite">
  </a>
  <a href="https://discord.gg/dvCKjxHn35">
    <img src="https://img.shields.io/badge/Support_Server-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Support">
  </a>
  <a href="https://frieren.oktaydev.com">
    <img src="https://img.shields.io/badge/Dashboard-FF6B9D?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Dashboard">
  </a>
</p>

> *A comprehensive Discord bot inspired by the anime "Frieren: Beyond Journey's End" — magic spells, rich economy, music and more.*

---

## 🌟 Key Features

| Area | Features |
|------|----------|
| 🛡️ **Moderation** | Ban, kick, timeout, warn, automod, anti-raid, snipe, purge, temp-ban |
| 💰 **Economy** | Balance, work, crime, rob, fishing, gambling, shop, leaderboard |
| 🎵 **Music** | YouTube play, queue, shuffle, loop, volume, now playing |
| 😄 **Fun** | 8-ball, jokes, magic system (35 spells, duels), polls, birthdays |
| 🎮 **Games** | Blackjack, slots, coinflip, number guess, word chain, counting |
| 🎉 **Giveaway** | Button-based giveaways, early end, reroll, dashboard management |
| ✨ **Leveling** | XP system, level-up notifications, level rewards, rank card |
| 🎫 **Tickets** | Ticket system, transcripts, close buttons |
| ⚙️ **Admin** | Auto-role, button/select/color roles, stats channels, welcome, setup |
| 🔧 **Utility** | Embed builder, reminder, AFK, ping, server/user info, birthday |

### ✨ Unique Systems
- **Magic System** — 35 spells across 6 rarity tiers (Common → Mythic), study/library/cast/duel subcommands
- **Starboard** — Messages with enough ⭐ reactions are automatically pinned to a showcase channel
- **Birthday System** — Members register birthdays, automatic celebrations every morning at 09:00
- **Fishing** — 13 fish types (Trash → Mythic), fishing rod bonus, 5-minute cooldown
- **Component V2** — All responses use modern Discord UI format

---

## 📊 All Commands

### 💰 Economy (15 commands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/balance` | `/bakiye` | Show wallet and bank balance |
| `/daily` | `/günlük` | Claim your daily reward |
| `/weekly` | `/haftalık` | Claim your weekly reward |
| `/hourly` | `/saatlik` | Claim your hourly reward |
| `/work` | `/çalış` | Work at a random job to earn money |
| `/crime` | `/suç` | Commit a crime — high risk, high reward |
| `/rob` | `/soygun` | Steal money from another user's wallet |
| `/transfer` | `/transfer` | Send money to another user |
| `/deposit` | `/yatır` | Deposit money from wallet to bank |
| `/withdraw` | `/çek` | Withdraw money from bank to wallet |
| `/shop` | `/market` | Browse and buy items from the server shop |
| `/inventory` | `/envanter` | View your items and collectibles |
| `/leaderboard` | `/sıralama` | Top richest and highest-level members |
| `/fish` | `/balık-tut` | Go fishing and earn Okane! (5 min cooldown) |
| `/gamble` | `/kumar` | Try your luck at the slot machine |

> **Fishing:** 13 types — Trash → Mythic. Having a fishing rod in inventory boosts rare fish chances.  
> **Gamble:** 6 symbols, weighted draw, multiplier system (2×–20×).

---

### 🛡️ Moderation (13 commands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/ban` | `/yasakla` | Permanently ban a user. Sends a DM before action |
| `/kick` | `/at` | Kick a user from the server. Sends a DM notification |
| `/timeout` | `/sustur` | Mute a user for a duration. Sends a DM notification |
| `/warn` | `/uyar` | Issue and record an official warning. Sends a DM |
| `/warnings` | `/uyarılar` | View or clear a user's warnings |
| `/tempban` | `/geçici-ban` | Temporary ban with auto-unban (`10m`, `2h`, `1d`) |
| `/purge` | `/sil` | Bulk delete messages (max 100) |
| `/nuke` | `/nuke` | Delete and recreate the channel (same settings) |
| `/snipe` | `/snipe` | Show the last deleted message in the channel |
| `/automod` | `/otomod` | Manage profanity, spam, link, and caps filters |
| `/lock` | `/kilitle` | Lock or unlock a channel for everyone |
| `/slowmode` | `/yavaşmod` | Set the channel message cooldown |
| `/unban` | `/yasakkaldır` | Remove a user's ban |

> **Temp Ban:** Supports `30s` · `10m` · `2h` · `1d` · `7d` formats. Auto-unban on expiry.

---

### 🎵 Music (10 commands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/play` | `/çal` | Play a song — search YouTube or paste a URL |
| `/skip` | `/atla` | Skip the current song |
| `/stop` | `/durdur` | Stop music and clear the queue |
| `/pause` | `/duraklat` | Pause the current song |
| `/resume` | `/devam` | Resume a paused song |
| `/volume` | `/ses` | Set playback volume (1–100) |
| `/nowplaying` | `/şimdi` | Show the currently playing song |
| `/queue` | `/kuyruk` | Show the music queue with pagination |
| `/loop` | `/döngü` | Toggle loop mode for the current song |
| `/shuffle` | `/karıştır` | Shuffle the queue with Fisher-Yates algorithm |

> **YouTube:** Uses `player_client=ios,web` extractor — no cookies required.  
> **Auto Retry:** Failed tracks are automatically retried once.

---

### 😄 Fun (3 commands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/8ball` | `/soru` | Ask the magic 8-ball a question |
| `/joke` | `/şaka` | Get a random programming/tech joke |
| `/magic` | `/büyü` | Magic system — see subcommands below |

#### Magic Subcommands (`/magic`)

| Subcommand | TR | Description |
|------------|----|-------------|
| `study` | `çalış` | Learn a random spell. New spells are collected; duplicates give 50 XP (1h cooldown) |
| `library` | `kütüphane` | View your spell collection sorted by rarity. Can view other users' collections |
| `cast` | `kullan` | Cast a spell from your collection — earn XP or Okane bonus |
| `duel` | `düello` | Challenge another user to a magic duel (Okane bet, 60s timeout) |

**35 spells · 6 rarities:** Common (⬜) · Uncommon (🟩) · Rare (🟦) · Epic (🟪) · Legendary (🟨) · Mythic (🟥)

---

### 🎮 Games (6 commands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/blackjack` | `/blackjack` | Play blackjack — hit, stand, double down |
| `/coinflip` | `/yazıtura` | Flip a coin and bet Okane |
| `/slot` | `/slot` | Spin the slot machine |
| `/guess` | `/tahmin` | Guess the bot's number (1–100) in 10 tries |
| `/counting-setup` | `/sayısayma-kur` | Set up a counting game channel |
| `/wordchain-setup` | `/kelimezinciri-kur` | Set up a word chain game channel |

---

### 🎉 Giveaway (1 command, multiple subcommands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/giveaway` | `/çekiliş` | Giveaway management — start, end, reroll, list |

> Manage active giveaways from the dashboard — end early or reroll winners.

---

### ✨ Leveling (1 command)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/rank` | `/seviye` | Show your XP, level and server rank card |

> Level rewards are configured by admins with `/level-rewards`.

---

### 🎫 Tickets (1 command)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/ticket-setup` | `/ticket-kur` | Set up the ticket (support) system |

> Tickets auto-create channels, save transcripts, and include close buttons.

---

### 🔧 Utility (13 commands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/help` | `/yardım` | Browse all commands in a categorized menu |
| `/ping` | `/ping` | Measure bot and Discord API latency (🟢/🟡/🔴) |
| `/botinfo` | `/bot-bilgi` | Show uptime, server count, memory and tech details |
| `/serverinfo` | `/sunucu-bilgi` | Show server statistics, channels, roles, boost level |
| `/userinfo` | `/kullanıcı-bilgi` | Show account info, roles, badges, banner |
| `/avatar` | `/avatar` | Display a user's profile picture in full size |
| `/afk` | `/afk` | Go AFK — anyone who mentions you gets notified |
| `/reminder` | `/hatırlatıcı` | Set a reminder for later |
| `/embed-mesaj` | `/embed-mesaj` | Build and send a custom embed message |
| `/embed-rol` | `/embed-rol` | Create a reaction-role embed |
| `/r` | `/r` | Quickly add reaction roles to a message |
| `/poll` | `/anket` | Create a timed poll with 2–5 options, auto-results |
| `/birthday` | `/doğumgünü` | Birthday system — see subcommands below |

#### Birthday Subcommands (`/birthday`)

| Subcommand | TR | Description |
|------------|----|-------------|
| `set` | `ayarla` | Register your birthday (day + month) |
| `remove` | `kaldır` | Remove your registered birthday |
| `list` | `liste` | Show upcoming birthdays in the server |
| `check` | `kontrol` | Check a user's birthday |
| `setup` | `kur` | Configure birthday channel and role (Admin only) |

> Automatic celebration message and 24-hour birthday role every morning at **09:00**.

---

### ⚙️ Admin (9 commands)

| Command | TR Alias | Description |
|---------|----------|-------------|
| `/settings` | `/ayarlar` | Toggle bot modules and manage server settings |
| `/setup` | `/kurulum` | One-click server channel and role setup wizard |
| `/welcome` | `/hoşgeldin` | Configure welcome and goodbye messages |
| `/autorole` | `/otorol` | Manage roles automatically given on join |
| `/buttonrole` | `/butonrol` | Set up button-click role assignment |
| `/selectrole` | `/seçimrol` | Set up dropdown menu role assignment |
| `/colorrole` | `/renk` | Color role system |
| `/stats-channels` | `/istatistik` | Set up live stats channels (member count, etc.) |
| `/level-rewards` | `/seviye-ödülleri` | Assign roles as rewards for reaching certain levels |

---

## 🚀 Setup

### Requirements
- **Node.js** v18 or higher
- **FFmpeg** (for music)
- **Python 3 + make + g++** (for sodium-native compilation)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/oktayyavuz/frieren-bot.git
cd frieren-bot

# 2. Install dependencies
npm install

# 3. Configure .env
cp .env.example .env
```

`.env` file:
```env
DISCORD_TOKEN=YourBotToken
CLIENT_ID=YourBotClientID
GUILD_ID=TestGuildID          # Only needed for test deployment
DATABASE_URL="file:./dev.db"
BOT_API_KEY=AStrongApiKey
```

```bash
# 4. Set up the database
npx prisma db push
npx prisma generate

# 5. Register slash commands
node src/deploy-commands.js

# 6. Start the bot
npm run start
```

### Dashboard Setup (Next.js)

```bash
cd dashboard
cp .env.example .env.local
# DATABASE_URL="file:../dev.db"   ← Shared with bot (parent folder)
# NEXTAUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET required

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

**PM2 Apps:**
- `frieren-bot` — Cluster mode, no port
- `frieren-dashboard` — Fork mode, port 9931

> **Note:** If ffmpeg is not installed: `apt install ffmpeg`  
> **Note:** For sodium-native: `apt install python3 make g++`

---

## 📁 Project Structure

```
frieren/
├── src/
│   ├── commands/
│   │   ├── slash/
│   │   │   ├── admin/          ⚙️  Admin commands
│   │   │   ├── economy/        💰  Economy commands
│   │   │   ├── fun/            😄  Fun commands
│   │   │   ├── games/          🎮  Game commands
│   │   │   ├── giveaway/       🎉  Giveaway commands
│   │   │   ├── level/          ✨  Level commands
│   │   │   ├── moderation/     🛡️  Moderation commands
│   │   │   ├── music/          🎵  Music commands
│   │   │   ├── ticket/         🎫  Ticket commands
│   │   │   └── utility/        🔧  Utility commands
│   │   └── prefix/owner/       🔑  Owner-only dev tools
│   ├── events/                 📡  Discord event handlers
│   ├── systems/                ⚙️  Background systems
│   │   ├── music/MusicQueue.js 🎵  Music queue manager
│   │   ├── birthdayChecker.js  🎂  Daily birthday check
│   │   ├── leveling.js         ✨  XP system
│   │   ├── syncService.js      🔄  Dashboard sync
│   │   └── recovery.js         🔁  Startup recovery
│   ├── utils/                  🔨  Helpers & utilities
│   ├── api/server.js           🌐  Internal HTTP API (port 4917)
│   └── index.js                🚀  Entry point
├── dashboard/                  📊  Next.js dashboard
├── prisma/schema.prisma        🗃️  Bot database schema
└── config.js                   ⚙️  Bot configuration
```

---

## 🛠️ Tech Stack

| Area | Technology |
|------|-----------|
| Language | JavaScript (Node.js) |
| Discord | discord.js v14 |
| Database | Prisma ORM + SQLite |
| Dashboard | Next.js 14 App Router |
| Auth | NextAuth v5 |
| Music | @discordjs/voice + yt-dlp-exec |
| Logging | Winston + Chalk |
| Process | PM2 (cluster) |

---

## 👤 Developer

- **Author:** [oktayyavuz](https://github.com/oktayyavuz)
- **Website:** [frieren.oktaydev.com](https://frieren.oktaydev.com)
- **Support:** [Discord Server](https://discord.gg/dvCKjxHn35)

---

## 📝 License

This project is licensed under the [MIT](LICENSE) license.

> [!NOTE]
> The bot ships with a real-time dashboard sync system — settings changed on the web panel are reflected in the bot immediately. The internal bot API (port 4917) feeds live channel/role data to the dashboard.
