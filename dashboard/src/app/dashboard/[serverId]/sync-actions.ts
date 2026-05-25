"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * En son 20 senkronizasyon logunu getirir
 */
export async function getSyncLogs(serverId: string) {
    try {
        
        return await prisma.syncLog.findMany({
            where: { guildId: serverId },
            orderBy: { timestamp: "desc" },
            take: 20
        });
    } catch (e) {
        console.error("Log çekme hatası:", e);
        return [];
    }
}

/**
 * Anlık senkronizasyonu tetikler
 */
export async function triggerInstantSync(serverId: string) {
    try {
        
        await prisma.syncRequest.upsert({
            where: { guildId: serverId },
            update: { requestedAt: new Date() },
            create: { guildId: serverId }
        });

        revalidatePath(`/dashboard/${serverId}`);
        return { success: true };
    } catch (e) {
        console.error("Sync tetikleme hatası:", e);
        return { success: false, error: "Tetikleme başarısız." };
    }
}

/**
 * Logları temizler
 */
export async function clearSyncLogs(serverId: string) {
    try {
        await prisma.syncLog.deleteMany({
            where: { guildId: serverId }
        });
        revalidatePath(`/dashboard/${serverId}`);
        return { success: true };
    } catch (e) {
        console.error("Log silme hatası:", e);
        return { success: false };
    }
}

/**
 * Ticket sistemini senkronize eder (Manuel tetikleme)
 */
export async function syncTicketSystem(serverId: string) {
    return triggerInstantSync(serverId);
}

/**
 * Log kanallarını otomatik kurar (Manuel tetikleme)
 */
export async function setupLogChannels(serverId: string) {
    return triggerInstantSync(serverId);
}