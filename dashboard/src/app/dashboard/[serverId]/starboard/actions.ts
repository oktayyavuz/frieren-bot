"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

export async function updateStarboardSettings(serverId: string, data: {
    starboardEnabled: boolean;
    starboardChannelId: string | null;
    starboardThreshold: number;
    starboardEmoji: string;
}) {
    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: {
            starboardEnabled: data.starboardEnabled,
            starboardChannelId: data.starboardChannelId || null,
            starboardThreshold: data.starboardThreshold,
            starboardEmoji: data.starboardEmoji,
        },
        create: {
            id: serverId,
            starboardEnabled: data.starboardEnabled,
            starboardChannelId: data.starboardChannelId || null,
            starboardThreshold: data.starboardThreshold,
            starboardEmoji: data.starboardEmoji,
        },
    });

    await triggerInstantSync(serverId);
    revalidatePath(`/dashboard/${serverId}/starboard`);
    return { success: true };
}
