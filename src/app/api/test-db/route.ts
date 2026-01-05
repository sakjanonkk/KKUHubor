import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const client = await db.connect();
    try {
    
      const result = await client.query('SELECT * FROM users LIMIT 5');
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
