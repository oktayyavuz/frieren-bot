import { getTicketFullDetails } from "../../actions";
import TranscriptViewer from "@/components/tickets/transcript-viewer";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: {
        serverId: string;
        ticketId: string;
    };
}

export default async function TranscriptPage({ params }: PageProps) {
    const id = parseInt(params.ticketId);
    if (isNaN(id)) return notFound();

    const ticket = await getTicketFullDetails(id);

    if (!ticket || ticket.guildId !== params.serverId) {
        return notFound();
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href={`/dashboard/${params.serverId}/tickets`}>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white">
                                <ChevronLeft className="h-4 w-4" />
                                Geri Dön
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent">
                                Transkript Detayları
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Destek talebinin tüm konuşma geçmişi ve ekleri.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 glass border-white/10">
                        <Share2 className="h-4 w-4" />
                        Paylaş
                    </Button>
                    <Link href={`/dashboard/${params.serverId}/tickets`}>
                        <Button className="bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20">
                            Listeye Dön
                        </Button>
                    </Link>
                </div>
            </div>

            <TranscriptViewer 
                transcript={ticket.transcript}
                ticketId={ticket.id}
                userName={ticket.userTag || ticket.userId} 
                closedAt={ticket.closedAt}
            />
        </div>
    );
}
