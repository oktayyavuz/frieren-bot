import { prisma } from "@/lib/prisma";
import WelcomeLogForm from "./welcome-log-form";
import { BellRing } from "lucide-react";

export default async function WelcomeLogPage({
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
        console.error("[welcome] Prisma error:", e);
    }

    const initialData = {
        welcomeEnabled: settings?.welcomeEnabled ?? false,
        loggingEnabled: settings?.loggingEnabled ?? false,
        welcomeChannelId: settings?.welcomeChannelId ?? null,
        welcomeMessage: settings?.welcomeMessage ?? "Hoş geldin {user}! Sunucumuza katıldığın için teşekkürler.",
        goodbyeChannelId: settings?.goodbyeChannelId ?? null,
        goodbyeMessage: settings?.goodbyeMessage ?? "Güle güle {user}! Umarız tekrar görüşürüz.",
        messageLogChannel: settings?.messageLogChannel ?? null,
        modLogChannel: settings?.modLogChannel ?? null,
        voiceLogChannel: settings?.voiceLogChannel ?? null,
        serverLogChannel: settings?.serverLogChannel ?? null,
    };

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <BellRing className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Karşılama & Log</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Giriş-çıkış mesajlarını ve detaylı log kanallarını yönetin.</p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                        settings?.welcomeEnabled
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                        {settings?.welcomeEnabled ? "Aktif" : "Devre Dışı"}
                    </div>
                </div>
            </div>

            <WelcomeLogForm serverId={params.serverId} initialData={initialData} />
        </div>
    );
}
