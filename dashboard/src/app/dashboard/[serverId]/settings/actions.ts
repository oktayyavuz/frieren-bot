"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

async function verifyAccess(serverId: string) {
    const session = await auth();
    return !!session;
}

export async function updateGeneralSettings(serverId: string, data: any) {
    const hasAccess = await verifyAccess(serverId);
    if (!hasAccess) throw new Error("Yetkisiz erişim");

    
    const processedData = { ...data };

    
    if (typeof processedData.antiSwearWords === 'string') {
        processedData.antiSwearWords = JSON.stringify(
            processedData.antiSwearWords.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        );
    }
    if (typeof processedData.antiLinkWhitelist === 'string') {
        processedData.antiLinkWhitelist = JSON.stringify(
            processedData.antiLinkWhitelist.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        );
    }
    if (typeof processedData.automodWhitelistRoles === 'string') {
        processedData.automodWhitelistRoles = JSON.stringify(
            processedData.automodWhitelistRoles.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        );
    }
    if (typeof processedData.autoRoles === 'string') {
        processedData.autoRoles = JSON.stringify(
            processedData.autoRoles.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        );
    }

    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: processedData,
        create: { id: serverId, ...processedData },
    });

    
    await triggerInstantSync(serverId);

    revalidatePath(`/dashboard/${serverId}/settings`);
    revalidatePath(`/dashboard/${serverId}`);
}
