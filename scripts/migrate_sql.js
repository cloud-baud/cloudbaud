import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Env
const envPath = path.resolve(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        if (!line || line.startsWith('#')) return;
        const [k, v] = line.split('=');
        if (k && v) env[k.trim()] = v.trim().replace(/^["']|["']$/g, '');
    });
}

// Args
const args = process.argv.slice(2);
const isDev = args.includes('--dev');

// Config
const PROJECT_REF = isDev ? 'knhrygguhgfpimaogfkw' : 'mvyavzjzdinelcufpzek'; // Extracted from URLs in .env
const DB_PASSWORD = isDev ? env.VITE_SUPABASE_DB_PASSWORD_TEST : env.VITE_SUPABASE_DB_PASSWORD_PROD;

// Use explicit Direct URL if available (Test Env), otherwise construct it
let connectionString = isDev && env.DIRECT_URL_TEST
    ? env.DIRECT_URL_TEST
    : `postgres://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

if (!DB_PASSWORD && !env.DIRECT_URL_TEST) {
    console.error('Missing DB Password in .env');
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
