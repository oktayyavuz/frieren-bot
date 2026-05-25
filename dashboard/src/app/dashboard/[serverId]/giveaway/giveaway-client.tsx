"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Trophy, Users, Clock, RefreshCw, Square } from "lucide-react";
import { endGiveawayEarly, rerollGiveaway } from "./actions";
import { toast } from "sonner";

interface Giveaway {
    id: number;
    prize: string;
    winners: number;
    endTime: string;
    ended: boolean;
    participants: string;
    winnerIds: string;
    channelId: string;
    hostId: string;
}

export default function GiveawayClient({
    serverId,
    giveaways,
}: {
    serverId: string;
    giveaways: Giveaway[];
}) {
    const [isPending, startTransition] = useTransition();
    const [localGiveaways, setLocalGiveaways] = useState(giveaways);

    const active = localGiveaways.filter(g => !g.ended);
    const ended = localGiveaways.filter(g => g.ended);

    function handleEnd(id: number) {
        startTransition(async () => {
            await endGiveawayEarly(id, serverId);
            setLocalGiveaways(prev => prev.map(g => g.id === id ? { ...g, ended: true } : g));
            toast.success("Çekiliş sonlandırıldı!");
        });
    }

    function handleReroll(id: number) {
        startTransition(async () => {
            const result = await rerollGiveaway(id, serverId);
            if ("error" in result) {
                toast.error(result.error);
            } else {
                toast.success(`Yeni kazananlar: ${result.winners.join(", ")}`);
            }
        });
    }

    function parseList(json: string): string[] {
        try { return JSON.parse(json) || []; } catch { return []; }
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleString("tr-TR");
    }

    const GiveawayCard = ({ g }: { g: Giveaway }) => {
        const participants = parseList(g.participants);
        const winnerIds = parseList(g.winnerIds);
        const isActive = !g.ended;
        const endsAt = new Date(g.endTime);
        const isExpired = endsAt < new Date();

        return (
            <Card className={`transition-all ${isActive ? "border-primary/30 bg-primary/5" : "opacity-70"}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Gift className={`h-5 w-5 ${isActive ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
                            {g.prize}
                        </CardTitle>
                        <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? (isExpired ? "⏳ Sonuçlandırılıyor" : "🟢 Aktif") : "✅ Bitti"}
                        </Badge>
                    </div>
                    <CardDescription>
                        Kanal: <code className="text-xs bg-muted px-1 rounded">#{g.channelId}</code>
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>{g.winners} kazanan</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{participants.length} katılımcı</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-xs">{formatDate(g.endTime)}</span>
                        </div>
                    </div>

                    {winnerIds.length > 0 && (
                        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                            <p className="text-xs font-semibold text-yellow-500 mb-1">🏆 Kazananlar</p>
                            <div className="flex flex-wrap gap-1">
                                {winnerIds.map(id => (
                                    <code key={id} className="text-xs bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-400">
                                        @{id}
                                    </code>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        {isActive && (
                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={isPending}
                                onClick={() => handleEnd(g.id)}
                                className="gap-1"
                            >
                                <Square className="h-3.5 w-3.5" />
                                Erken Bitir
                            </Button>
                        )}
                        {!isActive && (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => handleReroll(g.id)}
                                className="gap-1"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Yeniden Çek
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-10">
            {/* Aktif Çekilişler */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Aktif Çekilişler
                    <Badge className="ml-1">{active.length}</Badge>
                </h2>
                {active.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-8 text-center border border-dashed rounded-xl">
                        Şu an aktif çekiliş yok. Discord'da <code>/giveaway</code> komutuyla başlat!
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {active.map(g => <GiveawayCard key={g.id} g={g} />)}
                    </div>
                )}
            </section>

            {/* Biten Çekilişler */}
            {ended.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                        Geçmiş Çekilişler
                        <Badge variant="secondary">{ended.length}</Badge>
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {ended.slice(0, 10).map(g => <GiveawayCard key={g.id} g={g} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
