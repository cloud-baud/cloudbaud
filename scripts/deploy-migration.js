
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { loadRootEnv } from './loadRootEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadRootEnv();

const connectionString = process.env.DIRECT_URL_TEST;

if (!connectionString) {
    console.error('Error: DIRECT_URL_TEST is not defined in .env.test (or .env)');
    process.exit(1);
}

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

const migrationFile = path.resolve(__dirname, '../supabase_cmdb_metadata_migration.sql');
const migrationSql = fs.readFileSync(migrationFile, 'utf8');

(async () => {
    try {
        await client.connect();
        console.log('Connected to database...');
        
        console.log('Applying migration...');
        await client.query(migrationSql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
})();
