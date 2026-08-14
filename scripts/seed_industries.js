import { createClient } from '@supabase/supabase-js';
import { industries } from '../src/data/industries.js';
import { loadRootEnv } from './loadRootEnv.js';

loadRootEnv();

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
    console.error('Missing Credentials. Please check .env.test (or .env).');
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
