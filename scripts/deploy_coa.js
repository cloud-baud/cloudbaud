import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { loadRootEnv } from './loadRootEnv.js';

loadRootEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const deployFunction = async () => {
    // Try to get connection string from various env vars
    const connectionString = process.env.DIRECT_URL_TEST || process.env.DIRECT_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error('No DIRECT_URL or DATABASE_URL found in .env.test (or .env)');
        process.exit(1);
    }

    console.log(`Connecting to database...`);
    
    // Create client with strict SSL settings for Supabase
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, '../populate_coa_func.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL
        console.log('Deploying function...');
        await client.query(sql);
        console.log('Function public.populate_default_coa() created successfully.');
        
    } catch (err) {
        console.error('Error deploying function:', err);
    } finally {
        await client.end();
    }
};

deployFunction();
