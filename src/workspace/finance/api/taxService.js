import { supabaseAuth } from '@/shared/lib/supabase';
const getUser = async () => {
  const { data: { session } } = await supabaseAuth.auth.getSession();
  return session?.user || null;
};
export const getClientCategories = async () => {
  const user = await getUser();
  const client = supabaseAuth;
  let q = client.schema('finance').from('client_input_categories').select('*').order('sort_order', { ascending: true });
  if (user) q = q.eq('user_id', user.id);
  const { data, error } = await q;
  if (error) {
    console.error('COA error', error);
    // fallback to chart_of_accounts
    const { data: d2 } = await client.schema('finance').from('chart_of_accounts').select('*').order('sort_order', { ascending: true });
    return d2 || [];
  }
  return data || [];
};
export const getChartOfAccounts = getClientCategories;
export const getTaxEntries = async (year) => {
  const user = await getUser(); if (!user) return [];
  const { data } = await supabaseAuth.schema('finance').from('tax_entries').select('*, category:client_input_categories(*)').eq('user_id', user.id).eq('year', year);
  return data||[];
};
export const updateTaxCell = async (categoryId, year, amount, notes=null) => {
  const user = await getUser(); if (!user) throw new Error('Not auth');
  const { data, error } = await supabaseAuth.schema('finance').from('tax_entries').upsert({ user_id: user.id, year: Number(year), category_id: categoryId, amount: Number(amount)||0, notes, updated_at: new Date().toISOString() }, { onConflict: 'user_id,year,category_id' }).select().single();
  if (error) throw error; return data;
};
export const loadTaxState = async () => {
  const user = await getUser(); if (!user) return null;
  const { data } = await supabaseAuth.schema('finance').from('user_tax_state').select('*').eq('user_id', user.id).maybeSingle(); return data;
};
export const saveTaxState = async (state) => {
  const user = await getUser(); if (!user) return false;
  const { error } = await supabaseAuth.schema('finance').from('user_tax_state').upsert({ user_id: user.id, years: state.years, tax_data: state.taxData, col_widths: state.colWidths, row_heights: state.rowHeights, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return!error;
};
export const getMyDocuments = async (year) => {
  const user = await getUser(); if (!user) return [];
  let q = supabaseAuth.schema('finance').from('tax_documents').select('*').eq('user_id', user.id); if (year) q=q.eq('year', year);
  const { data } = await q; return data||[];
};
