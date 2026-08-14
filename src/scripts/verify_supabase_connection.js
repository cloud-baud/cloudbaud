import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mvyavzjzdinelcufpzek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eWF2emp6ZGluZWxjdWZwemVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDU1ODcsImV4cCI6MjA2OTUyMTU4N30.ooo-nyhz_Tr0TjvLeU3Y8s-OtMDW4K6OiF04i5vAPAw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
    console.log("Verifying connection to Supabase...");
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error("Connection failed:", error.message);
            // If table doesn't exist, it might throw a specific error, but that still proves connection to the instance.
            if (error.code === '42P01') {
                console.log("Connected to Supabase implementation, but 'assessments' table not found.");
            }
        } else {
            console.log("Successfully connected to Supabase!");
            console.log(`Found 'assessments' table. Record count: ${data === null ? 0 : 'Available (Head request)'}`);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

verifyConnection();
