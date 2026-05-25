import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
    User, 
    ShieldCheck, 
    FileText, 
    Download,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

interface Embed {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    timestamp?: string;
    footer?: { text: string; iconURL?: string } | null;
    image?: { url: string } | null;
    thumbnail?: { url: string } | null;
    author?: { name: string; iconURL?: string; url?: string } | null;
    fields: EmbedField[];
}

interface Message {
    id: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    timestamp: string;
    isStaff: boolean;
    attachments: Array<{
        name: string;
        url: string;
        contentType?: string;
        size?: number;
    }>;
    embeds?: Embed[];
}

interface TranscriptViewerProps {
    transcript: string | null;
    ticketId: number;
    userName: string;
    closedAt?: Date | null;
}

const parseMarkdown = (text: string) => {
    if (!text) return null;
    
    
    let content = text.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1 rounded font-mono text-xs">$1</code>');
    
    
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    
    content = content.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    
    
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>');

    return <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />;
};

const DiscordEmbed = ({ embed }: { embed: Embed }) => {
    
    const colorHex = embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#2f3136';

    return (
        <div 
            className="relative flex flex-col mt-2 max-w-[520px] rounded border-l-4 bg-[#2f3136]/50 shadow-sm overflow-hidden"
            style={{ borderLeftColor: colorHex }}
        >
            <div className="p-3 pl-4 pr-16"> {/* Thumbnail için sağda boşluk bırak */}
                {embed.author && (
                    <div className="flex items-center gap-2 mb-2">
                        {embed.author.iconURL && (
                            <img src={embed.author.iconURL} alt="" className="w-5 h-5 rounded-full" />
                        )}
                        {embed.author.url ? (
                            <a href={embed.author.url} target="_blank" className="text-sm font-semibold hover:underline text-white">
                                {embed.author.name}
                            </a>
                        ) : (
                            <span className="text-sm font-semibold text-white">{embed.author.name}</span>
                        )}
                    </div>
                )}

                {embed.title && (
                    <div className="mb-2">
                        {embed.url ? (
                            <a href={embed.url} target="_blank" className="text-base font-bold text-[#00a8fc] hover:underline">
                                {embed.title}
                            </a>
                        ) : (
                            <span className="text-base font-bold text-white">{embed.title}</span>
                        )}
                    </div>
                )}

                {embed.description && (
                    <div className="text-sm text-[#dcddde] mb-3 leading-relaxed">
                        {parseMarkdown(embed.description)}
                    </div>
                )}

                {embed.fields && embed.fields.length > 0 && (
                    <div className="flex flex-wrap gap-y-3 gap-x-2 mb-3">
                        {embed.fields.map((field, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "flex flex-col min-w-[120px]",
                                    field.inline ? "flex-[1_1_30%]" : "w-full"
                                )}
                            >
                                <span className="text-xs font-bold text-white mb-0.5">{field.name}</span>
                                <span className="text-xs text-[#dcddde]">
                                    {parseMarkdown(field.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {embed.image && (
                    <div className="mt-3 rounded-md overflow-hidden border border-white/5 bg-black/20">
                        <img 
                            src={embed.image.url} 
                            alt="" 
                            className="max-w-full h-auto"
                            loading="lazy"
                        />
                    </div>
                )}

                {embed.footer && (
                    <div className="flex items-center gap-2 mt-3 pt-2">
                        {embed.footer.iconURL && (
                            <img src={embed.footer.iconURL} alt="" className="w-4 h-4 rounded-full" />
                        )}
                        <span className="text-[10px] text-[#72767d]">
                            {embed.footer.text} 
                            {embed.timestamp && ` • ${format(new Date(embed.timestamp), 'HH:mm', { locale: tr })}`}
                        </span>
                    </div>
                )}
            </div>
            
            {embed.thumbnail && (
                <div className="absolute top-3 right-3">
                    <img 
                        src={embed.thumbnail.url} 
                        alt="" 
                        className="w-16 h-16 rounded-md object-cover border border-white/5" 
                    />
                </div>
            )}
        </div>
    );
};

export default function TranscriptViewer({ transcript, ticketId, userName, closedAt }: TranscriptViewerProps) {
    if (!transcript) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-500">
                    <FileText className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold">Transkript Bulunamadı</h3>
                <p className="text-muted-foreground max-w-xs">Bu destek talebi için henüz bir kayıt oluşturulmamış.</p>
            </div>
        );
    }

    let messages: Message[] = [];
    try {
        messages = JSON.parse(transcript);
    } catch (e) {
        
        return (
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground leading-relaxed">
                    {transcript}
                </pre>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Info */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Ticket ID</span>
                    </div>
                    <p className="text-xl font-bold">#{ticketId}</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Kullanıcı</span>
                    </div>
                    <p className="text-xl font-bold">{userName}</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Kapanış</span>
                    </div>
                    <p className="text-xl font-bold">
                        {closedAt ? format(new Date(closedAt), 'd MMMM yyyy', { locale: tr }) : '---'}
                    </p>
                </div>
            </div>

            {/* Chat Container */}
            <div className="relative rounded-3xl border border-white/10 bg-[#09090b]/60 shadow-2xl overflow-hidden backdrop-blur-2xl">
                {/* Magic Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />

                <div className="p-6 border-b border-white/5 bg-white/[0.03]">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Konuşma Geçmişi
                    </h3>
                </div>

                <ScrollArea className="h-[650px] p-6">
                    <div className="space-y-8">
                        {messages.map((msg, index) => {
                            const isNewUser = index === 0 || messages[index - 1].authorName !== msg.authorName;
                            
                            return (
                                <div key={msg.id} className={cn(
                                    "group flex gap-4 transition-all duration-300",
                                    isNewUser ? "mt-6" : "mt-1 pl-[52px]"
                                )}>
                                    {isNewUser && (
                                        <div className="relative flex-shrink-0">
                                            <img 
                                                src={msg.authorAvatar} 
                                                alt={msg.authorName}
                                                className="w-9 h-9 rounded-full bg-muted border border-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-lg"
                                            />
                                            {msg.isStaff && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border border-[#09090b]">
                                                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col flex-1 min-w-0">
                                        {isNewUser && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "font-bold text-sm",
                                                    msg.isStaff ? "text-primary" : "text-white/90"
                                                )}>
                                                    {msg.authorName}
                                                </span>
                                                {msg.isStaff && (
                                                    <Badge variant="magic" className="h-4 px-1 text-[10px] leading-none">
                                                        YETKİLİ
                                                    </Badge>
                                                )}
                                                <span className="text-[10px] text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                                    {format(new Date(msg.timestamp), 'HH:mm', { locale: tr })}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="space-y-2">
                                            {msg.content && (
                                                <div className="text-sm text-white/80 leading-relaxed break-words">
                                                    {parseMarkdown(msg.content)}
                                                </div>
                                            )}

                                            {/* Embedler */}
                                            {msg.embeds && msg.embeds.map((embed, i) => (
                                                <DiscordEmbed key={i} embed={embed} />
                                            ))}

                                            {/* Ekler (Attachments) */}
                                            {msg.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {msg.attachments.map((att, i) => {
                                                        const isImage = att.contentType?.startsWith('image/');
                                                        
                                                        if (isImage) {
                                                            return (
                                                                <div key={i} className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-md group/img relative">
                                                                    <img src={att.url} alt={att.name} className="w-full h-auto" />
                                                                    <a 
                                                                        href={att.url} 
                                                                        target="_blank" 
                                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                                    >
                                                                        <Download className="w-6 h-6 text-white" />
                                                                    </a>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <a 
                                                                key={i}
                                                                href={att.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all group/att"
                                                            >
                                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                                    <Download className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-medium truncate max-w-[150px]">{att.name}</span>
                                                                    <span className="text-[10px] text-muted-foreground">{att.contentType}</span>
                                                                </div>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/5 bg-white/[0.02] text-center">
                    <p className="text-[10px] text-muted-foreground italic uppercase tracking-[0.2em]">
                        Frieren Premium Transcript Service &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
