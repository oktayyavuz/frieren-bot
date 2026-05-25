"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

export async function updateLevelingSettings(serverId: string, data: any) {
    try {
        await prisma.guildSettings.upsert({
            where: { id: serverId },
            update: {
                levelingEnabled: data.levelingEnabled,
                levelUpChannelId: data.levelUpChannelId || null,
                levelUpMessage: data.levelUpMessage,
            },
            create: {
                id: serverId,
                levelingEnabled: data.levelingEnabled,
                levelUpChannelId: data.levelUpChannelId || null,
                levelUpMessage: data.levelUpMessage,
            },
        });

        await triggerInstantSync(serverId);

        revalidatePath(`/dashboard/${serverId}/leveling`);
        return { success: true };
    } catch (e) {
        console.error("[ACTION] Update leveling settings error:", e);
        throw e;
    }
}
