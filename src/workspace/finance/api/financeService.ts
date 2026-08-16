import { supabase } from '@/supabase/supabase'

export async function getMyOrgId() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('memberships').select('org_id').eq('user_id', user.id).single()
  // if your table is saas.memberships, use:
  // .schema('saas').from('memberships')...
  return data?.org_id as string // '4a7a11bc-0840-4d2d-a4fd-fc2ec0b0468c'
}

export async function getChartOfAccounts() {
  const org_id = await getMyOrgId()
  const { data, error } = await supabase
    .schema('finance')
    .from('chart_of_accounts')
    .select('*')
    .eq('org_id', org_id)
    .order('sort_order')
  if (error) throw error
  return data // 27 rows
}