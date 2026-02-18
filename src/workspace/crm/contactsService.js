
import { supabase } from '@/lib/supabase';

// --- Auth Helper ---
async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    return user;
}

// --- CRUD ---

/**
 * Fetch contacts, optionally filtered by category.
 * @param {string|null} category - 'business' | 'tax-prep' | 'career' | 'personal' | null (all)
 */
export async function getContacts(category = null) {
    await getUser();
    let query = supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Create a new contact.
 */
export async function createContact(contact) {
    const user = await getUser();
    const { data, error } = await supabase
        .from('contacts')
        .insert({ ...contact, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update an existing contact by ID.
 */
export async function updateContact(id, updates) {
    await getUser();
    const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a contact by ID.
 */
export async function deleteContact(id) {
    await getUser();
    const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Seed demo contacts for the current user (no-op if contacts already exist).
 */
export async function seedDemoContacts() {
    const { error } = await supabase.rpc('seed_demo_contacts');
    if (error) throw error;
}
