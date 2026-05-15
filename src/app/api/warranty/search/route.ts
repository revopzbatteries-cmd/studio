import { NextResponse } from 'next/server';
import { getWarrantyStatusBySerial } from '@/lib/warrantyBackend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serial = searchParams.get('serial') || '';

    if (!serial || !/^[a-zA-Z0-9-]+$/.test(serial.trim())) {
      return NextResponse.json({ found: false, status: 'not_found' }, { status: 400 });
    }

    const result = await getWarrantyStatusBySerial(serial);

    return NextResponse.json(result);

  } catch (err: any) {
    console.error('[API] GET /api/warranty/search failed:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
