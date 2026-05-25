import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Settings, PlusCircle, Globe, Users, ShieldCheck, Zap } from "lucide-react";
import { getUserGuilds, getBotGuilds, hasPermission, DISCORD_PERMISSIONS, DiscordGuild } from "@/lib/discord-api";

export default async function DashboardPage() {
    const session: any = await auth();

    if (!session || !session.accessToken) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="glass p-8 rounded-[2rem] text-center max-w-sm space-y-4">
                    <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold">Oturum Hatası</h2>
                    <p className="text-muted-foreground">Bot yönetim paneline erişmek için oturum açmanız gerekiyor.</p>
                    <Link href="/">
                        <Button className="w-full rounded-xl">Ana Sayfaya Dön</Button>
                    </Link>
                </div>
            </div>
        );
    }

    let userGuilds: DiscordGuild[] = [];
    let botGuilds: any[] = [];

    try {
        const [userRes, botRes] = await Promise.all([
            getUserGuilds(session.accessToken),
            getBotGuilds()
        ]);
        userGuilds = userRes;
        botGuilds = botRes;
    } catch (e) {
        console.error("Guild fetch error:", e);
    }

    const manageableGuilds = userGuilds.filter(guild => {
        const hasManage = hasPermission(guild.permissions, DISCORD_PERMISSIONS.MANAGE_GUILD);
        const hasAdmin = hasPermission(guild.permissions, DISCORD_PERMISSIONS.ADMINISTRATOR);
        return hasManage || hasAdmin;
    });

    const guildsInCommon = manageableGuilds.map(guild => {
        const botInGuild = botGuilds.some(botGuild => botGuild.id === guild.id);
        return { ...guild, botInGuild };
    });

    return (
        <div className="min-h-screen p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
            <header className="flex flex-col gap-4 relative">
                {/* Background Decoration */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full point-events-none" />
                
                <div className="flex items-center gap-3 text-primary font-bold tracking-[0.3em] text-xs uppercase">
                    <span className="h-[1px] w-8 bg-primary" />
                    Yönetim Paneli
                </div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                    Sunucuların
                </h1>
                <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl font-medium leading-relaxed">
                    Yönetim yetkisine sahip olduğun sunucular aşağıda listelenmiştir. Modülleri yapılandırmak için birini seç.
                </p>
            </header>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {guildsInCommon.length === 0 ? (
                    <div className="col-span-full glass p-20 rounded-[3rem] text-center space-y-4">
                        <Globe className="h-16 w-16 text-muted-foreground/20 mx-auto" />
                        <p className="text-xl font-bold text-muted-foreground">Yönetilebilecek sunucu bulunamadı.</p>
                        <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Discord üzerinde &apos;Sunucuyu Yönet&apos; yetkisine sahip olduğundan emin ol.</p>
                    </div>
                ) : (
                    guildsInCommon.map((guild) => (
                        <Card key={guild.id} className={`group relative p-1 rounded-[2.5rem] ${!guild.botInGuild ? 'opacity-80 grayscale-[0.5]' : ''}`}>
                            <div className="p-1 rounded-[2.4rem] h-full bg-black/40 relative z-10">
                                <CardHeader className="flex flex-col items-center gap-4 text-center pt-8 pb-4">
                                    <div className="relative">
                                        {/* Avatar Glow */}
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                        
                                        {guild.icon ? (
                                            <Image
                                                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                                alt={guild.name}
                                                width={96}
                                                height={96}
                                                className="rounded-[2.2rem] shadow-2xl relative z-10 border-2 border-white/5 group-hover:border-primary/50 transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="flex h-24 w-24 items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-black text-primary relative z-10 border-2 border-white/5 opacity-80">
                                                {guild.name.charAt(0)}
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute -bottom-2 -right-2 z-20">
                                            {guild.botInGuild ? (
                                                <div className="bg-emerald-500 rounded-full p-2 border-4 border-[#09090b] shadow-lg animate-pulse">
                                                    <Zap className="h-3 w-3 text-white fill-white" />
                                                </div>
                                            ) : (
                                                <div className="bg-amber-500 rounded-full p-2 border-4 border-[#09090b] shadow-lg">
                                                    <PlusCircle className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1 mt-2">
                                        <CardTitle className="truncate text-xl font-black title-glow">{guild.name}</CardTitle>
                                        <CardDescription className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">
                                            {guild.botInGuild ? "Bot Sistemi Aktif" : "Bot Davet Bekliyor"}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-6 pb-8 space-y-6">
                                    {/* Mini Stats (Simulated or placeholders since they aren't in guild info) */}
                                    <div className="flex items-center justify-around py-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                                        <div className="flex flex-col items-center">
                                            <Users className="h-3 w-3 text-muted-foreground mb-1" />
                                            <span className="text-[10px] font-bold">ÜYE</span>
                                        </div>
                                        <div className="w-[1px] h-4 bg-white/5" />
                                        <div className="flex flex-col items-center">
                                            <ShieldCheck className="h-3 w-3 text-muted-foreground mb-1" />
                                            <span className="text-[10px] font-bold">ADM</span>
                                        </div>
                                    </div>

                                    {guild.botInGuild ? (
                                        <Link href={`/dashboard/${guild.id}`}>
                                            <Button className="w-full h-12 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Paneli Aç
                                            </Button>
                                        </Link>
                                    ) : (
                                        <a 
                                            href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.AUTH_DISCORD_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <Button className="w-full h-12 rounded-2xl font-bold bg-primary text-white hover:bg-primary/80 transition-all duration-300">
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Botu Ekle
                                            </Button>
                                        </a>
                                    )}
                                </CardContent>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
