export interface BotGuild {
    id: string;
    name: string;
    icon: string | null;
    memberCount: number;
    ownerId: string;
    permissions: string;
}

export interface BotChannel {
    id: string;
    name: string;
    type: number;
    parentId: string | null;
    position: number;
}

export interface BotRole {
    id: string;
    name: string;
    color: number;
    managed: boolean;
    position: number;
}

const BOT_API_URL = process.env.BOT_API_URL || 'http://127.0.0.1:4917';
const JWT_SECRET  = process.env.JWT_SECRET || '';

/** Bot API için kısa süreli (30s) JWT üretir */
function createBearerToken(): string {
    const { createHmac } = require('crypto');
    const now = Math.floor(Date.now() / 1000);
    const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ iss: 'frieren-dashboard', iat: now, exp: now + 30 })).toString('base64url');
    const sig = createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${sig}`;
}

async function botFetch(endpoint: string) {
    const res = await fetch(`${BOT_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${createBearerToken()}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Bot API ${res.status}: ${endpoint}`);
    return res.json();
}

let guildsCache: { data: BotGuild[]; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getBotGuildsFromApi(): Promise<BotGuild[]> {
    if (guildsCache && Date.now() - guildsCache.ts < CACHE_TTL) {
        return guildsCache.data;
    }
    const data = await botFetch('/api/guilds');
    guildsCache = { data, ts: Date.now() };
    return data;
}

export async function getGuildChannels(guildId: string): Promise<BotChannel[]> {
    return botFetch(`/api/guilds/${guildId}/channels`);
}

export async function getGuildRoles(guildId: string): Promise<BotRole[]> {
    return botFetch(`/api/guilds/${guildId}/roles`);
}


export const CHANNEL_TYPES: Record<number, string> = {
    0: 'Metin',
    2: 'Ses',
    4: 'Kategori',
    5: 'Duyuru',
    13: 'Stage',
    15: 'Forum',
};

export const TEXT_CHANNEL_TYPES = [0, 5];
export const VOICE_CHANNEL_TYPES = [2, 13];
export const CATEGORY_TYPES = [4];
