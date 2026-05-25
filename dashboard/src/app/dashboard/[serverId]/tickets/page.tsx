import { getTickets } from "./actions";
import TicketList from "./ticket-list";
import { MessageSquare, CheckCircle2, Clock, Activity } from "lucide-react";

export default async function TicketsPage({
    params
}: {
    params: { serverId: string };
}) {
    let tickets: any[] = [];
    try {
        tickets = await getTickets(params.serverId);
    } catch (e) {
        console.error("[tickets] error:", e);
    }

    const total = tickets.length;
    const open = tickets.filter(t => t.status === "open").length;
    const closed = tickets.filter(t => t.status === "closed").length;

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-7 w-7 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Bilet Yönetimi</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Destek taleplerini ve sohbet geçmişlerini inceleyin.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Toplam Bilet", value: total, icon: MessageSquare, color: "text-blue-400" },
                    { label: "Açık Talepler", value: open, icon: Activity, color: "text-emerald-400" },
                    { label: "Kapatılanlar", value: closed, icon: CheckCircle2, color: "text-orange-400" },
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

            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tüm Kayıtlar</h3>
                </div>
                <TicketList tickets={tickets} />
            </div>
        </div>
    );
}
