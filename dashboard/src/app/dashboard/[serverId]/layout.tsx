import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getBotGuilds } from "@/lib/discord-api";
import SidebarNav, { NavGroup } from "./sidebar-nav";
import SyncTerminal from "./sync-terminal";

export default async function ServerLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { serverId: string };
}) {
    const session = await auth();
    if (!session) redirect("/");

    let guild = null;
    try {
        const botGuilds = await getBotGuilds();
        guild = botGuilds.find((g: any) => g.id === params.serverId);
    } catch (e) {
        console.error(e);
    }

    if (!guild) redirect("/dashboard");

    const id = params.serverId;

    const navGroups: NavGroup[] = [
        {
            label: "Genel",
            links: [
                { name: "Genel Bakış", href: `/dashboard/${id}`, icon: "LayoutDashboard" },
                { name: "Sunucu Ayarları", href: `/dashboard/${id}/settings`, icon: "Settings" },
            ],
        },
        {
            label: "Özellikler",
            links: [
                { name: "Moderasyon", href: `/dashboard/${id}/moderation`, icon: "Shield" },
                { name: "Level Sistemi", href: `/dashboard/${id}/leveling`, icon: "Zap" },
                { name: "Karşılama & Log", href: `/dashboard/${id}/welcome`, icon: "BellRing" },
                { name: "Ekonomi", href: `/dashboard/${id}/economy`, icon: "Coins" },
                { name: "Çekiliş", href: `/dashboard/${id}/giveaway`, icon: "Gift" },
                { name: "Biletler", href: `/dashboard/${id}/tickets`, icon: "MessageSquare" },
                { name: "Doğum Günleri", href: `/dashboard/${id}/birthday`, icon: "Cake" },
                { name: "Starboard", href: `/dashboard/${id}/starboard`, icon: "Star" },
            ],
        },
        {
            label: "Sistem",
            links: [
                { name: "Sistem Ayarları", href: `/dashboard/${id}/systems`, icon: "ListTree" },
                { name: "Güvenlik & Koruma", href: `/dashboard/${id}/modules`, icon: "ShieldAlert" },
                { name: "Medya & Görsel", href: `/dashboard/${id}/media`, icon: "ImageIcon" },
            ],
        },
        {
            label: "Analiz",
            links: [
                { name: "İstatistikler", href: `/dashboard/${id}/stats`, icon: "BarChart2" },
            ],
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#09090b] text-foreground">
            {/* Sidebar */}
            <aside className="fixed left-4 top-4 bottom-4 w-64 z-50 flex flex-col">
                <div className="glass h-full rounded-2xl flex flex-col p-5 shadow-2xl overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/15 blur-[60px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between mb-5">
                        <Link href="/dashboard">
                            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <ArrowLeft className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </div>
                        </Link>
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                    </div>

                    {/* Guild Info */}
                    <div className="relative z-10 flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-5">
                        {guild.icon ? (
                            <Image
                                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                alt={guild.name}
                                width={38}
                                height={38}
                                className="rounded-lg"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                                {guild.name.charAt(0)}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate">{guild.name}</span>
                            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                Aktif
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide -mr-1 pr-1">
                        <SidebarNav groups={navGroups} />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 min-h-screen">
                <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </div>
                <SyncTerminal serverId={params.serverId} />
            </main>
        </div>
    );
}
