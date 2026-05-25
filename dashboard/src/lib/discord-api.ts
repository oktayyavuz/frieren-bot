import { getBotGuildsFromApi } from './bot-api';

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: string;
    features: string[];
}

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    const res = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error(`User Guilds Fetch Error: ${res.status} ${res.statusText}`, errorBody);
        throw new Error(`Failed to fetch user guilds: ${res.status}`);
    }

    return res.json();
}

export async function getBotGuilds(): Promise<any[]> {
    try {
        return await getBotGuildsFromApi();
    } catch (err: any) {
        console.error('[discord-api] getBotGuilds fallback to Discord API:', err.message);
        
        const res = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
            cache: "no-store",
        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`Failed to fetch bot guilds: ${res.status} ${res.statusText} - ${text}`);
            throw new Error(`Failed to fetch bot guilds: ${res.status}`);
        }
        return res.json();
    }
}

export function hasPermission(permissions: string, permissionBit: bigint): boolean {
    const permissionsBigInt = BigInt(permissions);
    return (permissionsBigInt & permissionBit) === permissionBit;
}

export const DISCORD_PERMISSIONS = {
    MANAGE_GUILD: BigInt(0x0000000020),
    ADMINISTRATOR: BigInt(0x0000000008),
};
