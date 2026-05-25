"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChannelSelect } from "@/components/ui/channel-select";
import { RoleSelect } from "@/components/ui/role-select";
import { updateBirthdaySettings, removeBirthday } from "./actions";
import { Cake, Hash, Users, MessageSquare, Trash2 } from "lucide-react";

const MONTH_NAMES = [
    "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

interface Birthday {
    userId: string;
    day: number;
    month: number;
}

export default function BirthdayForm({
    serverId,
    initialData,
    birthdays,
}: {
    serverId: string;
    initialData: {
        birthdayChannelId: string | null;
        birthdayRoleId: string | null;
        birthdayMessage: string;
    };
    birthdays: Birthday[];
}) {
    const [isPending, startTransition] = useTransition();
    const [isRemoving, startRemoving] = useTransition();
    const [form, setForm] = useState(initialData);

    const set = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateBirthdaySettings(serverId, form);
                toast.success("Doğum günü ayarları kaydedildi!");
            } catch {
                toast.error("Hata oluştu.");
            }
        });
    };

    const handleRemove = (userId: string) => {
        startRemoving(async () => {
            try {
                await removeBirthday(serverId, userId);
                toast.success("Doğum günü kaldırıldı.");
            } catch {
                toast.error("Kaldırılamadı.");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Settings Card */}
            <div className="glass rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Yapılandırma</h2>

                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <Hash className="h-4 w-4 text-orange-400" />
                            Duyuru Kanalı
                        </label>
                        <ChannelSelect
                            serverId={serverId}
                            value={form.birthdayChannelId}
                            onChange={(v) => set("birthdayChannelId", v)}
                            types={[0]}
                            placeholder="Doğum günü duyuruları..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4 text-orange-400" />
                            Doğum Günü Rolü
                        </label>
                        <RoleSelect
                            serverId={serverId}
                            value={form.birthdayRoleId}
                            onChange={(v) => set("birthdayRoleId", v)}
                            placeholder="Gün boyunca verilecek rol..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <MessageSquare className="h-4 w-4 text-orange-400" />
                        Duyuru Mesajı
                    </label>
                    <p className="text-xs text-muted-foreground">Değişkenler: <code className="text-primary">{`{user}`}</code></p>
                    <Textarea
                        rows={3}
                        value={form.birthdayMessage}
                        onChange={(e) => set("birthdayMessage", e.target.value)}
                        placeholder="🎂 Bugün {user} doğum günü! Kutlu olsun!"
                        className="resize-none bg-white/[0.03]"
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isPending} className="px-8">
                        {isPending ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                </div>
            </div>

            {/* Birthday List */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Kayıtlı Doğum Günleri ({birthdays.length})
                    </h2>
                </div>

                {birthdays.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground/50">
                        <Cake className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Henüz kimse doğum gününü kaydetmemiş.</p>
                        <p className="text-xs mt-1">Kullanıcılar <code>/birthday set</code> komutuyla ekleyebilir.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {birthdays.map((b) => {
                            const now = new Date();
                            const thisYear = now.getFullYear();
                            let bday = new Date(thisYear, b.month - 1, b.day);
                            const today = new Date(thisYear, now.getMonth(), now.getDate());
                            if (bday < today) bday.setFullYear(thisYear + 1);
                            const daysLeft = Math.round((bday.getTime() - today.getTime()) / 86400000);

                            return (
                                <div key={b.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                            <Cake className="h-4 w-4 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium font-mono">{b.userId}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {b.day} {MONTH_NAMES[b.month]}
                                                {daysLeft === 0 ? " • 🎉 Bugün!" : ` • ${daysLeft} gün sonra`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemove(b.userId)}
                                        disabled={isRemoving}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
