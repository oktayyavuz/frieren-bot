"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

export async function updateModSettings(serverId: string, data: any) {
    try {
        await prisma.guildSettings.upsert({
            where: { id: serverId },
            update: {
                moderationEnabled: data.moderationEnabled,
                loggingEnabled: data.loggingEnabled,
                modLogChannel: data.modLogChannel || null,
                messageLogChannel: data.messageLogChannel || null,
                voiceLogChannel: data.voiceLogChannel || null,
                serverLogChannel: data.serverLogChannel || null,
                antiLinkEnabled: data.antiLinkEnabled,
                antiSpamEnabled: data.antiSpamEnabled,
            },
            create: {
                id: serverId,
                moderationEnabled: data.moderationEnabled,
                loggingEnabled: data.loggingEnabled,
                modLogChannel: data.modLogChannel || null,
                messageLogChannel: data.messageLogChannel || null,
                voiceLogChannel: data.voiceLogChannel || null,
                serverLogChannel: data.serverLogChannel || null,
                antiLinkEnabled: data.antiLinkEnabled,
                antiSpamEnabled: data.antiSpamEnabled,
            },
        });

        await triggerInstantSync(serverId);

        revalidatePath(`/dashboard/${serverId}/moderation`);
        return { success: true };
    } catch (e) {
        console.error("[ACTION] Update moderation settings error:", e);
        throw e;
    }
}
