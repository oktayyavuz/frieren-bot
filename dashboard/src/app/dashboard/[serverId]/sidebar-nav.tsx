"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Settings, Shield, ShieldAlert, Image as ImageIcon, MessageSquare,
    Coins, ListTree, Zap, LayoutDashboard, BellRing, Gift, Trophy,
    Cake, Star, BarChart2, Music2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IconMap: Record<string, any> = {
    Settings, Shield, ShieldAlert, ImageIcon, MessageSquare,
    Coins, ListTree, Zap, LayoutDashboard, BellRing, Gift, Trophy,
    Cake, Star, BarChart2, Music2,
};

export type NavGroup = {
    label: string;
    links: { name: string; href: string; icon: string }[];
};

export default function SidebarNav({ groups }: { groups: NavGroup[] }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-5">
            {groups.map((group) => (
                <div key={group.label}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-3 mb-2">
                        {group.label}
                    </p>
                    <div className="flex flex-col gap-0.5">
                        {group.links.map((link) => {
                            const Icon = IconMap[link.icon] || Settings;
                            const isActive = pathname === link.href;

                            return (
                                <Link key={link.href} href={link.href} className="relative group">
                                    {isActive && (
                                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[2px_0_8px_rgba(124,58,237,0.6)]" />
                                    )}
                                    <div className={cn(
                                        "flex items-center gap-3 h-10 px-3 rounded-xl text-sm transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}>
                                        <Icon className={cn(
                                            "h-4 w-4 shrink-0 transition-all duration-200",
                                            isActive ? "text-primary" : "group-hover:text-foreground"
                                        )} />
                                        <span className="truncate">{link.name}</span>
                                        {isActive && (
                                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
