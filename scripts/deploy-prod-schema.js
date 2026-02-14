
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prodUrl = process.env.VITE_SUPABASE_URL_PROD;
const prodPassword = process.env.VITE_SUPABASE_DB_PASSWORD_PROD;

if (!prodUrl || !prodPassword) {
    console.error('Error: VITE_SUPABASE_URL_PROD or VITE_SUPABASE_DB_PASSWORD_PROD missing in .env');
    process.exit(1);
}

// Extract Project ID from URL
// https://mvyavzjzdinelcufpzek.supabase.co -> mvyavzjzdinelcufpzek
const projectId = prodUrl.split('//')[1].split('.')[0];

// Construct Connection String (Direct Connection)
// Using universal domain: db.[project-ref].supabase.co
const host = `db.${projectId}.supabase.co`;
const user = 'postgres'; // Direct connection uses simple 'postgres' user

const connectionString = `postgresql://${user}:${prodPassword}@${host}:5432/postgres`;

console.log(`Targeting Project: ${projectId}`);
console.log(`Connecting to: ${host} (Port 5432) as ${user}...`);

console.log(`Targeting Project: ${projectId}`);
console.log(`Connecting to: ${host} (Port 5432)...`);

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const SCHEMAS = [
    '../supabase_setup_navigation.sql',
    '../supabase_industries.sql',
    '../supabase_setup_access.sql',
    '../supabase_setup_cmdb.sql',
    '../supabase_cmdb_metadata_migration.sql'
];

(async () => {
    try {
        await client.connect();
        console.log('Connected to Production Database!');
        
        for (const schemaPath of SCHEMAS) {
            const fullPath = path.resolve(__dirname, schemaPath);
            if (fs.existsSync(fullPath)) {
                console.log(`Applying: ${schemaPath}`);
                const sql = fs.readFileSync(fullPath, 'utf8');
                await client.query(sql);
                console.log(`✓ Applied ${schemaPath}`);
            } else {
                console.warn(`⚠ Skipped missing file: ${schemaPath}`);
            }
        }
        
        console.log('All migrations applied successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        if (err.message.includes('getaddrinfo')) {
             console.error('Hint: The hostname might be wrong. Check Supabase Dashboard -> Database -> Connection String.');
        }
    } finally {
        await client.end();
    }
})();
