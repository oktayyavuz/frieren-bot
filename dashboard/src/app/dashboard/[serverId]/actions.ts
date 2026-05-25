"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "./sync-actions";

async function verifyAccess(serverId: string) {
    const session = await auth();
    return !!session;
}

export async function toggleAutoMod(serverId: string, enabled: boolean) {
    const hasAccess = await verifyAccess(serverId);
    if (!hasAccess) throw new Error("Yetkisiz erişim");

    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: { automodEnabled: enabled },
        create: { id: serverId, automodEnabled: enabled },
    });

    await triggerInstantSync(serverId);

    revalidatePath(`/dashboard/${serverId}/modules`);
}

export async function updateAutoModSettings(serverId: string, data: { spamLimit: number; capsPercent: number }) {
    const hasAccess = await verifyAccess(serverId);
    if (!hasAccess) throw new Error("Yetkisiz erişim");

    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: {
            antiSpamLimit: data.spamLimit,
            antiCapsPercent: data.capsPercent
        },
        create: {
            id: serverId,
            antiSpamLimit: data.spamLimit,
            antiCapsPercent: data.capsPercent
        },
    });

    await triggerInstantSync(serverId);

    revalidatePath(`/dashboard/${serverId}/modules`);
}
