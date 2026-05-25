"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateWelcomeLogSettings } from "./actions";
import { setupLogChannels } from "../sync-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, LogOut, FileText, Shield, Mic, Layout } from "lucide-react";
import { ChannelSelect } from "@/components/ui/channel-select";

export default function WelcomeLogForm({
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
                await updateWelcomeLogSettings(serverId, formData);
                toast.success("Ayarlar kaydedildi!");
            } catch (e) {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-8 md:grid-cols-2">
                {/* Hoş Geldin Mesajı */}
                <Card className={formData.welcomeEnabled ? "border-primary/50 shadow-md shadow-primary/5" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" /> Hoş Geldin
                            </CardTitle>
                        </div>
                        <Switch
                            checked={formData.welcomeEnabled}
                            onCheckedChange={(v) => set("welcomeEnabled", v)}
                        />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Karşılama Kanalı</label>
                            <ChannelSelect
                                serverId={serverId}
                                value={formData.welcomeChannelId}
                                onChange={(v) => set("welcomeChannelId", v)}
                                types={[0, 5]}
                                placeholder="Kanal seçin..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground text-xs">
                                Değişkenler: {'{user}, {server}, {memberCount}'}
                            </label>
                            <Textarea
                                value={formData.welcomeMessage}
                                onChange={(e) => set("welcomeMessage", e.target.value)}
                                placeholder="Hoş geldin {user}!"
                                className="bg-background/50 resize-none"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Güle Güle Mesajı */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <LogOut className="h-5 w-5 text-destructive" /> Güle Güle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Güle Güle Kanalı</label>
                            <ChannelSelect
                                serverId={serverId}
                                value={formData.goodbyeChannelId}
                                onChange={(v) => set("goodbyeChannelId", v)}
                                types={[0, 5]}
                                placeholder="Kanal seçin..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mesaj</label>
                            <Textarea
                                value={formData.goodbyeMessage}
                                onChange={(e) => set("goodbyeMessage", e.target.value)}
                                placeholder="Güle güle {user}!"
                                className="bg-background/50 resize-none"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Log Kanalları */}
            <Card className={formData.loggingEnabled ? "border-blue-500/20 shadow-md shadow-blue-500/5" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" /> Loglama Modülü
                        </CardTitle>
                        <CardDescription>Sunucu olaylarının hangi kanallara kayıt edileceğini seçin.</CardDescription>
                    </div>
                    <Switch
                        checked={formData.loggingEnabled}
                        onCheckedChange={(v) => set("loggingEnabled", v)}
                    />
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" /> Mesaj Log Kanalı
                        </label>
                        <ChannelSelect serverId={serverId} value={formData.messageLogChannel} onChange={(v) => set("messageLogChannel", v)} types={[0]} placeholder="Kanal seçin..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" /> Moderasyon Log Kanalı
                        </label>
                        <ChannelSelect serverId={serverId} value={formData.modLogChannel} onChange={(v) => set("modLogChannel", v)} types={[0]} placeholder="Kanal seçin..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Mic className="h-4 w-4" /> Ses Log Kanalı
                        </label>
                        <ChannelSelect serverId={serverId} value={formData.voiceLogChannel} onChange={(v) => set("voiceLogChannel", v)} types={[0]} placeholder="Kanal seçin..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Layout className="h-4 w-4" /> Sunucu Log Kanalı
                        </label>
                        <ChannelSelect serverId={serverId} value={formData.serverLogChannel} onChange={(v) => set("serverLogChannel", v)} types={[0]} placeholder="Kanal seçin..." />
                    </div>
                    <div className="md:col-span-2 pt-2">
                        <Button
                            variant="outline"
                            className="w-full font-semibold border-primary/20 hover:bg-primary/5"
                            onClick={() => {
                                startTransition(async () => {
                                    await setupLogChannels(serverId);
                                    toast.success("Log kanalları otomatik oluşturuldu!");
                                    setTimeout(() => window.location.reload(), 1000);
                                });
                            }}
                            disabled={isPending || !formData.loggingEnabled}
                        >
                            Log Kanallarını Otomatik Kur
                        </Button>
                    </div>
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
