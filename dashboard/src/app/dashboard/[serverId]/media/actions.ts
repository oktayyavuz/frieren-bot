"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

async function verifyAccess(serverId: string) {
    const session = await auth();
    return !!session;
}

export async function updateMediaSettings(serverId: string, data: { helpImage: string | null; economyImage: string | null }) {
    const hasAccess = await verifyAccess(serverId);
    if (!hasAccess) throw new Error("Yetkisiz erişim");

    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: {
            helpEmbedImage: data.helpImage,
            economyEmbedImage: data.economyImage
        },
        create: {
            id: serverId,
            helpEmbedImage: data.helpImage,
            economyEmbedImage: data.economyImage
        },
    });

    await triggerInstantSync(serverId);

    revalidatePath(`/dashboard/${serverId}/media`);
}
