"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChannelSelect } from "@/components/ui/channel-select";
import { updateStarboardSettings } from "./actions";
import { Star, Hash } from "lucide-react";

interface StarboardEntry {
    id: number;
    originalMsgId: string;
    starCount: number;
    channelId: string;
    authorId: string;
    createdAt: string;
}

export default function StarboardForm({
    serverId,
    initialData,
    entries,
}: {
    serverId: string;
    initialData: {
        starboardEnabled: boolean;
        starboardChannelId: string | null;
        starboardThreshold: number;
        starboardEmoji: string;
    };
    entries: StarboardEntry[];
}) {
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState(initialData);

    const set = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateStarboardSettings(serverId, form);
                toast.success("Starboard ayarları kaydedildi!");
            } catch {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Toggle */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold">Starboard Sistemi</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Belirli sayıda reaksiyon alan mesajları özel kanalda sergile.</p>
                    </div>
                    <Switch
                        checked={form.starboardEnabled}
                        onCheckedChange={(v) => set("starboardEnabled", v)}
                    />
                </div>
            </div>

            {/* Settings */}
            <div className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Yapılandırma</h2>

                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <Hash className="h-4 w-4 text-amber-400" />
                            Starboard Kanalı
                        </label>
                        <ChannelSelect
                            serverId={serverId}
                            value={form.starboardChannelId}
                            onChange={(v) => set("starboardChannelId", v)}
                            types={[0]}
                            placeholder="Kanal seçin..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reaksiyon Emoji</label>
                        <Input
                            value={form.starboardEmoji}
                            onChange={(e) => set("starboardEmoji", e.target.value)}
                            placeholder="⭐"
                            className="bg-white/[0.03] font-mono text-lg"
                            maxLength={10}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Minimum Reaksiyon Sayısı: <span className="text-primary font-bold">{form.starboardThreshold}</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={1}
                            max={25}
                            value={form.starboardThreshold}
                            onChange={(e) => set("starboardThreshold", parseInt(e.target.value))}
                            className="flex-1 accent-primary"
                        />
                        <Input
                            type="number"
                            min={1}
                            max={25}
                            value={form.starboardThreshold}
                            onChange={(e) => set("starboardThreshold", parseInt(e.target.value) || 3)}
                            className="w-20 bg-white/[0.03]"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isPending} className="px-8">
                        {isPending ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                </div>
            </div>

            {/* Recent Entries */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Son Starboard Girdileri ({entries.length})
                </h2>

                {entries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground/50">
                        <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Henüz starboard'a eklenen mesaj yok.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entries.slice(0, 20).map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">
                                        ⭐
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-muted-foreground">Mesaj: {entry.originalMsgId}</p>
                                        <p className="text-xs text-muted-foreground">Yazar: {entry.authorId}</p>
                                    </div>
                                </div>
                                <div className="text-amber-400 font-bold text-sm">
                                    {entry.starCount} ⭐
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
