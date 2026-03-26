import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test 1: Vérifier si DATABASE_URL est défini
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL is not defined in environment variables',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test 2: Vérifier la connexion à la base
    const userCount = await prisma.user.count();
    
    // Test 3: Vérifier si les tables existent
    const tableCounts = {
      users: userCount,
      projects: await prisma.colorProject.count(),
      clients: await prisma.client.count(),
      machines: await prisma.machine.count(),
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      database: {
        url: dbUrl.replace(/\/\/.*@/, '//***:***@'), // Cacher les identifiants
        tables: tableCounts,
        totalRecords: Object.values(tableCounts).reduce((a, b) => a + b, 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
