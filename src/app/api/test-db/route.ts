import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier les variables
    const env = {
      DB_HOST: process.env.DB_HOST ?? '(not set)',
      DB_PORT: process.env.DB_PORT ?? '(not set)',
      DB_USER: process.env.DB_USER ?? '(not set)',
      DB_PASS: process.env.DB_PASS ? '***' : '(not set)',
      DB_NAME: process.env.DB_NAME ?? '(not set)',
    };

    // Tester la connexion
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      env,
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        DB_HOST: process.env.DB_HOST ?? '(not set)',
        DB_PORT: process.env.DB_PORT ?? '(not set)',
        DB_USER: process.env.DB_USER ?? '(not set)',
        DB_PASS: process.env.DB_PASS ? '***' : '(not set)',
        DB_NAME: process.env.DB_NAME ?? '(not set)',
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
