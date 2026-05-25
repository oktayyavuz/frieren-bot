const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType,
    NoSubscriberBehavior,
} = require('@discordjs/voice');
const ytdlp = require('yt-dlp-exec');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');


const COOKIES_PATH = path.resolve(__dirname, '../../../cookies.txt');
const hasCookies = fs.existsSync(COOKIES_PATH);


const YT_EXTRACTOR_ARGS = 'youtube:player_client=ios,web';
const YT_COMMON_OPTS = {
    noWarnings: true,
    noCheckCertificates: true,
    preferFreeFormats: true,
    extractorArgs: YT_EXTRACTOR_ARGS,
    ...(hasCookies ? { cookies: COOKIES_PATH } : {}),
};

class MusicQueue {
    constructor({ guildId, voiceChannel, textChannel }) {
        this.guildId = guildId;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.tracks = [];
        this.currentTrack = null;
        this.volume = 80;
        this.paused = false;
        this.loop = false;
        this._connection = null;
        this._player = null;
        this._destroyed = false;
        this._leaveTimer = null;
        this._activeProcs = [];
    }

    async connect() {
        this._connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.guildId,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
        });

        this._player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
        });
        this._connection.subscribe(this._player);

        this._player.on(AudioPlayerStatus.Idle, () => {
            const justFinished = this.currentTrack;
            this.currentTrack = null;

            
            if (this.loop && justFinished) {
                const { _resource, ...trackData } = justFinished;
                this.tracks.unshift(trackData);
            }

            if (this.tracks.length > 0) {
                this._playNext().catch(err =>
                    logger.error(`Music playNext error: ${err.message}`, 'MUSIC')
                );
            } else {
                this._scheduleLeave();
            }
        });

        this._player.on('error', err => {
            logger.error(`Music player error: ${err.message}`, 'MUSIC');
            this._killActiveProcs();

            const failedTrack = this.currentTrack;
            this.currentTrack = null;

            
            if (failedTrack && !failedTrack._retried) {
                logger.info(`Retrying track: ${failedTrack.title}`, 'MUSIC');
                this.tracks.unshift({ ...failedTrack, _retried: true });
            }

            if (this.tracks.length > 0) {
                setTimeout(() => this._playNext().catch(() => {}), 1000);
            } else {
                this._scheduleLeave();
            }
        });

        this._connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(this._connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(this._connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch {
                if (!this._destroyed) this.destroy();
            }
        });
    }

    /**
     * Sorguyu (URL veya arama terimi) çözer, kuyruğa ekler.
     * { track, startedNow } döner.
     */
    async addTrack(query, requestedBy) {
        this._clearLeaveTimer();

        let info;
        if (query && typeof query === 'object' && query.url) {
            info = {
                title: query.title || 'Bilinmeyen',
                url: query.url,
                duration: query.duration || 'Canlı',
                durationSec: query.durationSec || query.durationSeconds || 0,
                thumbnail: query.thumbnail || null,
                requestedBy: query.requestedBy || requestedBy,
            };
        } else {
            const isUrl = /^https?:\/\//.test(query);
            const searchQuery = isUrl ? query : `ytsearch1:${query}`;

            const result = await ytdlp(searchQuery, {
                dumpSingleJson: true,
                flatPlaylist: true,
                ...YT_COMMON_OPTS,
            });

            const entry = result.entries ? result.entries[0] : result;
            if (!entry) throw new Error('Sonuç bulunamadı');

            info = {
                title: entry.title || 'Bilinmeyen',
                url: entry.webpage_url || entry.url,
                duration: entry.duration ? _fmt(entry.duration) : 'Canlı',
                durationSec: entry.duration || 0,
                thumbnail: entry.thumbnail || null,
                requestedBy,
            };
        }

        const startedNow = !this.currentTrack;
        this.tracks.push(info);

        if (startedNow) {
            await this._playNext();
        }

        return { track: info, startedNow };
    }

    async _playNext() {
        if (!this.tracks.length) { this.currentTrack = null; return; }

        this.currentTrack = this.tracks.shift();
        this.paused = false;

        
        if (this._connection && this._connection.state.status !== VoiceConnectionStatus.Ready) {
            try {
                await entersState(this._connection, VoiceConnectionStatus.Ready, 15000);
            } catch {
                logger.error('[MusicQueue] Ses bağlantısı zaman aşımına uğradı, yine de deneniyor...', 'MUSIC');
            }
        }

        this._killActiveProcs();

        const stream = this._getStream(this.currentTrack.url);
        const resource = createAudioResource(stream, {
            inputType: StreamType.Raw,
            inlineVolume: true,
        });
        resource.volume.setVolume(this.volume / 100);
        this._player.play(resource);
    }

    /**
     * yt-dlp → ffmpeg pipe: raw PCM s16le 48000Hz stereo
     */
    _getStream(url) {
        const ytProc = ytdlp.exec(url, {
            format: 'bestaudio[ext=webm]/bestaudio/best',
            output: '-',
            quiet: true,
            ...YT_COMMON_OPTS,
        });

        const ffProc = spawn(ffmpegPath, [
            '-i', 'pipe:0',
            '-analyzeduration', '32M',   
            '-probesize', '32M',
            '-loglevel', 'error',
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2',
            '-bufsize', '512k',
            'pipe:1',
        ]);

        
        ffProc.stdin.on('error', () => {});
        ytProc.stdout.on('error', () => {});
        ffProc.stdout.on('error', () => {});
        ytProc.on('error', () => {});
        ffProc.on('error', () => {});

        ytProc.stdout.pipe(ffProc.stdin);

        
        ffProc.on('close', () => { try { ytProc.kill('SIGKILL'); } catch {} });
        ytProc.on('close', () => { try { ffProc.stdin.destroy(); } catch {} });

        ytProc.stderr?.on('data', d => {
            const m = d.toString().trim();
            if (m) logger.error(`[yt-dlp] ${m}`, 'MUSIC');
        });
        ffProc.stderr.on('data', d => {
            const m = d.toString().trim();
            if (m) logger.error(`[ffmpeg] ${m}`, 'MUSIC');
        });

        this._activeProcs = [ytProc, ffProc];
        return ffProc.stdout;
    }

    _killActiveProcs() {
        for (const p of this._activeProcs) {
            try { p.kill('SIGKILL'); } catch {}
        }
        this._activeProcs = [];
    }

    skip() { this._player?.stop(true); }

    pause() {
        if (this._player && !this.paused) {
            this._player.pause();
            this.paused = true;
        }
    }

    resume() {
        if (this._player && this.paused) {
            this._player.unpause();
            this.paused = false;
        }
    }

    stop() {
        this.tracks = [];
        this.currentTrack = null;
        this._killActiveProcs();
        this._player?.stop(true);
    }

    setVolume(vol) {
        this.volume = Math.max(1, Math.min(100, vol));
        
        if (this._player?.state?.resource?.volume) {
            this._player.state.resource.volume.setVolume(this.volume / 100);
        }
    }

    toggleLoop() {
        this.loop = !this.loop;
        return this.loop;
    }

    _scheduleLeave(ms = 30_000) {
        this._leaveTimer = setTimeout(() => {
            if (!this.currentTrack && !this._destroyed) this.destroy();
        }, ms);
    }

    _clearLeaveTimer() {
        if (this._leaveTimer) { clearTimeout(this._leaveTimer); this._leaveTimer = null; }
    }

    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this._clearLeaveTimer();
        this._killActiveProcs();
        this.tracks = [];
        this.currentTrack = null;
        this._player?.stop(true);
        this._connection?.destroy();
    }
}

function _fmt(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

module.exports = MusicQueue;
