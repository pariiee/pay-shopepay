import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'SisforHub Pay Gateway is running',
    timestamp: new Date().toISOString()
  });
}
