import { prisma } from "@/lib/prisma";
import SystemsForm from "./systems-form";
import { ListTree } from "lucide-react";

export default async function SystemsPage({
    params,
}: {
    params: { serverId: string };
}) {
    let settings = null;
    try {
        settings = await prisma.guildSettings.findUnique({
            where: { id: params.serverId },
        });
    } catch (e) {
        console.error("[systems] Prisma error:", e);
    }

    const initialData = {
        statsEnabled: settings?.statsEnabled ?? false,
        privateRoomEnabled: settings?.privateRoomEnabled ?? false,
        ticketEnabled: settings?.ticketEnabled ?? false,
        privateRoomChannelId: settings?.privateRoomChannelId ?? null,
        privateRoomCategoryId: settings?.privateRoomCategoryId ?? null,
        statsCategoryId: settings?.statsCategoryId ?? null,
        autoRoles: settings?.autoRoles ?? "[]",
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent border border-violet-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                        <ListTree className="h-7 w-7 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Sistem Ayarları</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Özel odalar, istatistik kanalları ve otomatik rolleri yapılandırın.</p>
                    </div>
                </div>
            </div>

            <SystemsForm serverId={params.serverId} initialData={initialData} />
        </div>
    );
}
