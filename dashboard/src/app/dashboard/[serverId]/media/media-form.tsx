"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateMediaSettings } from "./actions";
import Image from "next/image";

export default function MediaForm({
    serverId,
    initialHelp,
    initialEconomy,
}: {
    serverId: string;
    initialHelp: string;
    initialEconomy: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [helpImage, setHelpImage] = useState(initialHelp);
    const [economyImage, setEconomyImage] = useState(initialEconomy);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        setIsSaved(false);
        startTransition(async () => {
            try {
                await updateMediaSettings(serverId, {
                    helpImage: helpImage.trim() === "" ? null : helpImage.trim(),
                    economyImage: economyImage.trim() === "" ? null : economyImage.trim(),
                });
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            } catch (e) {
                console.error(e);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Yardım Menüsü Cihazı (GIF/Resim URL)</label>
                <div className="flex gap-4">
                    <input
                        type="url"
                        value={helpImage}
                        onChange={(e) => setHelpImage(e.target.value)}
                        placeholder="https://media.giphy.com/..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    {helpImage && (
                        <div className="relative h-10 w-16 overflow-hidden rounded-md border">
                            <Image src={helpImage} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium">Ekonomi Menüleri (GIF/Resim URL)</label>
                <div className="flex gap-4">
                    <input
                        type="url"
                        value={economyImage}
                        onChange={(e) => setEconomyImage(e.target.value)}
                        placeholder="https://media.giphy.com/..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    {economyImage && (
                        <div className="relative h-10 w-16 overflow-hidden rounded-md border">
                            <Image src={economyImage} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                    )}
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={isPending}
            >
                {isPending ? "Kaydediliyor..." : isSaved ? "Kaydedildi" : "Ayarları Kaydet"}
            </Button>
        </div>
    );
}
