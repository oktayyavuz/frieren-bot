"use client";

import { useEffect, useState } from "react";
import { Hash, Volume2, Megaphone, Loader2 } from "lucide-react";

interface Channel {
    id: string;
    name: string;
    type: number;
    parentId: string | null;
    position: number;
}

const ICON: Record<number, React.ReactNode> = {
    0: <Hash className="h-3 w-3 shrink-0 opacity-60" />,
    5: <Megaphone className="h-3 w-3 shrink-0 opacity-60" />,
    2: <Volume2 className="h-3 w-3 shrink-0 opacity-60" />,
    13: <Volume2 className="h-3 w-3 shrink-0 opacity-60" />,
};

interface ChannelSelectProps {
    serverId: string;
    value: string | null | undefined;
    onChange: (id: string | null) => void;
    placeholder?: string;
    types?: number[];
    includeCategories?: boolean;
    className?: string;
    disabled?: boolean;
}

export function ChannelSelect({
    serverId,
    value,
    onChange,
    placeholder = "Kanal seçin...",
    types,
    className = "",
    disabled = false,
}: ChannelSelectProps) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/bot/${serverId}/channels`)
            .then(r => r.json())
            .then((data: Channel[]) => {
                const filtered = types ? data.filter(c => types.includes(c.type)) : data;
                setChannels(filtered);
            })
            .catch(() => setChannels([]))
            .finally(() => setLoading(false));
    }, [serverId]);

    const baseClass =
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    if (loading) {
        return (
            <div className={`${baseClass} items-center gap-2 ${className}`}>
                <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                <span className="text-muted-foreground text-xs">Kanallar yükleniyor...</span>
            </div>
        );
    }

    return (
        <select
            value={value || ""}
            onChange={e => onChange(e.target.value || null)}
            className={`${baseClass} cursor-pointer ${className}`}
            disabled={disabled}
        >
            <option value="">{placeholder}</option>
            {channels.map(c => (
                <option key={c.id} value={c.id}>
                    {c.type === 0 ? "#" : c.type === 5 ? "📢" : "🔊"} {c.name}
                </option>
            ))}
        </select>
    );
}
