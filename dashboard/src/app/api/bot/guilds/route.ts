import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getBotGuildsFromApi } from '@/lib/bot-api';

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const guilds = await getBotGuildsFromApi();
        return NextResponse.json(guilds);
    } catch (err: any) {
        console.error('[API] Bot guilds fetch error:', err.message);
        return NextResponse.json({ error: 'Bot API ulaşılamıyor' }, { status: 503 });
    }
}
