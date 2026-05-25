"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChannelSelect } from "@/components/ui/channel-select";
import { toast } from "sonner";
import { Bell, MessageSquare } from "lucide-react";
import { updateWelcomeSettings } from "./actions";

export default function WelcomeForm({
    serverId,
    initialChannelId,
    initialMessage,
    initialGoodbyeChannelId,
    initialGoodbyeMessage,
}: {
    serverId: string;
    initialChannelId: string;
    initialMessage: string;
    initialGoodbyeChannelId?: string;
    initialGoodbyeMessage?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [channelId, setChannelId] = useState(initialChannelId || "");
    const [message, setMessage] = useState(initialMessage || "");
    const [goodbyeChannelId, setGoodbyeChannelId] = useState(initialGoodbyeChannelId || "");
    const [goodbyeMessage, setGoodbyeMessage] = useState(initialGoodbyeMessage || "");

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateWelcomeSettings(serverId, {
                    channelId: channelId || null,
                    message,
                    goodbyeChannelId: goodbyeChannelId || null,
                    goodbyeMessage,
                });
                toast.success("Karşılama ayarları kaydedildi!");
            } catch (e) {
                toast.error("Hata oluştu.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Karşılama */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-green-500" /> Karşılama Mesajı
                        </CardTitle>
                        <CardDescription>
                            Üye katıldığında mesaj gönderilecek kanal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Karşılama Kanalı</label>
                            <ChannelSelect
                                serverId={serverId}
                                value={channelId}
                                onChange={(v) => setChannelId(v || "")}
                                types={[0, 5]}
                                placeholder="Kanal seçin (devre dışı için boş)"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Mesaj{" "}
                                <span className="text-xs text-muted-foreground font-normal">
                                    ({`{user}`}, {`{server}`}, {`{memberCount}`})
                                </span>
                            </label>
                            <Textarea
                                rows={3}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Hoş geldin {user}!"
                                className="bg-background/50 resize-none"
                            />
                        </div>
                        {message && (
                            <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Önizleme</p>
                                <p className="text-sm">
                                    {message.replace(/\{user\}/g, "@Kullanıcı").replace(/\{server\}/g, "Sunucu").replace(/\{memberCount\}/g, "100")}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Güle Güle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-orange-500" /> Güle Güle Mesajı
                        </CardTitle>
                        <CardDescription>
                            Üye ayrıldığında mesaj gönderilecek kanal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Güle Güle Kanalı</label>
                            <ChannelSelect
                                serverId={serverId}
                                value={goodbyeChannelId}
                                onChange={(v) => setGoodbyeChannelId(v || "")}
                                types={[0, 5]}
                                placeholder="Kanal seçin (devre dışı için boş)"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Mesaj{" "}
                                <span className="text-xs text-muted-foreground font-normal">
                                    ({`{user}`}, {`{server}`})
                                </span>
                            </label>
                            <Textarea
                                rows={3}
                                value={goodbyeMessage}
                                onChange={e => setGoodbyeMessage(e.target.value)}
                                placeholder="Güle güle {user}!"
                                className="bg-background/50 resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={isPending} className="px-12 font-bold">
                    {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
            </div>
        </div>
    );
}
