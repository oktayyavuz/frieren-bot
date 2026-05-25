import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getGuildChannels } from '@/lib/bot-api';

export async function GET(
    _req: Request,
    { params }: { params: { guildId: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const channels = await getGuildChannels(params.guildId);
        return NextResponse.json(channels);
    } catch (err: any) {
        console.error('[API] Channels fetch error:', err.message);
        return NextResponse.json([], { status: 200 });
    }
}
