"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateSystemSettings } from "./actions";
import { syncTicketSystem } from "../sync-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Mic, BarChart3, UserPlus, Ticket } from "lucide-react";
import { ChannelSelect } from "@/components/ui/channel-select";

export default function SystemsForm({
    serverId,
    initialData,
}: {
    serverId: string;
    initialData: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState(initialData);

    const set = (key: string, value: any) => setFormData((p: any) => ({ ...p, [key]: value }));

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateSystemSettings(serverId, formData);
                toast.success("Sistem ayarları kaydedildi!");
            } catch (e) {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-8 md:grid-cols-2">
                {/* Özel Oda */}
                <Card className={formData.privateRoomEnabled ? "border-primary/50 shadow-md shadow-primary/5" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Mic className="h-5 w-5 text-primary" /> Özel Oda Sistemi
                            </CardTitle>
                            <CardDescription>Kullanıcıların kendi sesli odalarını oluşturmasını sağlar.</CardDescription>
                        </div>
                        <Switch checked={formData.privateRoomEnabled} onCheckedChange={(v) => set("privateRoomEnabled", v)} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Giriş Ses Kanalı (Join-to-Create)</label>
                            <ChannelSelect
                                serverId={serverId}
                                value={formData.privateRoomChannelId}
                                onChange={(v) => set("privateRoomChannelId", v)}
                                types={[2]}
                                placeholder="Ses kanalı seçin..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Oda Kategorisi</label>
                            <ChannelSelect
                                serverId={serverId}
                                value={formData.privateRoomCategoryId}
                                onChange={(v) => set("privateRoomCategoryId", v)}
                                types={[4]}
                                placeholder="Kategori seçin..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* İstatistik Kanalları */}
                <Card className={formData.statsEnabled ? "border-secondary/50 shadow-md shadow-secondary/5" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-secondary-foreground" /> İstatistik Kanalları
                            </CardTitle>
                            <CardDescription>Üye sayısını kanal adında gösterir (her dakika güncellenir).</CardDescription>
                        </div>
                        <Switch checked={formData.statsEnabled} onCheckedChange={(v) => set("statsEnabled", v)} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">İstatistik Kategorisi</label>
                            <ChannelSelect
                                serverId={serverId}
                                value={formData.statsCategoryId}
                                onChange={(v) => set("statsCategoryId", v)}
                                types={[4]}
                                placeholder="Kategori seçin..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Otomatik Roller */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-green-500" /> Otomatik Roller
                    </CardTitle>
                    <CardDescription>Yeni katılan üyelere otomatik olarak bu roller verilir. Her satıra veya virgülle bir Rol ID girin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={Array.isArray(formData.autoRoles)
                            ? formData.autoRoles.join(", ")
                            : (formData.autoRoles || "")}
                        onChange={(e) => set("autoRoles", e.target.value)}
                        placeholder="Örn: 123456789, 987654321"
                        className="bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Rol ID'lerini Discord&apos;da Geliştirici Modunu açarak alabilirsiniz.
                    </p>
                </CardContent>
            </Card>

            {/* Ticket Sistemi */}
            <Card className={formData.ticketEnabled ? "border-primary/20 bg-primary/5" : "bg-muted/10 opacity-60"}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" /> Ticket Sistemi
                        </CardTitle>
                        <CardDescription>Aktif edildiğinde bot otomatik bilet kategorisi ve giriş kanalı kurar.</CardDescription>
                    </div>
                    <Switch checked={formData.ticketEnabled} onCheckedChange={(v) => set("ticketEnabled", v)} />
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full md:w-auto"
                        onClick={() => {
                            startTransition(async () => {
                                await syncTicketSystem(serverId);
                                toast.success("Ticket sistemi tetiklendi!");
                            });
                        }}
                        disabled={isPending || !formData.ticketEnabled}
                    >
                        Şimdi Senkronize Et
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button size="lg" className="px-12 font-bold shadow-lg shadow-primary/20" onClick={handleSave} disabled={isPending}>
                    {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
            </div>
        </div>
    );
}
