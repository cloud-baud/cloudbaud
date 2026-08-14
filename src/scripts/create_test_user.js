import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mvyavzjzdinelcufpzek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eWF2emp6ZGluZWxjdWZwemVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDU1ODcsImV4cCI6MjA2OTUyMTU4N30.ooo-nyhz_Tr0TjvLeU3Y8s-OtMDW4K6OiF04i5vAPAw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
    const email = 'jishnu.nath@outlook.com';
    const password = 'TempPassword123!';

    console.log(`Attempting to sign up user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Jishnu Nath'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('Sign up result:', data);

    if (data.user && data.user.identities && data.user.identities.length === 0) {
        console.log('User likely already exists.');
    } else if (data.user && !data.session) {
        console.log('User created successfully. Please check email for confirmation link if enabled.');
    } else if (data.session) {
        console.log('User created and logged in!');
    }
}

createTestUser();
