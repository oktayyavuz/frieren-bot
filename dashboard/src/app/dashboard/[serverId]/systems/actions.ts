"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

async function verifyAccess(serverId: string) {
    const session = await auth();
    return !!session;
}

export async function updateSystemSettings(serverId: string, data: any) {
    const hasAccess = await verifyAccess(serverId);
    if (!hasAccess) throw new Error("Yetkisiz erişim");

    
    const payload = { ...data };
    if (typeof payload.autoRoles === 'string') {
        const ids = payload.autoRoles.split(',').map((s: string) => s.trim()).filter(Boolean);
        payload.autoRoles = JSON.stringify(ids);
    }

    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: payload,
        create: { id: serverId, ...payload },
    });

    await triggerInstantSync(serverId);

    revalidatePath(`/dashboard/${serverId}/systems`);
}
