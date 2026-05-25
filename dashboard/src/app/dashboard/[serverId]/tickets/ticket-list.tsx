"use client";

import { useState } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileText, Calendar, User, Tag, ExternalLink } from "lucide-react";
import { getTicketFullDetails } from "./actions";
import TranscriptViewer from "@/components/tickets/transcript-viewer";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TicketListProps {
    tickets: any[];
}

export default function TicketList({ tickets }: TicketListProps) {
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const serverId = pathname.split('/')[2];

    const handleViewTranscript = async (ticket: any) => {
        setSelectedTicket(ticket);
        setIsLoading(true);
        const data = await getTicketFullDetails(ticket.id);
        setTicketDetails(data);
        setIsLoading(false);
    };

    return (
        <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-bold">Kullanıcı</TableHead>
                        <TableHead className="font-bold">Kategori</TableHead>
                        <TableHead className="font-bold text-center">Durum</TableHead>
                        <TableHead className="font-bold">Tarih</TableHead>
                        <TableHead className="text-right font-bold w-[100px]">İşlem</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Henüz bilet kaydı bulunmuyor.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tickets.map((ticket) => (
                            <TableRow key={ticket.id} className="hover:bg-primary/5 transition-colors group">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                            {(ticket.userTag || ticket.userId).slice(-2)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{ticket.userTag || "Bilinmiyor"}</span>
                                            <span className="text-[10px] text-muted-foreground">{ticket.userId}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5">
                                        {ticket.category?.name || "Genel"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge 
                                        variant={ticket.status === "open" ? "default" : "secondary"}
                                        className={ticket.status === "open" ? "bg-green-500 hover:bg-green-600" : "bg-muted-foreground/20 text-muted-foreground"}
                                    >
                                        {ticket.status === "open" ? "Açık" : "Kapalı"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(ticket.createdAt).toLocaleDateString("tr-TR")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-all"
                                        onClick={() => handleViewTranscript(ticket)}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={!!selectedTicket} onOpenChange={() => {
                setSelectedTicket(null);
                setTicketDetails(null);
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 border-white/10 bg-[#09090b]/90 backdrop-blur-2xl overflow-hidden shadow-2xl rounded-[2rem]">
                    <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.03]">
                        <div className="flex items-center justify-between w-full">
                            <div className="space-y-1">
                                <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                                    <Tag className="h-5 w-5 text-primary" />
                                    Bilet Dökümü
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-4 mt-2 font-medium">
                                     <div className="flex items-center gap-1"><User className="h-3 w-3" /> {selectedTicket?.userId}</div>
                                     <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedTicket && new Date(selectedTicket.createdAt).toLocaleString("tr-TR")}</div>
                                </DialogDescription>
                            </div>
                            {selectedTicket && (
                                <Link href={`/dashboard/${serverId}/tickets/${selectedTicket.id}/transcript`}>
                                    <Button variant="outline" size="sm" className="gap-2 glass border-white/10">
                                        <ExternalLink className="h-4 w-4" />
                                        Tam Ekran
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden p-6 py-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[500px]">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ScrollArea className="h-[500px]">
                                <TranscriptViewer 
                                    transcript={ticketDetails?.transcript} 
                                    ticketId={selectedTicket?.id}
                                    userName={selectedTicket?.userId}
                                    closedAt={selectedTicket?.closedAt}
                                />
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
