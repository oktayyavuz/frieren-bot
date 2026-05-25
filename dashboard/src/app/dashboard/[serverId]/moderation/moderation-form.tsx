"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, FileSearch, Lock, Zap, LinkIcon, MessageSquare } from "lucide-react";
import { ChannelSelect } from "@/components/ui/channel-select";
import { updateModSettings } from "./actions";

export default function ModerationForm({
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
                await updateModSettings(serverId, formData);
                toast.success("Moderasyon ayarları kaydedildi!");
            } catch (e) {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modül Toggle'ları */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Shield className="h-5 w-5 text-red-500" /> Moderasyon Modülü
                            </CardTitle>
                            <CardDescription>Ban, kick, warning gibi komutları aktifleştirir.</CardDescription>
                        </div>
                        <Switch checked={formData.moderationEnabled} onCheckedChange={(v) => set("moderationEnabled", v)} />
                    </CardHeader>
                </Card>

                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileSearch className="h-5 w-5 text-blue-500" /> Sistem Logları
                            </CardTitle>
                            <CardDescription>Tüm işlemleri kayıt altına alın.</CardDescription>
                        </div>
                        <Switch checked={formData.loggingEnabled} onCheckedChange={(v) => set("loggingEnabled", v)} />
                    </CardHeader>
                </Card>
            </div>

            {/* Log Kanalları */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Lock className="h-5 w-5 text-orange-500" /> Log Kanal Yapılandırması
                    </CardTitle>
                    <CardDescription>Botun kayıtları göndereceği kanalları seçin.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Moderasyon Log Kanalı</label>
                        <ChannelSelect
                            serverId={serverId}
                            value={formData.modLogChannel}
                            onChange={(v) => set("modLogChannel", v)}
                            types={[0]}
                            placeholder="Kanal seçin..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Mesaj Log Kanalı</label>
                        <ChannelSelect
                            serverId={serverId}
                            value={formData.messageLogChannel}
                            onChange={(v) => set("messageLogChannel", v)}
                            types={[0]}
                            placeholder="Silinen/Düzenlenen mesajlar"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Ses Log Kanalı</label>
                        <ChannelSelect
                            serverId={serverId}
                            value={formData.voiceLogChannel}
                            onChange={(v) => set("voiceLogChannel", v)}
                            types={[0]}
                            placeholder="Ses giriş-çıkışları"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Sunucu Log Kanalı</label>
                        <ChannelSelect
                            serverId={serverId}
                            value={formData.serverLogChannel}
                            onChange={(v) => set("serverLogChannel", v)}
                            types={[0]}
                            placeholder="Rol/Kanal değişiklikleri"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Hızlı Güvenlik */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" /> Hızlı Güvenlik Ayarları
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <LinkIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Link Koruması</p>
                                <p className="text-xs text-muted-foreground italic">Link paylaşımını engeller.</p>
                            </div>
                        </div>
                        <Switch checked={formData.antiLinkEnabled} onCheckedChange={(v) => set("antiLinkEnabled", v)} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Spam Koruması</p>
                                <p className="text-xs text-muted-foreground italic">Hızlı mesaj gönderimini engeller.</p>
                            </div>
                        </div>
                        <Switch checked={formData.antiSpamEnabled} onCheckedChange={(v) => set("antiSpamEnabled", v)} />
                    </div>
                </CardContent>
            </Card>

            {/* Spam Limitleri (Spam açıksa göster) */}
            {formData.antiSpamEnabled && (
                <Card className="border-orange-500/20 bg-orange-500/5 animate-in fade-in duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-orange-500" /> Spam Parametreleri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mesaj Limiti (adet)</label>
                            <Input
                                type="number"
                                min={2} max={30}
                                value={formData.antiSpamLimit}
                                onChange={(e) => set("antiSpamLimit", parseInt(e.target.value) || 5)}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Zaman Aralığı (ms)</label>
                            <Input
                                type="number"
                                min={1000} max={30000} step={500}
                                value={formData.antiSpamInterval}
                                onChange={(e) => set("antiSpamInterval", parseInt(e.target.value) || 5000)}
                                className="bg-background/50"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end gap-4">
                <Button size="lg" className="px-12 font-bold shadow-lg shadow-primary/20" onClick={handleSave} disabled={isPending}>
                    {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
            </div>
        </div>
    );
}
