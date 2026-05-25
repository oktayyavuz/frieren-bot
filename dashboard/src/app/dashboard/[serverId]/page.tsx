import { prisma } from "@/lib/prisma";
import { getGuildInfo } from "@/lib/discord";
import Link from "next/link";
import {
    Shield, Coins, Trophy, Users, Zap, Bell, Star, Settings,
    BarChart2, Gift, MessageSquare, Cake, BellRing, AlertTriangle
} from "lucide-react";

export default async function ServerOverviewPage({
    params,
}: {
    params: { serverId: string };
}) {
    let settings = null;
    let guildInfo = null;

    try {
        settings = await prisma.guildSettings.findUnique({
            where: { id: params.serverId },
        });
    } catch (e) {
        console.error("[overview] Prisma error:", e);
    }

    try {
        guildInfo = await getGuildInfo(params.serverId);
    } catch (e) {
        console.error("[overview] Discord API error:", e);
    }

    const modules = [
        { key: "moderationEnabled", label: "Moderasyon", icon: Shield, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
        { key: "economyEnabled", label: "Ekonomi", icon: Coins, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        { key: "levelingEnabled", label: "Level Sistemi", icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { key: "welcomeEnabled", label: "Karşılama", icon: BellRing, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { key: "loggingEnabled", label: "Loglama", icon: Bell, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { key: "ticketEnabled", label: "Biletler", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { key: "starboardEnabled", label: "Starboard", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { key: "automodEnabled", label: "Oto-Mod", icon: Shield, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    ];

    const quickLinks = [
        { name: "Sunucu Ayarları", href: `/dashboard/${params.serverId}/settings`, icon: Settings, color: "text-primary" },
        { name: "Moderasyon", href: `/dashboard/${params.serverId}/moderation`, icon: Shield, color: "text-red-400" },
        { name: "Level Sistemi", href: `/dashboard/${params.serverId}/leveling`, icon: Zap, color: "text-yellow-400" },
        { name: "Ekonomi", href: `/dashboard/${params.serverId}/economy`, icon: Coins, color: "text-emerald-400" },
        { name: "Çekiliş", href: `/dashboard/${params.serverId}/giveaway`, icon: Gift, color: "text-pink-400" },
        { name: "Doğum Günleri", href: `/dashboard/${params.serverId}/birthday`, icon: Cake, color: "text-orange-400" },
        { name: "Starboard", href: `/dashboard/${params.serverId}/starboard`, icon: Star, color: "text-amber-400" },
        { name: "İstatistikler", href: `/dashboard/${params.serverId}/stats`, icon: BarChart2, color: "text-blue-400" },
    ];

    const activeModuleCount = settings
        ? modules.filter(m => (settings as any)[m.key]).length
        : 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <Zap className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Genel Bakış</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {guildInfo?.memberCount
                                ? `${guildInfo.memberCount.toLocaleString()} üye • `
                                : ""}
                            {activeModuleCount} aktif modül
                        </p>
                    </div>
                </div>
            </div>

            {!settings && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Bu sunucu için henüz bot ayarı oluşturulmamış. Sunucuda <code className="mx-1 font-mono">/setup</code> komutunu çalıştırın.
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Üye Sayısı</p>
                        <Users className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold">{guildInfo?.memberCount?.toLocaleString() ?? "—"}</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Aktif Modül</p>
                        <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{activeModuleCount}<span className="text-sm text-muted-foreground font-normal">/{modules.length}</span></p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bot Dili</p>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold uppercase">{settings?.language ?? "tr"}</p>
                </div>
                <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Prefix</p>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold font-mono">{settings?.prefix ?? "!"}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Module Status */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Modül Durumu</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {modules.map((mod) => {
                            const active = settings ? (settings as any)[mod.key] : false;
                            return (
                                <div key={mod.key} className={`flex items-center gap-2.5 p-3 rounded-xl border ${active ? mod.border + " " + mod.bg : "border-white/5 bg-white/[0.02]"} transition-all`}>
                                    <mod.icon className={`h-4 w-4 ${active ? mod.color : "text-muted-foreground/40"}`} />
                                    <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground/50"}`}>
                                        {mod.label}
                                    </span>
                                    <div className={`ml-auto h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-white/10"}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Hızlı Erişim</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {quickLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                                    <link.icon className={`h-4 w-4 ${link.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                                        {link.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Server Info */}
            {settings && (
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Sunucu Bilgileri</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Oluşturulma", value: new Date(settings.createdAt).toLocaleDateString("tr-TR") },
                            { label: "Son Güncelleme", value: new Date(settings.updatedAt).toLocaleDateString("tr-TR") },
                            { label: "Para Birimi", value: `${settings.currencyEmoji} ${settings.currencyName}` },
                            { label: "Starboard Emoji", value: `${settings.starboardEmoji} ${settings.starboardThreshold} ⭐` },
                        ].map((item) => (
                            <div key={item.label} className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                <p className="text-sm font-semibold">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
