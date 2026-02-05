import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import definitions - we need to resolve it relative to this script
// Using dynamic import or direct relative import
import { assessmentConfigs } from '../src/components/assessments/definitions.js';

// Manually parse .env
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading env from ${envPath}`);

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        // Simple parser that handles basic KEY=VALUE
        // Ignores comments and empty lines
        if (!line || line.startsWith('#')) return;

        const equalsIdx = line.indexOf('=');
        if (equalsIdx > 0) {
            const key = line.substring(0, equalsIdx).trim();
            let val = line.substring(equalsIdx + 1).trim();

            // Remove quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }

            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    });
}

const args = process.argv.slice(2);
const isDev = args.includes('--dev') || args.includes('dev');
const isProd = args.includes('--prod') || args.includes('prod');

if (!isDev && !isProd) {
    console.error('❌ SAFETY ERROR: No target environment specified.');
    console.error('   Please specify --dev OR --prod explicitly.');
    console.error('   Example: node scripts/seed_assessment_templates.js --dev');
    process.exit(1);
}

console.log(`Target Environment: ${isDev ? 'DEVELOPMENT (TEST)' : 'PRODUCTION'}`);

const supabaseUrl = isDev
    ? (process.env.VITE_SUPABASE_URL_TEST || process.env.VITE_SUPABASE_URL)
    : (process.env.VITE_SUPABASE_URL_PROD || process.env.VITE_SUPABASE_URL);

// Select the appropriate Service Role Key (preferred) or Anon Key
const serviceKey = isDev
    ? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY_TEST
    : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY_PROD;

const anonKey = isDev
    ? process.env.VITE_SUPABASE_ANON_KEY_TEST
    : (process.env.VITE_SUPABASE_ANON_KEY_PROD || process.env.VITE_SUPABASE_ANON_KEY);

const supabaseKey = serviceKey || anonKey;

console.log(`Connecting to: ${supabaseUrl}`);
if (serviceKey) {
    console.log('Using: Service Role Key (Admin Privileges)');
} else {
    console.warn('Using: Anon Key (Warning: RLS might block inserts)');
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Credentials. Please check .env file.');
    console.error(`Required for ${isDev ? 'DEV' : 'PROD'}: URL and KEY.`);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding assessment templates...');

    for (const [slug, config] of Object.entries(assessmentConfigs)) {
        console.log(`Processing ${slug}...`);

        // Check for existing active version
        const { data: existing, error: fetchError } = await supabase
            .from('assessment_templates')
            .select('id, version')
            .eq('slug', slug)
            .order('version', { ascending: false })
            .limit(1);

        if (fetchError) {
            // If table doesn't exist, this will fail.
            // We can't Create Table from here easily without SQL editor or specific privileges/RPC.
            console.error(`Error fetching existing for ${slug}. Does the table exist?`, fetchError);
            continue;
        }

        const currentVersion = existing && existing.length > 0 ? existing[0].version : 0;
        const newVersion = currentVersion + 1;

        const payload = {
            slug: slug,
            title: config.title,
            description: config.description,
            content: { steps: config.steps },
            version: newVersion,
            is_active: true
        };

        const { error } = await supabase
            .from('assessment_templates')
            .insert(payload);

        if (error) {
            console.error(`Error inserting ${slug}:`, error);
        } else {
            console.log(`Inserted ${slug} v${newVersion}`);

            // Deactivate older versions
            if (currentVersion > 0) {
                const { error: updateError } = await supabase
                    .from('assessment_templates')
                    .update({ is_active: false })
                    .eq('slug', slug)
                    .lt('version', newVersion);

                if (updateError) console.error("Error deactivating old versions", updateError);
            }
        }
    }
}

seed();
