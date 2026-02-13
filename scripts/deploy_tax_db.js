
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read .env manually
const envPath = path.join(rootDir, '.env');
let env = {};

console.log(`📂 Reading .env from: ${envPath}`);
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.replace(/\r\n/g, '\n').split('\n'); // Normalize Line Endings
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return; // Skip comments/empty

        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            let value = trimmed.substring(eqIdx + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
    console.log(`✅ Loaded ${Object.keys(env).length} variables from .env`);
    // Safe log keys (don't log values)
    console.log("Keys found:", Object.keys(env).filter(k => k.includes("SUPABASE")));
} else {
    console.error("❌ .env file not found!");
}

// 2. Determine Connection Details (Prioritize PROD as requested)
const projectUrl = env.VITE_SUPABASE_URL_PROD || env.VITE_SUPABASE_URL;
const dbPassword = env.VITE_SUPABASE_DB_PASSWORD_PROD || env.VITE_SUPABASE_DB_PASSWORD_TEST;

if (!projectUrl || !dbPassword) {
    console.error("❌ Mising Supabase credentials in .env");
    console.error("Ensure VITE_SUPABASE_URL_PROD and VITE_SUPABASE_DB_PASSWORD_PROD are set.");
    process.exit(1);
}

// Extract Project Ref (e.g., mvyavzjzdinelcufpzek)
// URL format: https://[ref].supabase.co
const projectRef = projectUrl.replace('https://', '').split('.')[0];
const connectionString = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

console.log(`🔌 Connecting to Supabase DB (${projectRef})...`);

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

async function deploy() {
    try {
        await client.connect();
        console.log("✅ Connected.");

        // 3. Read SQL File
        const sqlPath = path.join(rootDir, 'src', 'data', 'tax_deploy_master.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("🚀 Executing Tax Dashboard Schema...");
        
        // Execute
        await client.query(sql);

        console.log("✅ Schema deployed successfully!");
        console.log("   - Tables created (Chart of Accounts, Entries, Audit Log)");
        console.log("   - RLS Policies applied");
        console.log("   - Seed data inserted for latest user");

    } catch (err) {
        console.error("❌ Deployment Failed:", err.message);
        if (err.message.includes("password authentication failed")) {
            console.error("   Reason: Invalid DB Password. Check .env file.");
        }
    } finally {
        await client.end();
    }
}

deploy();
