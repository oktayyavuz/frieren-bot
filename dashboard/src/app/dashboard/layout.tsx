import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect("/");

    return (
        <div className="min-h-screen bg-[#09090b] text-foreground">
            {/* 
                GLOBAL DASHBOARD LAYOUT
                Removed the fixed sidebar to allow specific dashboard pages/server-layouts 
                to define their own navigation structure, resolving the double-sidebar bug.
            */}
            {children}
        </div>
    );
}
