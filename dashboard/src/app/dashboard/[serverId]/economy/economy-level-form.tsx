"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateEconomyLevelSettings } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Coins, Trophy, MessageSquare } from "lucide-react";
import { ChannelSelect } from "@/components/ui/channel-select";

export default function EconomyLevelForm({
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
                await updateEconomyLevelSettings(serverId, formData);
                toast.success("Ekonomi ve Seviye ayarları kaydedildi!");
            } catch (e) {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Ekonomi Ayarları */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" /> Ekonomi Ayarları
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Para Birimi Adı</label>
                        <Input
                            value={formData.currencyName}
                            onChange={(e: any) => setFormData({ ...formData, currencyName: e.target.value })}
                            placeholder="Örn: Okane"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Para Birimi Emojisi</label>
                        <Input
                            value={formData.currencyEmoji}
                            onChange={(e: any) => setFormData({ ...formData, currencyEmoji: e.target.value })}
                            placeholder="Örn: 💰"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Seviye Ayarları */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" /> Seviye Sistemi Ayarları
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Seviye Atlama Kanalı (Boş = Mesajın yazıldığı kanal)
                        </label>
                        <ChannelSelect
                            serverId={serverId}
                            value={formData.levelUpChannelId}
                            onChange={(v) => setFormData({ ...formData, levelUpChannelId: v })}
                            types={[0, 5]}
                            placeholder="Kanal seçin (boş = aynı kanal)"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Seviye Atlama Mesajı ({'{user}, {level}'})</label>
                        <Textarea
                            value={formData.levelUpMessage}
                            onChange={(e: any) => setFormData({ ...formData, levelUpMessage: e.target.value })}
                            placeholder="Tebrikler {user}! **{level}** seviyesine ulaştın! 🎉"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={isPending}>
                    {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
            </div>
        </div>
    );
}
