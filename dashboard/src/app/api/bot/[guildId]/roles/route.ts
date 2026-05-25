import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getGuildRoles } from '@/lib/bot-api';

export async function GET(
    _req: Request,
    { params }: { params: { guildId: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const roles = await getGuildRoles(params.guildId);
        return NextResponse.json(roles);
    } catch (err: any) {
        console.error('[API] Roles fetch error:', err.message);
        return NextResponse.json([], { status: 200 });
    }
}
