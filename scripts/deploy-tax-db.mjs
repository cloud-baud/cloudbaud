import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://knhrygguhgfpimaogfkw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaHJ5Z2d1aGdmcGltYW9nZmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzYwNDU2MCwiZXhwIjoyMDUzMTgwNTYwfQ.Hgv1-4vWqKUAHQfhXLnSGjqWCEMpXSJXOWWdwLJqxfI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('📊 Deploying Tax Database...');
console.log('🔗 Target:', supabaseUrl);

async function deploySQL(filePath, description) {
    console.log(`\n📄 Executing ${description}...`);
    const sql = readFileSync(filePath, 'utf-8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        console.error(`❌ Error in ${description}:`, error);
        return false;
    }
    
    console.log(`✅ ${description} completed`);
    return true;
}

async function main() {
    try {
        // Deploy schema
        await deploySQL('src/data/tax_deploy_multi_schema.sql', 'Schema Deployment');
        
        // Deploy RPC helpers
        await deploySQL('src/data/tax_rpc_helpers.sql', 'RPC Functions');
        
        // Seed 2017 data
        await deploySQL('src/data/seed_2017_data.sql', '2017 Data Seeding');
        
        console.log('\n🎉 Deployment Complete!');
        console.log('👉 Refresh your Tax Dashboard to see the data');
        
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

main();
