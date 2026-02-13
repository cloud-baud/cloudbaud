import { supabase } from '@/lib/supabase';

export const CalendarService = {
    // READ: Get events within a date range
    getEvents: async (startDate, endDate) => {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .gte('start_time', startDate)
            .lte('end_time', endDate);
        
        if (error) throw error;
        return data;
    },

    // CREATE: Add a new event
    createEvent: async (event) => {
        const { data, error } = await supabase
            .from('calendar_events')
            .insert([event])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },

    // UPDATE: Update an existing event
    updateEvent: async (id, updates) => {
        const { data, error } = await supabase
            .from('calendar_events')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // DELETE: Remove an event
    deleteEvent: async (id) => {
        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

export const BookingService = {
    // READ: Get public availability rules
    getAvailability: async () => {
        const { data, error } = await supabase
            .from('booking_availability')
            .select('*')
            .eq('is_active', true);
            
        if (error) throw error;
        return data;
    },

    // READ: Get busy slots (Already implemented as a view/query in DB, but abstracted here)
    getBusyTimes: async (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
            .from('calendar_events') // Using table directly as RLS permits public read of busy times via policy or view
            .select('start_time, end_time')
            .gte('end_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());

        if (error) throw error;
        return data;
    },

    // CREATE: Public booking submission
    createBooking: async (bookingDetails) => {
        const { name, email, notes, startTime, endTime } = bookingDetails;
        
        const { data, error } = await supabase
            .from('calendar_events')
            .insert([{
                title: `Meeting: ${name}`,
                description: `Booked via Portal.\nEmail: ${email}\nNotes: ${notes}`,
                start_time: startTime,
                end_time: endTime,
                category: 'Meeting',
                user_email: email
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
