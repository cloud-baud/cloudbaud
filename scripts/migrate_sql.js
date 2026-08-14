import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { loadRootEnv } from './loadRootEnv.js';
import dotenv from 'dotenv';

const args = process.argv.slice(2);
const isDev = args.includes('--dev');

if (isDev) {
    loadRootEnv();
} else {
    const prodEnvPath = path.resolve(process.cwd(), '.env.prod');
    if (fs.existsSync(prodEnvPath)) {
        dotenv.config({ path: prodEnvPath });
        console.log(`[env] Loaded ${prodEnvPath}`);
    } else {
        loadRootEnv();
    }
}

const { Client } = pg;

const env = process.env;

// Config
const PROJECT_REF = isDev ? 'knhrygguhgfpimaogfkw' : 'mvyavzjzdinelcufpzek'; // Extracted from URLs in .env
const DB_PASSWORD = isDev ? env.VITE_SUPABASE_DB_PASSWORD_TEST : env.VITE_SUPABASE_DB_PASSWORD_PROD;

// Use explicit Direct URL if available (Test Env), otherwise construct it
// Use explicit Direct URL if available, otherwise construct it
let connectionString = isDev
    ? (env.DIRECT_URL_TEST || `postgres://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`)
    : (env.DIRECT_URL_PROD || `postgres://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`);

if (!DB_PASSWORD && !env.DIRECT_URL_TEST && !env.DIRECT_URL_PROD) {
    console.error('Missing DB Password / DIRECT_URL in .env.test (or .env)');
    process.exit(1);
}
// Updated to use direct connection string format: db.[ref].supabase.co
// This avoids region-specific pooler domain issues.

console.log(`Connecting to ${isDev ? 'DEV' : 'PROD'} database...`);
console.log(`Host: db.${PROJECT_REF}.supabase.co`);

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

const fileArgIndex = args.indexOf('--file');
const specificFile = fileArgIndex !== -1 ? args[fileArgIndex + 1] : null;

// List of SQL files to apply (Order matters)
const MIGRATIONS = [
    'supabase_setup.sql',              // Base Tables (Assessments)
    'supabase_assessment_templates.sql' // Templates & RLS
];

async function run() {
    try {
        await client.connect();

        const filesToRun = specificFile ? [specificFile] : MIGRATIONS;

        for (const file of filesToRun) {
            const sqlPath = path.resolve(process.cwd(), file);
            if (!fs.existsSync(sqlPath)) {
                console.warn(`⚠️ Skipped ${file}: File not found.`);
                continue;
            }

            console.log(`Running migration: ${file}...`);
            const sql = fs.readFileSync(sqlPath, 'utf-8');
            await client.query(sql);
            console.log(`✅ ${file} applied successfully.`);
        }

    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
