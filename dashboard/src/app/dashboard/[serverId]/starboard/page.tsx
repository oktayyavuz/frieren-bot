import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";
import StarboardForm from "./starboard-form";

export default async function StarboardPage({
    params,
}: {
    params: { serverId: string };
}) {
    let settings = null;
    let entries: any[] = [];

    try {
        [settings, entries] = await Promise.all([
            prisma.guildSettings.findUnique({ where: { id: params.serverId } }),
            prisma.starboardEntry.findMany({
                where: { guildId: params.serverId },
                orderBy: { starCount: "desc" },
                take: 50,
            }),
        ]);
    } catch (e) {
        console.error("[starboard] Prisma error:", e);
    }

    const serializedEntries = entries.map(e => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
    }));

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Star className="h-7 w-7 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Starboard</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {entries.length} kayıtlı girdi •{" "}
                            {settings?.starboardThreshold ?? 3} {settings?.starboardEmoji ?? "⭐"} minimum
                        </p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                        settings?.starboardEnabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                        {settings?.starboardEnabled ? "Aktif" : "Devre Dışı"}
                    </div>
                </div>
            </div>

            <StarboardForm
                serverId={params.serverId}
                initialData={{
                    starboardEnabled: settings?.starboardEnabled ?? false,
                    starboardChannelId: settings?.starboardChannelId ?? null,
                    starboardThreshold: settings?.starboardThreshold ?? 3,
                    starboardEmoji: settings?.starboardEmoji ?? "⭐",
                }}
                entries={serializedEntries}
            />
        </div>
    );
}
