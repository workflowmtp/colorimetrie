import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test 1: Vérifier si les variables DB_* sont définies
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbName = process.env.DB_NAME;
    const dbPass = process.env.DB_PASS ?? process.env.DB_PASSWORD;
    const dbPort = process.env.DB_PORT ?? '5432';
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    if (!hasDatabaseUrl && (!dbHost || !dbUser || !dbName)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables DB_* manquantes',
        details: {
          hasDBHost: !!dbHost,
          hasDBUser: !!dbUser,
          hasDBName: !!dbName,
          hasDBPassword: !!dbPass,
          hasDBPort: !!process.env.DB_PORT,
          hasDatabaseUrl,
          rawDBPort: dbPort,
          nodeEnv: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        },
        solution: 'Configurez DB_HOST, DB_USER, DB_PASS, DB_NAME dans Vercel Environment Variables'
      }, { status: 500 });
    }
    
    // Test 3: Tenter la connexion avec timeout
    const connectionTest = await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
    ]);
    
    // Test 4: Vérifier les tables
    const userCount = await prisma.user.count();
    const tableCounts = {
      users: userCount,
      projects: await prisma.colorProject.count().catch(() => 0),
      clients: await prisma.client.count().catch(() => 0),
      machines: await prisma.machine.count().catch(() => 0),
    };

    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      database: {
        host: dbHost ?? 'from DATABASE_URL',
        database: dbName ?? 'from DATABASE_URL',
        user: dbUser ?? 'from DATABASE_URL',
        port: dbPort,
        usingDatabaseUrl: hasDatabaseUrl,
        tables: tableCounts,
        totalRecords: Object.values(tableCounts).reduce((a, b) => a + b, 0)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    // Analyse détaillée de l'erreur
    let errorType = 'unknown';
    let solution = 'Contactez le support technique';
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('timeout') || message.includes('etimedout')) {
        errorType = 'timeout';
        solution = 'Vérifiez que la base est accessible et ajoutez les IPs Vercel à la whitelist';
      } else if (message.includes('authentication') || message.includes('password') || message.includes('login')) {
        errorType = 'auth';
        solution = 'Vérifiez DB_USER et DB_PASSWORD dans les variables Vercel';
      } else if (message.includes('connect') || message.includes('enotfound') || message.includes('connection refused')) {
        errorType = 'connection';
        solution = 'Vérifiez DB_HOST et DB_PORT, assurez-vous que la base est accessible depuis Vercel';
      } else if (message.includes('database') && message.includes('does not exist')) {
        errorType = 'database_not_found';
        solution = 'Créez la base de données ou vérifiez DB_NAME';
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error',
      errorType,
      details: {
        hasDBHost: !!process.env.DB_HOST,
        hasDBUser: !!process.env.DB_USER,
        hasDBName: !!process.env.DB_NAME,
        hasDBPassword: !!(process.env.DB_PASS ?? process.env.DB_PASSWORD),
        hasDBPort: !!process.env.DB_PORT,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        rawDBPort: process.env.DB_PORT ?? '(default 5432)',
        rawDBHost: process.env.DB_HOST ?? '(not set)',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      },
      solution,
      nextSteps: [
        '1. Vérifiez les variables DB_* dans Vercel Environment Variables',
        '2. Assurez-vous que la base est accessible depuis Internet',
        '3. Ajoutez les IPs Vercel à la whitelist de votre base',
        '4. Redéployez après correction'
      ]
    }, { status: 500 });
  }
}
