"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

async function verifyAccess(serverId: string) {
    const session = await auth();
    return !!session;
}

export async function updateEconomyLevelSettings(serverId: string, data: any) {
    const hasAccess = await verifyAccess(serverId);
    if (!hasAccess) throw new Error("Yetkisiz erişim");

    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: data,
        create: { id: serverId, ...data },
    });

    await triggerInstantSync(serverId);

    revalidatePath(`/dashboard/${serverId}/economy`);
}
