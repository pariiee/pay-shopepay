import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/db';

export async function GET() {
  const apiKey = getSetting('api_key', process.env.API_KEY || 'al-yra7890ia8');
  return NextResponse.json({ success: true, api_key: apiKey });
}
