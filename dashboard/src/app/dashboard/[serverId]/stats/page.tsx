import { prisma } from "@/lib/prisma";
import { BarChart2, Trophy, MessageSquare, Coins, TrendingUp } from "lucide-react";

export default async function StatsPage({
    params,
}: {
    params: { serverId: string };
}) {
    let topXp: any[] = [];
    let topBalance: any[] = [];
    let topMessages: any[] = [];
    let totalStats = { users: 0, messages: 0, xp: 0 };

    try {
        [topXp, topBalance, topMessages] = await Promise.all([
            prisma.guildUser.findMany({
                where: { guildId: params.serverId },
                orderBy: { xp: "desc" },
                take: 10,
            }),
            prisma.guildUser.findMany({
                where: { guildId: params.serverId },
                orderBy: { balance: "desc" },
                take: 10,
            }),
            prisma.guildUser.findMany({
                where: { guildId: params.serverId },
                orderBy: { totalMessages: "desc" },
                take: 10,
            }),
        ]);

        const allUsers = await prisma.guildUser.findMany({
            where: { guildId: params.serverId },
            select: { totalMessages: true, xp: true },
        });

        totalStats = {
            users: allUsers.length,
            messages: allUsers.reduce((s, u) => s + u.totalMessages, 0),
            xp: allUsers.reduce((s, u) => s + u.xp, 0),
        };
    } catch (e) {
        console.error("[stats] Prisma error:", e);
    }

    const LeaderboardTable = ({
        title,
        icon: Icon,
        color,
        data,
        valueKey,
        suffix,
    }: {
        title: string;
        icon: any;
        color: string;
        data: any[];
        valueKey: string;
        suffix?: string;
    }) => (
        <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Icon className={`h-4 w-4 ${color}`} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
            </div>
            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground/50 text-center py-8">Veri yok</p>
            ) : (
                <div className="space-y-2">
                    {data.map((user, i) => {
                        const value = user[valueKey];
                        const maxValue = data[0][valueKey] || 1;
                        const pct = Math.round((value / maxValue) * 100);
                        const medals = ["🥇", "🥈", "🥉"];

                        return (
                            <div key={user.id} className="flex items-center gap-3">
                                <span className="text-sm w-6 text-center shrink-0">
                                    {i < 3 ? medals[i] : `${i + 1}.`}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-mono text-muted-foreground truncate">{user.userId}</p>
                                        <p className="text-xs font-bold shrink-0 ml-2">
                                            {value.toLocaleString()}{suffix}
                                        </p>
                                    </div>
                                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${
                                                i === 0 ? "from-yellow-500 to-amber-400" :
                                                i === 1 ? "from-slate-400 to-slate-300" :
                                                i === 2 ? "from-orange-600 to-orange-500" :
                                                "from-primary/60 to-primary/40"
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <BarChart2 className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">İstatistikler</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {totalStats.users} üye • {totalStats.messages.toLocaleString()} toplam mesaj
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Kayıtlı Üye", value: totalStats.users, icon: MessageSquare, color: "text-blue-400" },
                    { label: "Toplam Mesaj", value: totalStats.messages.toLocaleString(), icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Toplam XP", value: totalStats.xp.toLocaleString(), icon: Trophy, color: "text-yellow-400" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Leaderboards */}
            <div className="grid lg:grid-cols-3 gap-6">
                <LeaderboardTable
                    title="En Yüksek XP"
                    icon={Trophy}
                    color="text-yellow-400"
                    data={topXp}
                    valueKey="xp"
                    suffix=" XP"
                />
                <LeaderboardTable
                    title="En Zengin"
                    icon={Coins}
                    color="text-emerald-400"
                    data={topBalance}
                    valueKey="balance"
                />
                <LeaderboardTable
                    title="En Aktif"
                    icon={MessageSquare}
                    color="text-blue-400"
                    data={topMessages}
                    valueKey="totalMessages"
                    suffix=" mesaj"
                />
            </div>
        </div>
    );
}
