import { supabase } from '@/shared/lib/supabase';

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
};

export const getClientCategories = async () => {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase.schema('finance').from('client_input_categories').select('*').eq('user_id', user.id).order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
};
export const getChartOfAccounts = getClientCategories;

export const getTaxEntries = async (year) => {
  if (!year) return [];
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await supabase.schema('finance').from('tax_entries').select('*, category:client_input_categories(*)').eq('user_id', user.id).eq('year', year);
  if (error) { console.error(error); return []; }
  return data || [];
};

export const updateTaxCell = async (categoryId, year, amount, notes = null) => {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.schema('finance').from('tax_entries').upsert({
    user_id: user.id, year: Number(year), category_id: categoryId, amount: amount==null?0:Number(amount), notes, updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,year,category_id' }).select().single();
  if (error) throw error;
  return data;
};

export const loadTaxState = async () => {
  const user = await getUser(); if (!user) return null;
  const { data } = await supabase.schema('finance').from('user_tax_state').select('*').eq('user_id', user.id).maybeSingle(); return data||null;
};
export const saveTaxState = async (state) => {
  const user = await getUser(); if (!user) return false;
  const { error } = await supabase.schema('finance').from('user_tax_state').upsert({ user_id: user.id, years: state.years, tax_data: state.taxData, col_widths: state.colWidths, row_heights: state.rowHeights, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }); return !error;
};

export const getMyDocuments = async (year) => {
  const user = await getUser(); if (!user) return [];
  let q = supabase.schema('finance').from('tax_documents').select('*').eq('user_id', user.id); if (year) q=q.eq('year', year);
  const { data } = await q; return data||[];
};
