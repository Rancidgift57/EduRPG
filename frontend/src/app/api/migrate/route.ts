// src/app/api/migrate/route.ts
// Call this ONCE to create all tables

import { runMigrations } from '@/lib/migrate';
import { NextResponse } from 'next/server';

export async function GET() {
    await runMigrations();
    return NextResponse.json({ status: 'migrations complete' });
}