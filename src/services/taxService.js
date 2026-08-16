// src/services/taxService.js - FIXED (org_id, not user_id)
import { supabaseAuth } from '@/shared/lib/supabase';

const getUser = async () => {
  const { data: { session } } = await supabaseAuth.auth.getSession();
  return session?.user || null;
};

const getMembership = async (userId) => {
  if (!userId) return null;
  const { data } = await supabaseAuth.schema('saas').from('memberships').select('org_id, role').eq('user_id', userId).single();
  return data; // { org_id: '4a7a11bc-0840-4d2d-a4fd-fc2ec0b0468c' }
};

export const getClientCategories = async () => {
  const user = await getUser();
  if (!user) return [];
  const membership = await getMembership(user.id);
  const client = supabaseAuth;
  
  let q = client.schema('finance').from('client_input_categories').select('*').order('sort_order', { ascending: true });
  // FIX: use org_id, not user_id - so David sees your org
  if (membership?.org_id) q = q.eq('org_id', membership.org_id);
  else if (user) q = q.eq('user_id', user.id); // fallback for old data

  const { data, error } = await q;
  if (error) {
    console.error('COA error', error);
    // fallback to chart_of_accounts with org_id
    let q2 = client.schema('finance').from('chart_of_accounts').select('*').order('sort_order', { ascending: true });
    if (membership?.org_id) q2 = q2.eq('org_id', membership.org_id);
    const { data: d2 } = await q2;
    return d2 || [];
  }
  return data || [];
};

export const getChartOfAccounts = getClientCategories;

export const getTaxEntries = async (year) => {
  const user = await getUser(); if (!user) return [];
  const membership = await getMembership(user.id);
  if (!membership?.org_id) return [];
  const { data } = await supabaseAuth.schema('finance').from('tax_entries')
    .select('*, category:client_input_categories(*)')
    .eq('org_id', membership.org_id)
    .eq('year', year); // year comes from URL, not hardcoded
  return data||[];
};

export const updateTaxCell = async (categoryId, year, amount, notes=null) => {
  const user = await getUser(); if (!user) throw new Error('Not auth');
  const membership = await getMembership(user.id);
  if (!membership?.org_id) throw new Error('No org');
  const { data, error } = await supabaseAuth.schema('finance').from('tax_entries')
    .upsert({ 
      org_id: membership.org_id, 
      user_id: user.id, // keep for audit, but query by org_id
      year: Number(year), 
      category_id: categoryId, 
      amount: Number(amount)||0, 
      notes, 
      updated_at: new Date().toISOString() 
    }, { onConflict: 'org_id,year,category_id' })
    .select().single();
  if (error) throw error; return data;
};

export const loadTaxState = async () => {
  const user = await getUser(); if (!user) return null;
  const membership = await getMembership(user.id);
  if (!membership?.org_id) return null;
  const { data } = await supabaseAuth.schema('finance').from('user_tax_state')
    .select('*').eq('org_id', membership.org_id).maybeSingle(); 
  return data;
};

export const saveTaxState = async (state) => {
  const user = await getUser(); if (!user) return false;
  const membership = await getMembership(user.id);
  if (!membership?.org_id) return false;
  const { error } = await supabaseAuth.schema('finance').from('user_tax_state')
    .upsert({ 
      org_id: membership.org_id,
      user_id: user.id,
      years: state.years, 
      tax_data: state.taxData, 
      col_widths: state.colWidths, 
      row_heights: state.rowHeights, 
      updated_at: new Date().toISOString() 
    }, { onConflict: 'org_id' });
  return!error;
};

export const getMyDocuments = async (year) => {
  const user = await getUser(); if (!user) return [];
  const membership = await getMembership(user.id);
  if (!membership?.org_id) return [];
  let q = supabaseAuth.schema('finance').from('tax_documents').select('*').eq('org_id', membership.org_id); 
  if (year) q=q.eq('year', year);
  const { data } = await q; return data||[];
};