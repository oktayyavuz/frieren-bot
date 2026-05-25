"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateGeneralSettings } from "./actions";
import { toast } from "sonner";
import {
    Shield, ShieldAlert, Coins, Trophy, BellRing, Bell,
    MessageSquare, Lock, BarChart2, Music2
} from "lucide-react";

const modules = [
    { key: "moderationEnabled", label: "Moderasyon", desc: "Ban, kick, warning komutları", icon: Shield, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { key: "automodEnabled", label: "Oto-Moderasyon", desc: "Küfür, spam, reklam koruması", icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { key: "antiRaidEnabled", label: "Anti-Raid", desc: "Bot saldırılarına karşı koruma", icon: Lock, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { key: "economyEnabled", label: "Ekonomi", desc: "Market, bakiye, günlük ödüller", icon: Coins, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { key: "levelingEnabled", label: "Level Sistemi", desc: "XP ve seviye kazanımı", icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { key: "welcomeEnabled", label: "Karşılama", desc: "Giriş-çıkış mesajları", icon: BellRing, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { key: "loggingEnabled", label: "Loglama", desc: "Sunucu olaylarını kaydet", icon: Bell, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { key: "ticketEnabled", label: "Biletler", desc: "Destek talebi sistemi", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { key: "privateRoomEnabled", label: "Özel Oda", desc: "Kullanıcı yönetimli ses odaları", icon: Lock, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    { key: "statsEnabled", label: "İstatistik Kanalları", desc: "Üye sayısını kanalda göster", icon: BarChart2, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
];

export default function SettingsForm({
    serverId,
    initialData,
}: {
    serverId: string;
    initialData: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState(initialData);

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateGeneralSettings(serverId, formData);
                toast.success("Ayarlar başarıyla kaydedildi!");
            } catch {
                toast.error("Ayarlar kaydedilirken hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Basic Config */}
            <div className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Temel Yapılandırma</h2>
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Komut Prefix</label>
                        <Input
                            value={formData.prefix}
                            onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                            placeholder="!"
                            className="bg-white/[0.03] w-40 font-mono text-lg"
                            maxLength={5}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bot Dili</label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="flex h-10 rounded-xl border border-input bg-white/[0.03] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="tr">🇹🇷 Türkçe</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Aktif Modüller</h2>
                <div className="grid md:grid-cols-2 gap-3">
                    {modules.map((mod) => {
                        const active = formData[mod.key];
                        return (
                            <div
                                key={mod.key}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                    active ? `${mod.border} ${mod.bg}` : "border-white/5 bg-white/[0.02]"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${active ? mod.bg : "bg-white/5"}`}>
                                        <mod.icon className={`h-4 w-4 ${active ? mod.color : "text-muted-foreground/40"}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{mod.label}</p>
                                        <p className="text-xs text-muted-foreground/60">{mod.desc}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData[mod.key]}
                                    onCheckedChange={(checked) => setFormData((p: any) => ({ ...p, [mod.key]: checked }))}
                                    disabled={isPending}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={isPending} className="px-10">
                    {isPending ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
                </Button>
            </div>
        </div>
    );
}
