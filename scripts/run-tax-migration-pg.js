import pg from 'pg';
import { readFileSync } from 'fs';

const connectionString = "postgresql://postgres.knhrygguhgfpimaogfkw:TxfgDqdaG49DCvGd@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

console.log('📊 Executing Tax Columns Split Migration via pg client...');
console.log('🔗 Target URL: aws-1-ap-south-1.pooler.supabase.com');

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to database successfully!');

        const sql = readFileSync('src/data/tax_columns_split_migration.sql', 'utf-8');
        console.log('Executing migration SQL...');
        
        await client.query(sql);
        console.log('✅ Migration applied successfully via direct postgres connection!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
