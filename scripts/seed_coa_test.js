
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testUrl = process.env.DIRECT_URL_TEST;
const TARGET_EMAIL = 'jish.nath@cloudbaud.com'; // The user to seed for

if (!testUrl) {
    console.error('Missing DIRECT_URL_TEST in .env');
    process.exit(1);
}

// Extract project ID for logging
const projectId = testUrl.split(':')[2].split('@')[0]; // Crude extraction but works for logging

const client = new pg.Client({
    connectionString: testUrl,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        await client.connect();
        console.log(`Connected to Test Database`);

        // 1. Get User ID
        const res = await client.query(`SELECT id, email FROM auth.users WHERE email = $1`, [TARGET_EMAIL]);
        if (res.rows.length === 0) {
            console.error(`User ${TARGET_EMAIL} not found in Test DB auth.users.`);
            console.log('Listing all users in auth.users:');
            const allUsers = await client.query('SELECT id, email, created_at FROM auth.users LIMIT 10');
            if (allUsers.rows.length === 0) {
                console.log('(No users found in Test DB)');
            } else {
                allUsers.rows.forEach(u => console.log(`- ${u.email} (${u.id})`));
            }
            process.exit(1);
        }
        const userId = res.rows[0].id;
        console.log(`Found User ID: ${userId} for ${TARGET_EMAIL}`);

        // 2. Clear Existing COA
        await client.query(`DELETE FROM public.chart_of_accounts WHERE user_id = $1`, [userId]);
        console.log('Cleared existing COA entries.');

        // 3. Insert Seed Data
        // Using the same data as prod
        const queries = [
            // W2 Wages
            ['W2 Wages', 'INCOME', 'w2', 10],
            ['Taxes Withheld', 'EXPENSE', 'w2', 20],
            
            // Business
            ['1. Comfort Foods (dba Robertos Pizza)', 'INCOME', 'biz', 10],
            ['2. CloudBaud LLC', 'INCOME', 'biz', 20],
            ['3. Teaching Income', 'INCOME', 'biz', 30],
            ['4. Canada Condo Sale', 'INCOME', 'biz', 40],
            
            // Rental
            ['1. Olympic Court', 'INCOME', 'rental', 10],
            ['2. Cherry Crest', 'INCOME', 'rental', 20],
            ['3. Woodridge', 'INCOME', 'rental', 30],

             // IRA / Retirement
            ['Jishnu Roth IRA', 'ASSET', 'ira', 10],
            ['Deepika ROTH IRA', 'ASSET', 'ira', 20],
            ['SEP IRA', 'ASSET', 'ira', 30],
            ['1099-R', 'INCOME', 'ira', 40],
            ['Child Education Fund', 'ASSET', 'ira', 50],

             // Deductions
            ['Real Estate Interest Woodridge', 'EXPENSE', 'deductions', 10],
            ['Real Estate Interest Lake Hills', 'EXPENSE', 'deductions', 20],
            ['Real Estate Interest Olympic Court', 'EXPENSE', 'deductions', 30],

             // Taxes (Real Estate)
            ['Real Estate Taxes Woodridge', 'EXPENSE', 'taxes', 10],
            ['Real Estate Taxes Cherry Crest', 'EXPENSE', 'taxes', 20],
            ['Real Estate Taxes Lake Hills', 'EXPENSE', 'taxes', 30],
            ['Real Estate Taxes Olympic Court', 'EXPENSE', 'taxes', 40],
            ['Real Estate Taxes Rudins Lounge', 'EXPENSE', 'taxes', 50]
        ];

        for (const [name, type, section, sort] of queries) {
            await client.query(
                `INSERT INTO public.chart_of_accounts (user_id, name, type, section, sort_order) VALUES ($1, $2, $3, $4, $5)`,
                [userId, name, type, section, sort]
            );
        }

        console.log(`Successfully inserted ${queries.length} COA entries for ${TARGET_EMAIL} in Test Database`);

    } catch (err) {
        console.error('Error seeding Test COA:', err);
    } finally {
        await client.end();
    }
})();
