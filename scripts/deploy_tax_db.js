
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import process from 'process';
import { loadRootEnv, repoRoot } from './loadRootEnv.js';

loadRootEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = repoRoot;

// Determine Connection Details (Default to TEST for local development)
const projectUrl = process.env.VITE_SUPABASE_URL_TEST || process.env.VITE_SUPABASE_URL;
const dbPassword = process.env.VITE_SUPABASE_DB_PASSWORD_TEST || process.env.VITE_SUPABASE_DB_PASSWORD_PROD;

if (!projectUrl || !dbPassword) {
    console.error("❌ Missing Supabase credentials in .env.test (or .env)");
    console.error("Ensure VITE_SUPABASE_URL_TEST / VITE_SUPABASE_URL and DB password vars are set.");
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
        // 3. Read SQL Files in sequential order
        const filesToRun = [
            path.join(rootDir, 'src', 'data', 'tax_deploy_multi_schema.sql'),
            path.join(rootDir, 'secure_finance_api.sql'),
            path.join(rootDir, 'src', 'data', 'populate_coa_func.sql'),
            path.join(rootDir, 'src', 'data', 'tax_rpc_helpers.sql'),
            path.join(rootDir, 'src', 'data', 'seed_2017_data.sql')
        ];

        console.log("🚀 Executing Finance Stack Deployment...");

        for (const sqlPath of filesToRun) {
            console.log(`\n📄 Executing: ${path.basename(sqlPath)}`);
            if (!fs.existsSync(sqlPath)) {
                throw new Error(`File not found: ${sqlPath}`);
            }
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await client.query(sql);
            console.log(`   ✅ Success`);
        }

        console.log("\n✅ Full Finance Stack deployed successfully!");
        console.log("   - Multi-Schema Base Created");
        console.log("   - Security API Layer Applied");
        console.log("   - Default Population Function Created");
        console.log("   - Seed Data Inserted");

    } catch (err) {
        console.error("❌ Deployment Failed:", err.message);
        if (err.message.includes("password authentication failed")) {
            console.error("   Reason: Invalid DB Password. Check .env.test (or .env).");
        }
    } finally {
        await client.end();
    }
}

deploy();
