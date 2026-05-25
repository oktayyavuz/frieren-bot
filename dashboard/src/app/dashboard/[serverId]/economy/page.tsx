import { prisma } from "@/lib/prisma";
import EconomyLevelForm from "./economy-level-form";
import { Coins } from "lucide-react";

export default async function EconomyLevelPage({
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
        console.error("[economy] Prisma error:", e);
    }

    const initialData = {
        currencyName: settings?.currencyName ?? "Okane",
        currencyEmoji: settings?.currencyEmoji ?? "💰",
        levelUpChannelId: settings?.levelUpChannelId ?? null,
        levelUpMessage: settings?.levelUpMessage ?? "Tebrikler {user}! **{level}** seviyesine ulaştın! 🎉",
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                        <Coins className="h-7 w-7 text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Ekonomi</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Para birimi adını, emojisini ve ekonomi ayarlarını özelleştirin.</p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                        settings?.economyEnabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                        {settings?.economyEnabled ? "Aktif" : "Devre Dışı"}
                    </div>
                </div>
            </div>

            <EconomyLevelForm serverId={params.serverId} initialData={initialData} />
        </div>
    );
}
