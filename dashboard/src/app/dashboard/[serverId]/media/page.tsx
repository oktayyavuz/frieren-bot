import { prisma } from "@/lib/prisma";
import { ImageIcon } from "lucide-react";
import MediaForm from "./media-form";

export default async function MediaSettingsPage({
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
        console.error("[media] Prisma error:", e);
    }

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-7 w-7 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Medya & Görsel</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Botun bu sunucuda kullanacağı özel görselleri ve GIF'leri ayarlayın.</p>
                    </div>
                </div>
            </div>

            <div className="glass rounded-2xl p-6">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Embed Resimleri</h2>
                    <p className="text-xs text-muted-foreground mt-1">Boş bırakırsanız bot varsayılan Frieren görselleri kullanır. PNG, JPG veya GIF linki yapıştırabilirsiniz.</p>
                </div>
                <MediaForm
                    serverId={params.serverId}
                    initialHelp={settings?.helpEmbedImage ?? ""}
                    initialEconomy={settings?.economyEmbedImage ?? ""}
                />
            </div>
        </div>
    );
}
