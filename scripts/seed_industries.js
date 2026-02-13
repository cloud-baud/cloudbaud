import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import data - resolve relative to this script
import { industries } from '../src/data/industries.js';

// Manually parse .env
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading env from ${envPath}`);

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
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
    console.error('   Example: node scripts/seed_industries.js --dev');
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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Credentials. Please check .env file.');
    console.error(`Required for ${isDev ? 'DEV' : 'PROD'}: URL and KEY.`);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding industries table...');

    for (const industry of industries) {
        console.log(`Processing ${industry.slug}...`);

        // Prepare payload with top-level fields extracted
        const payload = {
            slug: industry.slug,
            name: industry.name,
            icon: industry.icon,
            description: industry.description,
            // Pack structured/nested data into JSONB
            content: {
                challenges: industry.challenges,
                solutions: industry.solutions,
                technologies: industry.technologies,
                caseStudy: industry.caseStudy
            },
            is_active: true
        };

        // Use upsert on 'slug' constraint if unique constraint allows
        // Since we didn't specify distinct unique constraint on create table other than implicitly via unique index,
        // we should try upsert with conflict detection on the unique column.
        // Wait, supabase-js `upsert` works best with a primary key or unique constraint.
        // Our table has `unique(slug)`.
        
        const { error } = await supabase
            .from('industries')
            .upsert(payload, { onConflict: 'slug' });

        if (error) {
            console.error(`Error upserting ${industry.slug}:`, error);
        } else {
            console.log(`✅ Upserted ${industry.slug}`);
        }
    }
}

seed();
