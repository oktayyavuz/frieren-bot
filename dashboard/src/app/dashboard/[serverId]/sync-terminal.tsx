"use client";

import { useEffect, useState, useRef } from "react";
import { 
    Terminal, 
    Maximize2, 
    Minimize2, 
    X, 
    Trash2, 
    Zap, 
    Loader2, 
    ChevronDown, 
    ChevronUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSyncLogs, clearSyncLogs } from "./sync-actions";

interface SyncLog {
    id: number;
    module: string;
    message: string;
    level: string;
    timestamp: Date;
}

export default function SyncTerminal({ serverId }: { serverId: string }) {
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [state, setState] = useState<"minimized" | "mini" | "full">("minimized");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    
    useEffect(() => {
        const fetchLogs = async () => {
            const data = await getSyncLogs(serverId);
            
            setLogs(data);
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, [serverId]);

    
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, state]);

    const handleClear = async () => {
        setLoading(true);
        await clearSyncLogs(serverId);
        setLogs([]);
        setLoading(false);
    };

    if (state === "minimized") {
        return (
            <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-4">
                <Button 
                    onClick={() => setState("mini")}
                    className="rounded-2xl h-12 px-6 bg-[#09090b] border border-primary/20 hover:border-primary/50 shadow-[0_10px_40px_rgba(124,58,237,0.2)] group"
                >
                    <Zap className="h-4 w-4 mr-2 text-primary animate-pulse" />
                    <span className="text-xs font-bold">Sync Terminal</span>
                    <div className="ml-3 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn(
            "fixed z-[100] transition-all duration-500 ease-in-out overflow-hidden shadow-2xl",
            state === "full" 
                ? "inset-4 rounded-[2.5rem] bg-black/90 backdrop-blur-2xl border-2 border-primary/20" 
                : "bottom-6 right-6 w-[450px] h-[500px] rounded-[2rem] bg-[#09090b]/95 backdrop-blur-xl border border-white/10"
        )}>
            {/* Terminal Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold tracking-widest uppercase opacity-80">Magic Terminal v1.0</span>
                    {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleClear} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setState(state === "full" ? "mini" : "full")} className="h-8 w-8 rounded-lg">
                        {state === "full" ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setState("minimized")} className="h-8 w-8 rounded-lg">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Terminal Content */}
            <div 
                ref={scrollRef}
                className="p-6 h-[calc(100%-3.5rem)] overflow-y-auto space-y-3 font-mono text-[11px] lg:text-[13px] scroll-smooth"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
                        <Zap className="h-8 w-8 animate-pulse" />
                        <p>Henüz bir işlem gerçekleştirilmedi.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-muted-foreground shrink-0 tabular-nums">
                                [{new Date(log.timestamp).toLocaleTimeString("tr-TR")}]
                            </span>
                            <span className={cn(
                                "font-bold shrink-0 w-20",
                                log.level === "error" ? "text-destructive" : "text-primary"
                            )}>
                                [{log.module.toUpperCase()}]
                            </span>
                            <span className={cn(
                                "flex-1 leading-relaxed",
                                log.level === "success" ? "text-emerald-400" : 
                                log.level === "error" ? "text-red-400" : "text-blue-200"
                            )}>
                                {log.message}
                            </span>
                        </div>
                    )).reverse() 
                )}
            </div>

            {/* Matrix Background Effect for Full Screen */}
            {state === "full" && (
                <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            )}
        </div>
    );
}
