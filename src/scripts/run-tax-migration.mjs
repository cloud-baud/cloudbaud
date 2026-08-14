import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://knhrygguhgfpimaogfkw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaHJ5Z2d1aGdmcGltYW9nZmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzYwNDU2MCwiZXhwIjoyMDUzMTgwNTYwfQ.Hgv1-4vWqKUAHQfhXLnSGjqWCEMpXSJXOWWdwLJqxfI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('📊 Executing Tax Columns Split Migration...');
console.log('🔗 Target:', supabaseUrl);

async function runMigration() {
    try {
        const sql = readFileSync('src/data/tax_columns_split_migration.sql', 'utf-8');
        
        console.log('📡 Sending SQL to exec_sql RPC...');
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
            console.error('❌ Error executing SQL migration:', error);
            process.exit(1);
        }
        
        console.log('✅ SQL migration completed successfully!');
        console.log('Returned data:', data);
    } catch (err) {
        console.error('❌ Migration script failed:', err);
        process.exit(1);
    }
}

runMigration();
