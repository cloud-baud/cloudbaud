
import pg from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testUrl = process.env.DIRECT_URL_TEST;
const prodUrl = process.env.VITE_SUPABASE_URL_PROD;
const prodPassword = process.env.VITE_SUPABASE_DB_PASSWORD_PROD;

async function getTables(client, name) {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT 
                t.table_name,
                (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
                CASE 
                    WHEN t.table_name IN ('chart_of_accounts', 'universal_coa', 'cmdb_applications') THEN 
                        (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I', t.table_name), false, true, '')))[1]::text::int
                    ELSE 0
                END as approx_row_count
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log(`\n--- ${name} Database Tables ---`);
        if (res.rows.length === 0) {
            console.log('(No tables found)');
        } else {
            res.rows.forEach(row => {
                const countStr = row.approx_row_count > 0 ? ` (${row.approx_row_count} rows)` : '';
                console.log(`- ${row.table_name}${countStr}`);
            });
        }
    } catch (err) {
        console.error(`Error connecting to ${name}:`, err.message);
    } finally {
        await client.end();
    }
}

(async () => {
    // Audit TEST DB
    if (testUrl) {
        const testClient = new pg.Client({
            connectionString: testUrl,
            ssl: { rejectUnauthorized: false }
        });
        await getTables(testClient, 'TEST');
    } else {
        console.log('Skipping TEST (DIRECT_URL_TEST not found)');
    }

    // Audit PROD DB
    if (prodUrl && prodPassword) {
        const projectId = prodUrl.split('//')[1].split('.')[0];
        // Use Direct Connection for Audit
        const connectionString = `postgresql://postgres:${prodPassword}@db.${projectId}.supabase.co:5432/postgres`;
        
        const prodClient = new pg.Client({
            connectionString,
            ssl: { rejectUnauthorized: false }
        });
        await getTables(prodClient, 'PRODUCTION');
    } else {
        console.log('Skipping PROD (Missing credentials)');
    }
})();
