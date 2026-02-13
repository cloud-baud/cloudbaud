import { supabase } from '@/lib/supabase';

export const CmdbService = {
    // READ: Get all apps
    getApps: async () => {
        const { data, error } = await supabase
            .from('cmdb_applications')
            .select('*')
            .order('app_id', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    // CREATE: Add new app
    createApp: async (appData) => {
        const { data, error } = await supabase
            .from('cmdb_applications')
            .insert([appData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // UPDATE: Update app details
    updateApp: async (id, updates) => {
        const { data, error } = await supabase
            .from('cmdb_applications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // DELETE: Remove app
    deleteApp: async (id) => {
        const { error } = await supabase
            .from('cmdb_applications')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
