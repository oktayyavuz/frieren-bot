import { prisma } from "@/lib/prisma";
import SettingsForm from "./settings-form";
import { Settings } from "lucide-react";

export default async function GeneralSettingsPage({
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
        console.error("[settings] Prisma error:", e);
    }

    const defaultData = {
        prefix: settings?.prefix ?? "!",
        language: settings?.language ?? "tr",
        economyEnabled: settings?.economyEnabled ?? false,
        levelingEnabled: settings?.levelingEnabled ?? false,
        moderationEnabled: settings?.moderationEnabled ?? false,
        ticketEnabled: settings?.ticketEnabled ?? false,
        welcomeEnabled: settings?.welcomeEnabled ?? false,
        loggingEnabled: settings?.loggingEnabled ?? false,
        automodEnabled: settings?.automodEnabled ?? false,
        antiRaidEnabled: settings?.antiRaidEnabled ?? false,
        privateRoomEnabled: settings?.privateRoomEnabled ?? false,
        statsEnabled: settings?.statsEnabled ?? false,
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-slate-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center shrink-0">
                        <Settings className="h-7 w-7 text-slate-300" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Sunucu Ayarları</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Botun temel çalışma prensiplerini ve aktif modülleri yönetin.</p>
                    </div>
                </div>
            </div>

            <SettingsForm serverId={params.serverId} initialData={defaultData} />
        </div>
    );
}
