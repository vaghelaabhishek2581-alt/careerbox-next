import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import AdminInstitute from '@/src/models/AdminInstitute';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { query } = await request.json();

    if (typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const regex = new RegExp(escapeRegex(query.trim()), 'i');

    const cities = await AdminInstitute.distinct('location.city', { 'location.city': regex });
    const states = await AdminInstitute.distinct('location.state', { 'location.state': regex });

    const suggestions = [...new Set([...cities, ...states])]
      .filter(Boolean)
      .slice(0, 10);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
