import { prisma } from "@/lib/prisma";
import ModerationForm from "./moderation-form";
import { Shield } from "lucide-react";

export default async function ModerationPage({
    params
}: {
    params: { serverId: string };
}) {
    let settings = null;
    try {
        settings = await prisma.guildSettings.findUnique({
            where: { id: params.serverId },
        });
    } catch (e) {
        console.error("[moderation] Prisma error:", e);
    }

    const initialData = {
        moderationEnabled: settings?.moderationEnabled ?? false,
        loggingEnabled: settings?.loggingEnabled ?? false,
        modLogChannel: settings?.modLogChannel ?? null,
        messageLogChannel: settings?.messageLogChannel ?? null,
        voiceLogChannel: settings?.voiceLogChannel ?? null,
        serverLogChannel: settings?.serverLogChannel ?? null,
        antiLinkEnabled: settings?.antiLinkEnabled ?? false,
        antiSpamEnabled: settings?.antiSpamEnabled ?? false,
        antiSpamLimit: settings?.antiSpamLimit ?? 5,
        antiSpamInterval: settings?.antiSpamInterval ?? 5000,
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                        <Shield className="h-7 w-7 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Moderasyon</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Moderasyon komutlarını, log kanallarını ve güvenlik ayarlarını yönetin.</p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                        settings?.moderationEnabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                        {settings?.moderationEnabled ? "Aktif" : "Devre Dışı"}
                    </div>
                </div>
            </div>

            <ModerationForm serverId={params.serverId} initialData={initialData} />
        </div>
    );
}
