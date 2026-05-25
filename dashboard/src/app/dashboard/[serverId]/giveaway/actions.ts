"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Çekilişi erken sonlandır — katılımcıları sıfırlayarak ended=true yap */
export async function endGiveawayEarly(giveawayId: number, serverId: string) {
    await prisma.giveaway.update({
        where: { id: giveawayId },
        data: { ended: true, endTime: new Date() },
    });
    revalidatePath(`/dashboard/${serverId}/giveaway`);
}

/** Kazananları yeniden çek (reroll) — sadece biten çekilişler için */
export async function rerollGiveaway(giveawayId: number, serverId: string) {
    const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId } });
    if (!giveaway || !giveaway.ended) return { error: "Çekiliş bitmemiş." };

    let participants: string[] = [];
    try { participants = JSON.parse(giveaway.participants); } catch { participants = []; }

    if (participants.length === 0) return { error: "Katılımcı yok." };

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newWinners = shuffled.slice(0, Math.min(giveaway.winners, shuffled.length));

    await prisma.giveaway.update({
        where: { id: giveawayId },
        data: { winnerIds: JSON.stringify(newWinners) },
    });

    revalidatePath(`/dashboard/${serverId}/giveaway`);
    return { winners: newWinners };
}
