// src/workspace/finance/api/taxService.js - FIXED for V2 + getYearReturns
import { supabaseAuth } from '@/shared/lib/supabase';

export const VIEW_AS_KEY = 'finance_view_as_user_id';

const getUser = async () => {
  const { data: { session } } = await supabaseAuth.auth.getSession();
  return session?.user || null;
};

export const getEffectiveUserId = async () => {
  try {
    const viewAs = localStorage.getItem(VIEW_AS_KEY);
    if (viewAs) return viewAs;
  } catch {}
  const user = await getUser();
  return user?.id || null;
};

const getMembership = async (userId) => {
  if (!userId) return null;
  const { data } = await supabaseAuth.schema('saas').from('memberships').select('org_id, role').eq('user_id', userId).single();
  return data;
};

export const getClientCategories = async () => {
  const effectiveUserId = await getEffectiveUserId();
  if (!effectiveUserId) return [];
  const membership = await getMembership(effectiveUserId);
  const client = supabaseAuth;
  let q = client.schema('finance').from('client_input_categories').select('*').order('sort_order', { ascending: true });
  if (membership?.org_id) q = q.eq('org_id', membership.org_id);
  else q = q.eq('user_id', effectiveUserId);
  const { data, error } = await q;
  if (error) {
    console.error('COA error', error);
    let q2 = client.schema('finance').from('chart_of_accounts').select('*').order('sort_order', { ascending: true });
    if (membership?.org_id) q2 = q2.eq('org_id', membership.org_id);
    else q2 = q2.eq('user_id', effectiveUserId);
    const { data: d2 } = await q2;
    return d2 || [];
  }
  return data || [];
};

export const getChartOfAccounts = getClientCategories;
export const fetchCOA = getClientCategories;
export const getCOA = getClientCategories;
export const listAccounts = getClientCategories;
export const getAccounts = getClientCategories;

export const createAccount = async ({ name, type, section }) => {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  const effectiveUserId = await getEffectiveUserId();
  const membership = await getMembership(effectiveUserId);
  if (!membership?.org_id) throw new Error('No org_id');
  const payload = {
    org_id: membership.org_id,
    user_id: user.id,
    name: name.trim(),
    type,
    section: section || null,
    sort_order: 999,
  };
  let { data, error } = await supabaseAuth.schema('finance').from('client_input_categories').insert(payload).select().single();
  if (!error) return data;
  const { data: d2, error: e2 } = await supabaseAuth.schema('finance').from('chart_of_accounts').insert(payload).select().single();
  if (e2) throw e2;
  return d2;
};

export const deleteAccount = async (id) => {
  const effectiveUserId = await getEffectiveUserId();
  const membership = await getMembership(effectiveUserId);
  if (!membership?.org_id) throw new Error('No org_id');
  let { error } = await supabaseAuth.schema('finance').from('client_input_categories').delete().eq('id', id).eq('org_id', membership.org_id);
  if (!error) return true;
  const { error: e2 } = await supabaseAuth.schema('finance').from('chart_of_accounts').delete().eq('id', id).eq('org_id', membership.org_id);
  if (e2) throw e2;
  return true;
};

export const getTaxEntries = async (year) => {
  const effectiveUserId = await getEffectiveUserId();
  if (!effectiveUserId) return [];
  const membership = await getMembership(effectiveUserId);
  if (!membership?.org_id) return [];
  const { data } = await supabaseAuth.schema('finance').from('tax_entries')
    .select('*, category:client_input_categories(*)')
    .eq('org_id', membership.org_id)
    .eq('year', year);
  return data||[];
};

// --- V2 FIX: missing function that TaxDashboard expects ---
export const getYearReturns = async (year) => {
  const effectiveUserId = await getEffectiveUserId();
  if (!effectiveUserId) return [];
  const membership = await getMembership(effectiveUserId);
  if (!membership?.org_id) return [];
  // try multiple table names that might exist
  const tables = ['tax_returns', 'year_returns', 'tax_year_returns', 'returns'];
  for (const tbl of tables) {
    try {
      let q = supabaseAuth.schema('finance').from(tbl).select('*').eq('org_id', membership.org_id);
      if (year) q = q.eq('year', year);
      const { data, error } = await q;
      if (!error && data) return data;
    } catch {}
  }
  // fallback: derive from tax_entries
  if (year) return getTaxEntries(year);
  return [];
};

export const getTaxReturns = getYearReturns;
export const listReturns = getYearReturns;
export const fetchYearReturns = getYearReturns;

export const updateTaxCell = async (categoryId, year, amount, notes=null) => {
  const user = await getUser(); 
  if (!user) throw new Error('Not auth');
  const effectiveUserId = await getEffectiveUserId();
  const membership = await getMembership(effectiveUserId);
  if (!membership?.org_id) throw new Error('No org');
  const { data, error } = await supabaseAuth.schema('finance').from('tax_entries')
    .upsert({ 
      org_id: membership.org_id, 
      user_id: user.id,
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
  const effectiveUserId = await getEffectiveUserId();
  if (!effectiveUserId) return null;
  const membership = await getMembership(effectiveUserId);
  if (!membership?.org_id) return null;
  const { data } = await supabaseAuth.schema('finance').from('user_tax_state')
    .select('*').eq('org_id', membership.org_id).maybeSingle(); 
  return data;
};

export const saveTaxState = async (state) => {
  const user = await getUser(); 
  if (!user) return false;
  const effectiveUserId = await getEffectiveUserId();
  const membership = await getMembership(effectiveUserId);
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
  return !error;
};

export const getMyDocuments = async (year) => {
  const effectiveUserId = await getEffectiveUserId();
  if (!effectiveUserId) return [];
  const membership = await getMembership(effectiveUserId);
  if (!membership?.org_id) return [];
  let q = supabaseAuth.schema('finance').from('tax_documents').select('*').eq('org_id', membership.org_id); 
  if (year) q=q.eq('year', year);
  const { data } = await q; return data||[];
};

export const setViewAs = (userId) => {
  if (userId) localStorage.setItem(VIEW_AS_KEY, userId);
  else localStorage.removeItem(VIEW_AS_KEY);
};
export const getViewAs = () => {
  try { return localStorage.getItem(VIEW_AS_KEY); } catch { return null; }
};

export const uploadTaxDocument = async (file, year, categoryId = null) => {
  const userId = await getEffectiveUserId();
  const filePath = `${userId}/${year}/${Date.now()}_${file.name}`;
  const { error: upErr } = await supabaseAuth.storage.from('tax-docs').upload(filePath, file);
  if (upErr) throw upErr;
  const { data, error: dbErr } = await supabaseAuth.from('tax_documents').insert({
    user_id: userId,
    year,
    category_id: categoryId,
    file_name: file.name,
    storage_path: filePath,
    file_size: file.size,
    mime_type: file.type,
  }).select().single();
  if (dbErr) throw dbErr;
  return data;
};

export const linkDocumentToCell = async (docId, categoryId, year) => {
  const { error } = await supabaseAuth.from('tax_documents').update({ category_id: categoryId, year }).eq('id', docId);
  if (error) throw error;
  return true;
};
