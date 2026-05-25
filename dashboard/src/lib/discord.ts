/**
 * Lightweight Discord REST API utility for the Dashboard.
 * Replaces discord.js to avoid native dependency issues (like zlib-sync) in Next.js.
 */

const DISCORD_API_URL = "https://discord.com/api/v10";

async function discordFetch(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${DISCORD_API_URL}${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.text();
        console.error(`Discord API Error [${res.status}]:`, error);
        return null;
    }

    return res.json();
}

export async function getGuildInfo(guildId: string) {
    const guild: any = await discordFetch(`/guilds/${guildId}?with_counts=true`);
    if (!guild) return null;

    return {
        memberCount: guild.approximate_member_count || 0,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png` : null,
    };
}

export async function createDiscordChannel(guildId: string, name: string, type: number, parentId?: string) {
    return await discordFetch(`/guilds/${guildId}/channels`, {
        method: "POST",
        body: JSON.stringify({
            name,
            type,
            parent_id: parentId,
        }),
    });
}

export async function createDiscordCategory(guildId: string, name: string) {
    return await createDiscordChannel(guildId, name, 4); 
}

export async function deleteDiscordChannel(channelId: string) {
    return await discordFetch(`/channels/${channelId}`, {
        method: "DELETE",
    });
}


export async function getDiscordClient() {
    return {
        guilds: {
            fetch: async (id: string) => {
                const guild = await getGuildInfo(id);
                return { ...guild, channels: { create: (opts: any) => createDiscordChannel(id, opts.name, opts.type, opts.parent) } };
            }
        }
    };
}
