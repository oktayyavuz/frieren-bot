"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateGeneralSettings } from "../settings/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldAlert, Ban, MessageSquareX, Link as LinkIcon, Users, Siren } from "lucide-react";

export default function SecurityForm({
    serverId,
    initialData,
}: {
    serverId: string;
    initialData: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState(initialData);

    const handleToggle = (key: string, checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, [key]: checked }));
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateGeneralSettings(serverId, formData);
                toast.success("Güvenlik ayarları kaydedildi!");
            } catch (e) {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* 1. Global Oto-Mod Toggle */}
            <Card className={formData.automodEnabled ? "border-primary/50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            Oto-Moderasyon Anahtarı
                        </CardTitle>
                        <CardDescription>Tüm otomatik koruma sistemlerini buradan açıp kapatabilirsiniz.</CardDescription>
                    </div>
                    <Switch
                        checked={formData.automodEnabled}
                        onCheckedChange={(checked) => handleToggle("automodEnabled", checked)}
                    />
                </CardHeader>
            </Card>

            {formData.automodEnabled && (
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Küfür Koruması */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Ban className="h-4 w-4" /> Küfür Koruması
                            </CardTitle>
                            <Switch
                                checked={formData.antiSwearEnabled}
                                onCheckedChange={(checked) => handleToggle("antiSwearEnabled", checked)}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-xs font-medium">Özel Yasaklı Kelimeler (Virgülle ayırın)</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.antiSwearWords}
                                    onChange={(e: any) => setFormData({ ...formData, antiSwearWords: e.target.value })}
                                    placeholder="kelime1, kelime2..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Spam Koruması */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <MessageSquareX className="h-4 w-4" /> Spam Koruması
                            </CardTitle>
                            <Switch
                                checked={formData.antiSpamEnabled}
                                onCheckedChange={(checked) => handleToggle("antiSpamEnabled", checked)}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-xs font-medium">Mesaj Limiti</label>
                                    <Input
                                        type="number"
                                        value={formData.antiSpamLimit}
                                        onChange={(e) => setFormData({ ...formData, antiSpamLimit: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-medium">Süre (ms)</label>
                                    <Input
                                        type="number"
                                        value={formData.antiSpamInterval}
                                        onChange={(e) => setFormData({ ...formData, antiSpamInterval: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Link Koruması */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" /> Link Koruması
                            </CardTitle>
                            <Switch
                                checked={formData.antiLinkEnabled}
                                onCheckedChange={(checked) => handleToggle("antiLinkEnabled", checked)}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <label className="text-xs font-medium">İzinli Domainler (Virgülle ayırın)</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.antiLinkWhitelist}
                                    onChange={(e: any) => setFormData({ ...formData, antiLinkWhitelist: e.target.value })}
                                    placeholder="google.com, discord.gg..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Büyük Harf Koruması */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Users className="h-4 w-4" /> Caps Koruması
                            </CardTitle>
                            <Switch
                                checked={formData.antiCapsEnabled}
                                onCheckedChange={(checked) => handleToggle("antiCapsEnabled", checked)}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-xs font-medium">Yüzde (%)</label>
                                    <Input
                                        type="number"
                                        value={formData.antiCapsPercent}
                                        onChange={(e: any) => setFormData({ ...formData, antiCapsPercent: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-medium">Min. Uzunluk</label>
                                    <Input
                                        type="number"
                                        value={formData.antiCapsMinLength}
                                        onChange={(e: any) => setFormData({ ...formData, antiCapsMinLength: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Anti-Raid Bölümü */}
            <Card className={formData.antiRaidEnabled ? "border-destructive/50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Siren className="h-5 w-5 text-destructive" />
                            Anti-Raid Sistemi
                        </CardTitle>
                        <CardDescription>Aynı anda sunucuya giren çok sayıda hesabı engeller.</CardDescription>
                    </div>
                    <Switch
                        checked={formData.antiRaidEnabled}
                        onCheckedChange={(checked) => handleToggle("antiRaidEnabled", checked)}
                    />
                </CardHeader>
                {formData.antiRaidEnabled && (
                    <CardContent className="space-y-4 pt-4 border-t">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Giriş Limiti</label>
                                <Input
                                    type="number"
                                    value={formData.antiRaidLimit}
                                    onChange={(e: any) => setFormData({ ...formData, antiRaidLimit: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Süre (ms)</label>
                                <Input
                                    type="number"
                                    value={formData.antiRaidInterval}
                                    onChange={(e: any) => setFormData({ ...formData, antiRaidInterval: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">İşlem</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.antiRaidAction}
                                    onChange={(e: any) => setFormData({ ...formData, antiRaidAction: e.target.value })}
                                >
                                    <option value="kick">At (Kick)</option>
                                    <option value="ban">Yasakla (Ban)</option>
                                    <option value="timeout">Sustur (Timeout)</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={isPending}>
                    {isPending ? "Kaydediliyor..." : "Güvenlik Ayarlarını Kaydet"}
                </Button>
            </div>
        </div>
    );
}
