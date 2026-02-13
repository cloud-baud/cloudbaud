
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read .env robustly
const envPath = path.join(rootDir, '.env');
let env = {};

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            let value = trimmed.substring(eqIdx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
}

// 2. Connect to PROD (mvyavzjzdinelcufpzek)
const projectUrl = env.VITE_SUPABASE_URL_PROD;
const dbPassword = env.VITE_SUPABASE_DB_PASSWORD_PROD;

if (!projectUrl || !dbPassword) {
    console.error("❌ Missing Supabase credentials in .env");
    process.exit(1);
}

const projectRef = projectUrl.replace('https://', '').split('.')[0];
const connectionString = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function deployUniversal() {
    try {
        await client.connect();
        console.log(`🔌 Connected to Supabase (${projectRef})`);

        const sqlPath = path.join(rootDir, 'src', 'data', 'universal_accounting_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("🚀 Deploying Universal Chart of Accounts Schema...");
        await client.query(sql);
        console.log("✅ Universal Schema deployed successfully!");
        console.log("   - Tables created (universal_coa, ledger_entries)");
        console.log("   - Views created (view_tax_dashboard_grid)");

    } catch (err) {
        console.error("❌ Deployment Failed:", err.message);
    } finally {
        await client.end();
    }
}

deployUniversal();
