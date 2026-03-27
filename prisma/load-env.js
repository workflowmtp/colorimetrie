// prisma/load-env.js
// Sets DATABASE_URL from individual DB_* env vars for Prisma CLI
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '5432';
const user = process.env.DB_USER || 'postgres';
const pass = process.env.DB_PASS || 'postgres';
const name = process.env.DB_NAME || 'colorlab_pro';

process.env.DATABASE_URL = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}?schema=public`;