import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use TEST environment for localhost
const supabaseUrl = 'https://knhrygguhgfpimaogfkw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaHJ5Z2d1aGdmcGltYW9nZmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzYwNDU2MCwiZXhwIjoyMDUzMTgwNTYwfQ.Hgv1-4vWqKUAHQfhXLnSGjqWCEMpXSJXOWWdwLJqxfI';

async function deploySchema() {
    try {
        console.log('📊 Deploying Tax Database Schema...');
        console.log(`🔗 Target: ${supabaseUrl}`);
        
        // Read the SQL file
        const sqlPath = join(__dirname, '..', 'src', 'data', 'tax_deploy_master.sql');
        const sql = readFileSync(sqlPath, 'utf-8');
        
        console.log('📄 SQL file loaded, executing via REST API...');
        
        // Use Supabase's query endpoint
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: sql })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`⚠️  REST API response: ${response.status} - ${errorText}`);
            console.log('💡 You may need to run this SQL manually in the Supabase SQL Editor');
            console.log(`📋 SQL file location: ${sqlPath}`);
            return;
        }
        
        console.log('✅ Tax schema deployed successfully!');
        console.log('🎯 Tables created:');
        console.log('   - chart_of_accounts');
        console.log('   - tax_entries');
        console.log('   - tax_documents');
        console.log('   - entry_evidence');
        console.log('   - tax_audit_log');
        console.log('   - tax_year_schema_defs');
        
    } catch (err) {
        console.error('❌ Error deploying schema:', err.message);
        console.log('\n💡 Manual deployment instructions:');
        console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of: src/data/tax_deploy_master.sql');
        console.log('4. Click "Run"');
    }
}

deploySchema();
