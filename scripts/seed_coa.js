
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { loadRootEnv, repoRoot } from './loadRootEnv.js';

loadRootEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = repoRoot;

// Connect to PROD (mvyavzjzdinelcufpzek)
const projectUrl = process.env.VITE_SUPABASE_URL_PROD;
const dbPassword = process.env.VITE_SUPABASE_DB_PASSWORD_PROD;

if (!projectUrl || !dbPassword) {
    console.error("❌ Missing Supabase credentials in .env.test (or .env)");
    process.exit(1);
}

const projectRef = projectUrl.replace('https://', '').split('.')[0];
// Use Connection Pooling (Port 5432)
const connectionString = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function seed() {
    try {
        await client.connect();
        console.log(`🔌 Connected to Supabase (${projectRef})`);

        const sqlPath = path.join(rootDir, 'src', 'data', 'seed_coa_from_md.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("🌱 Seeding Chart of Accounts...");
        await client.query(sql);
        console.log("✅ Seed complete! Reload dashboard.");

    } catch (err) {
        console.error("❌ Seed Failed:", err.message);
    } finally {
        await client.end();
    }
}

seed();
