"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toggleAutoMod, updateAutoModSettings } from "../actions";

export default function AutoModForm({
    serverId,
    initialEnabled,
    initialSpam,
    initialCaps,
}: {
    serverId: string;
    initialEnabled: boolean;
    initialSpam: number;
    initialCaps: number;
}) {
    const [isPending, startTransition] = useTransition();
    const [enabled, setEnabled] = useState(initialEnabled);

    
    const [spam, setSpam] = useState(initialSpam);
    const [caps, setCaps] = useState(initialCaps);
    const [isSaved, setIsSaved] = useState(false);

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        startTransition(async () => {
            try {
                await toggleAutoMod(serverId, checked);
            } catch (e) {
                setEnabled(!checked); 
            }
        });
    };

    const handleSave = () => {
        setIsSaved(false);
        startTransition(async () => {
            try {
                await updateAutoModSettings(serverId, { spamLimit: spam, capsPercent: caps });
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            } catch (e) {
                console.error(e);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <label className="text-base font-medium">Oto-Mod Durumu</label>
                    <p className="text-sm text-muted-foreground">
                        Açıldığında bot mesaj içeriklerini denetlemeye başlar.
                    </p>
                </div>
                <Switch
                    checked={enabled}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                />
            </div>

            {enabled && (
                <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Spam Limiti (5 saniyede max mesaj)</label>
                        <input
                            type="number"
                            value={spam}
                            onChange={(e) => setSpam(Number(e.target.value))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            min={1}
                            max={20}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Caps-Lock Sınırı (% oran)</label>
                        <input
                            type="number"
                            value={caps}
                            onChange={(e) => setCaps(Number(e.target.value))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            min={10}
                            max={100}
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? "Kaydediliyor..." : isSaved ? "Kaydedildi" : "Ayarları Kaydet"}
                    </Button>
                </div>
            )}
        </div>
    );
}
