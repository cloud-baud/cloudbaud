
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { loadRootEnv } from './loadRootEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadRootEnv();

const testUrl = process.env.DIRECT_URL_TEST;

const client = new pg.Client({
    connectionString: testUrl || 'postgresql://postgres:postgres@localhost:54322/postgres', // Fallback for safety
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        await client.connect();
        console.log('Connected to TEST Database (Safe Environment)');
        
        const sql = fs.readFileSync(path.resolve(__dirname, '../secure_finance_api.sql'), 'utf8');
        console.log('Deploying Secure Interface...');
        
        await client.query(sql);
        console.log('✓ Security Implemented: Finance Schema Locked Down, API Layer Enabled.');
        
    } catch (err) {
        console.error('Migration Failed:', err.message);
    } finally {
        await client.end();
    }
})();
