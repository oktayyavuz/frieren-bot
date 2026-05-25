"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerInstantSync } from "../sync-actions";

export async function updateBirthdaySettings(serverId: string, data: {
    birthdayChannelId: string | null;
    birthdayRoleId: string | null;
    birthdayMessage: string;
}) {
    await prisma.guildSettings.upsert({
        where: { id: serverId },
        update: {
            birthdayChannelId: data.birthdayChannelId || null,
            birthdayRoleId: data.birthdayRoleId || null,
            birthdayMessage: data.birthdayMessage,
        },
        create: {
            id: serverId,
            birthdayChannelId: data.birthdayChannelId || null,
            birthdayRoleId: data.birthdayRoleId || null,
            birthdayMessage: data.birthdayMessage,
        },
    });

    await triggerInstantSync(serverId);
    revalidatePath(`/dashboard/${serverId}/birthday`);
    return { success: true };
}

export async function removeBirthday(serverId: string, userId: string) {
    await prisma.birthday.delete({
        where: { userId_guildId: { userId, guildId: serverId } },
    });
    revalidatePath(`/dashboard/${serverId}/birthday`);
    return { success: true };
}
