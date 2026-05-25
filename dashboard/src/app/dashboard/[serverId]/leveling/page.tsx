import { prisma } from "@/lib/prisma";
import LevelingForm from "./leveling-form";
import { Zap } from "lucide-react";

export default async function LevelingPage({
    params
}: {
    params: { serverId: string };
}) {
    let settings = null;
    try {
        settings = await prisma.guildSettings.findUnique({
            where: { id: params.serverId },
            include: { levelRewards: { orderBy: { level: "asc" } } },
        });
    } catch (e) {
        console.error("[leveling] Prisma error:", e);
    }

    const initialData = {
        levelingEnabled: settings?.levelingEnabled ?? false,
        levelUpChannelId: settings?.levelUpChannelId ?? null,
        levelUpMessage: settings?.levelUpMessage ?? "Tebrikler {user}! **{level}** seviyesine ulaştın! 🎉",
        levelRewards: settings?.levelRewards ?? [],
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                        <Zap className="h-7 w-7 text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Level Sistemi</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">XP kazanımı, seviye atlama mesajları ve rol ödüllerini yapılandırın.</p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                        settings?.levelingEnabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                        {settings?.levelingEnabled ? "Aktif" : "Devre Dışı"}
                    </div>
                </div>
            </div>

            <LevelingForm serverId={params.serverId} initialData={initialData} />
        </div>
    );
}
