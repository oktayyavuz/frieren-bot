import { prisma } from "@/lib/prisma";
import GiveawayClient from "./giveaway-client";
import { Gift, Trophy, Clock, AlertCircle } from "lucide-react";

export default async function GiveawayPage({
    params,
}: {
    params: { serverId: string };
}) {
    let giveaways: any[] = [];
    try {
        const raw = await prisma.giveaway.findMany({
            where: { guildId: params.serverId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        giveaways = raw.map(g => ({
            ...g,
            endTime: g.endTime.toISOString(),
            createdAt: g.createdAt.toISOString(),
        }));
    } catch (e) {
        console.error("[giveaway] Prisma error:", e);
    }

    const active = giveaways.filter(g => !g.ended).length;
    const ended = giveaways.filter(g => g.ended).length;

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border border-pink-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                        <Gift className="h-7 w-7 text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Çekiliş Yönetimi</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Aktif çekilişleri yönetin, erken bitirin veya kazananları yeniden çekin.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Toplam Çekiliş", value: giveaways.length, icon: Gift, color: "text-pink-400" },
                    { label: "Aktif", value: active, icon: Clock, color: "text-emerald-400" },
                    { label: "Tamamlanan", value: ended, icon: Trophy, color: "text-yellow-400" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            <GiveawayClient serverId={params.serverId} giveaways={giveaways} />
        </div>
    );
}
