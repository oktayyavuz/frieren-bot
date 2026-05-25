import { prisma } from "@/lib/prisma";
import SecurityForm from "./security-form";
import { ShieldAlert } from "lucide-react";

export default async function SecurityPage({
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
        console.error("[modules] Prisma error:", e);
    }

    const initialData = {
        automodEnabled: settings?.automodEnabled ?? false,
        antiSwearEnabled: settings?.antiSwearEnabled ?? false,
        antiSpamEnabled: settings?.antiSpamEnabled ?? false,
        antiCapsEnabled: settings?.antiCapsEnabled ?? false,
        antiLinkEnabled: settings?.antiLinkEnabled ?? false,
        antiSwearWords: settings?.antiSwearWords ?? "",
        antiSpamLimit: settings?.antiSpamLimit ?? 5,
        antiSpamInterval: settings?.antiSpamInterval ?? 5000,
        antiCapsPercent: settings?.antiCapsPercent ?? 70,
        antiCapsMinLength: settings?.antiCapsMinLength ?? 10,
        antiLinkWhitelist: settings?.antiLinkWhitelist ?? "",
        automodWhitelistRoles: settings?.automodWhitelistRoles ?? "[]",
        antiRaidEnabled: settings?.antiRaidEnabled ?? false,
        antiRaidLimit: settings?.antiRaidLimit ?? 10,
        antiRaidInterval: settings?.antiRaidInterval ?? 10000,
        antiRaidAction: settings?.antiRaidAction ?? "kick",
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                        <ShieldAlert className="h-7 w-7 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Güvenlik & Koruma</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Oto-moderasyon, Anti-Raid ve kelime filtrelerini yapılandırın.</p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                        settings?.automodEnabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                        {settings?.automodEnabled ? "Aktif" : "Devre Dışı"}
                    </div>
                </div>
            </div>

            <SecurityForm serverId={params.serverId} initialData={initialData} />
        </div>
    );
}
