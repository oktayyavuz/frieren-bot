"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Award, MessageSquare, Zap, ListChecks } from "lucide-react";
import { ChannelSelect } from "@/components/ui/channel-select";
import { updateLevelingSettings } from "./actions";

export default function LevelingForm({
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
                await updateLevelingSettings(serverId, formData);
                toast.success("Seviye ayarları kaydedildi!");
            } catch (e) {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-8 md:grid-cols-2">
                {/* Modül Durumu */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" /> Modül Durumu
                            </CardTitle>
                            <CardDescription>Seviye sistemini tamamen açın veya kapatın.</CardDescription>
                        </div>
                        <Switch checked={formData.levelingEnabled} onCheckedChange={(v) => set("levelingEnabled", v)} />
                    </CardHeader>
                </Card>

                {/* Bildirim Kanalı */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-500" /> Bildirim Kanalı
                        </CardTitle>
                        <CardDescription>Seviye atlama mesajının gönderileceği kanal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChannelSelect
                            serverId={serverId}
                            value={formData.levelUpChannelId}
                            onChange={(v) => set("levelUpChannelId", v)}
                            types={[0, 5]}
                            placeholder="Boş = aynı kanalda bildir"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Seviye Atlama Mesajı */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-500" /> Seviye Atlama Mesajı
                    </CardTitle>
                    <CardDescription>
                        Değişkenler: <code className="text-primary">{`{user}`}</code>, <code className="text-primary">{`{level}`}</code>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        rows={4}
                        placeholder="Tebrikler {user}! {level} oldun!"
                        value={formData.levelUpMessage || ""}
                        onChange={(e) => set("levelUpMessage", e.target.value)}
                        className="bg-background/50 resize-none"
                    />
                    {formData.levelUpMessage && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Önizleme</p>
                            <p className="text-sm">
                                {formData.levelUpMessage
                                    .replace(/\{user\}/g, "@Kullanıcı")
                                    .replace(/\{level\}/g, "10")}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Seviye Ödülleri */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-green-500" /> Seviye Ödülleri
                    </CardTitle>
                    <CardDescription>Bot komutlarıyla (<code>/level-rewards</code>) ayarlanan mevcut ödüller.</CardDescription>
                </CardHeader>
                <CardContent>
                    {formData.levelRewards?.length > 0 ? (
                        <div className="grid gap-2">
                            {formData.levelRewards.map((reward: any) => (
                                <div key={reward.id} className="flex items-center justify-between p-3 rounded-md bg-muted/20 border border-muted">
                                    <span className="font-semibold text-primary">Seviye {reward.level}</span>
                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Rol: {reward.roleId}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4 italic">Henüz ödül ayarlanmamış.</p>
                    )}
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
