"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Role {
    id: string;
    name: string;
    color: number;
    managed: boolean;
    position: number;
}

function hexColor(decimal: number): string {
    if (!decimal) return "#888888";
    return `#${decimal.toString(16).padStart(6, "0")}`;
}

interface RoleSelectProps {
    serverId: string;
    value: string | null | undefined;
    onChange: (id: string | null) => void;
    placeholder?: string;
    excludeManaged?: boolean;
    className?: string;
    disabled?: boolean;
}

export function RoleSelect({
    serverId,
    value,
    onChange,
    placeholder = "Rol seçin...",
    excludeManaged = true,
    className = "",
    disabled = false,
}: RoleSelectProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/bot/${serverId}/roles`)
            .then(r => r.json())
            .then((data: Role[]) => {
                const filtered = excludeManaged ? data.filter(r => !r.managed) : data;
                setRoles(filtered);
            })
            .catch(() => setRoles([]))
            .finally(() => setLoading(false));
    }, [serverId]);

    const baseClass =
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    if (loading) {
        return (
            <div className={`${baseClass} items-center gap-2 ${className}`}>
                <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                <span className="text-muted-foreground text-xs">Roller yükleniyor...</span>
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
            {roles.map(r => (
                <option key={r.id} value={r.id}>
                    @{r.name}
                </option>
            ))}
        </select>
    );
}
