"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavBreadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter((item) => item !== "");

    
    const segmentMap: Record<string, string> = {
        dashboard: "Sunucular",
        settings: "Genel Ayarlar",
        modules: "Güvenlik",
        welcome: "Karşılama",
        economy: "Ekonomi",
        systems: "Sistemler",
        media: "Medya",
    };

    return (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link 
                href="/dashboard" 
                className="hover:text-primary transition-colors flex items-center gap-1"
            >
                <Home className="h-4 w-4" />
            </Link>
            
            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;
                const name = segmentMap[segment] || segment;

                
                const isGuid = /^\d{17,20}$/.test(segment);
                if (isGuid && segments[index-1] === 'dashboard') return null;

                return (
                    <div key={href} className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4" />
                        <Link
                            href={href}
                            className={cn(
                                "capitalize transition-colors",
                                isLast ? "text-foreground font-semibold pointer-events-none" : "hover:text-primary"
                            )}
                        >
                            {name}
                        </Link>
                    </div>
                );
            })}
        </nav>
    );
}
