import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { loadRootEnv } from './loadRootEnv.js';

loadRootEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const resetCOA = async () => {
    // 2. Determine Connection Details (Default to TEST for local development)
    // Reuse logic from scripts/deploy_tax_db.js
    const env = process.env;
    const projectUrl = env.VITE_SUPABASE_URL_TEST || env.VITE_SUPABASE_URL;
    const dbPassword = env.VITE_SUPABASE_DB_PASSWORD_TEST || env.VITE_SUPABASE_DB_PASSWORD_PROD;

    if (!projectUrl || !dbPassword) {
        console.error("❌ Missing Supabase credentials in .env.test (or .env)");
        process.exit(1);
    }

    // Extract Project Ref
    const projectRef = projectUrl.replace('https://', '').split('.')[0];
    const connectionString = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

    console.log(`Payload: Connecting to database (${projectRef})...`);
    
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log('🗑️  Clearing existing Chart of Accounts...');
        // We use TRUNCATE for a clean slate, cascading if necessary but keeping it simple first
        // Since we want to re-populate for the *current user*, we technically should delete by user_id
        // But for this dev reset, we can just clear the table to be safe and simple for the test DB.
        // However, let's just delete all rows to be safe.
        await client.query('DELETE FROM public.chart_of_accounts;');
        
        console.log('✅ Chart of Accounts cleared.');
        console.log('🔄 The next time you load the dashboard, the new defaults will populate automatically.');

    } catch (err) {
        console.error('❌ Error clearing COA:', err);
    } finally {
        await client.end();
    }
};

resetCOA();
