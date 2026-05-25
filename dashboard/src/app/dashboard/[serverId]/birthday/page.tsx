import { prisma } from "@/lib/prisma";
import { Cake } from "lucide-react";
import BirthdayForm from "./birthday-form";

export default async function BirthdayPage({
    params,
}: {
    params: { serverId: string };
}) {
    let settings = null;
    let birthdays: any[] = [];

    try {
        [settings, birthdays] = await Promise.all([
            prisma.guildSettings.findUnique({ where: { id: params.serverId } }),
            prisma.birthday.findMany({
                where: { guildId: params.serverId },
                orderBy: [{ month: "asc" }, { day: "asc" }],
            }),
        ]);
    } catch (e) {
        console.error("[birthday] Prisma error:", e);
    }

    const now = new Date();
    const todayBirthdays = birthdays.filter(
        b => b.day === now.getDate() && b.month === now.getMonth() + 1
    ).length;

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 p-8">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                        <Cake className="h-7 w-7 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Doğum Günleri</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {birthdays.length} kayıtlı doğum günü
                            {todayBirthdays > 0 && ` • 🎉 Bugün ${todayBirthdays} kişinin günü!`}
                        </p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                        settings?.birthdayChannelId
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                        {settings?.birthdayChannelId ? "Yapılandırıldı" : "Kurulmadı"}
                    </div>
                </div>
            </div>

            <BirthdayForm
                serverId={params.serverId}
                initialData={{
                    birthdayChannelId: settings?.birthdayChannelId ?? null,
                    birthdayRoleId: settings?.birthdayRoleId ?? null,
                    birthdayMessage: settings?.birthdayMessage ?? "🎂 Bugün {user} doğum günü! Herkese kutlu olsun! 🎉",
                }}
                birthdays={birthdays}
            />
        </div>
    );
}
