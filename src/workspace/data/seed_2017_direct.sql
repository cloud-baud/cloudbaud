-- Seed 2017 tax data for jish.nath@cloudbaud.com
-- Run via psql with postgres superuser

BEGIN;

DO $$
DECLARE
  v_user_id UUID := '5fde0377-205a-4430-8dc2-d9ec15a50270';
  v_w2_wages UUID := gen_random_uuid();
  v_biz_income UUID := gen_random_uuid();
  v_cloudbaud_gross UUID := gen_random_uuid();
  v_cloudbaud_expenses UUID := gen_random_uuid();
  v_comfort_net UUID := gen_random_uuid();
  v_cap_gains UUID := gen_random_uuid();
  v_int_div UUID := gen_random_uuid();
  v_ira_dist UUID := gen_random_uuid();
  v_se_tax_ded UUID := gen_random_uuid();
  v_sep_ira UUID := gen_random_uuid();
  v_se_health UUID := gen_random_uuid();
  v_mortgage_int UUID := gen_random_uuid();
  v_re_taxes UUID := gen_random_uuid();
  v_state_local UUID := gen_random_uuid();
  v_charity UUID := gen_random_uuid();
  v_medical UUID := gen_random_uuid();
  v_jishnu_roth UUID := gen_random_uuid();
  v_deepika_roth UUID := gen_random_uuid();
  v_k401 UUID := gen_random_uuid();
  v_child_ed UUID := gen_random_uuid();
  v_taxable_income UUID := gen_random_uuid();
  v_income_tax UUID := gen_random_uuid();
  v_se_tax UUID := gen_random_uuid();
  v_fed_withheld UUID := gen_random_uuid();
  v_est_payments UUID := gen_random_uuid();
BEGIN
  -- Clean up existing seed data
  DELETE FROM finance.tax_entries WHERE user_id = v_user_id AND year = 2017;
  DELETE FROM finance.tax_carryforwards WHERE user_id = v_user_id AND origin_year = 2017;
  DELETE FROM finance.chart_of_accounts WHERE user_id = v_user_id AND form_line IS NOT NULL;

  -- ══ CHART OF ACCOUNTS — INCOME ══
  INSERT INTO finance.chart_of_accounts 
    (id, user_id, name, type, section, sort_order, form_line, return_schedule, category, is_computed, is_expandable) 
  VALUES
    (v_w2_wages, v_user_id, 'Wages, Salaries, Tips', 'INCOME', 'income', 10, 
     'Line 7', '2017_Form_1040.pdf', 'W-2', false, false),
    (v_biz_income, v_user_id, 'Business Income (Schedule C)', 'INCOME', 'income', 20, 
     'Line 12', '2017_Schedule_C_CloudBaud.pdf', 'Schedule C', true, true),
    (v_cloudbaud_gross, v_user_id, 'CloudBaud LLC - Gross Revenue', 'INCOME', 'income', 21, 
     NULL, '2017_Schedule_C_CloudBaud.pdf', '1099-MISC', false, false),
    (v_cloudbaud_expenses, v_user_id, 'CloudBaud LLC - Business Expenses', 'EXPENSE', 'income', 22, 
     NULL, '2017_Schedule_C_CloudBaud.pdf', 'Schedule C Pt II', false, false),
    (v_comfort_net, v_user_id, 'Comfort Foods (dba Robertos) - Net Loss', 'INCOME', 'income', 23, 
     NULL, '2017_Schedule_C_Robertos.pdf', 'Schedule C', false, false),
    (v_cap_gains, v_user_id, 'Capital Gains (Schedule D)', 'INCOME', 'income', 30, 
     'Line 13', '2017_Schedule_D_Capital_Gains.pdf', '1099-B / Schedule D', false, false),
    (v_int_div, v_user_id, 'Interest and Dividends', 'INCOME', 'income', 40, 
     'Lines 8a/9a', '2017-Fidelity-7692-Consolidated-Form-1099.pdf', '1099-INT/DIV', false, false),
    (v_ira_dist, v_user_id, 'IRA Distributions / Pensions', 'INCOME', 'income', 50, 
     'Lines 15-16', NULL, '1099-R', false, false);

  -- Set parent references for Schedule C children
  UPDATE finance.chart_of_accounts SET parent_id = v_biz_income 
  WHERE id IN (v_cloudbaud_gross, v_cloudbaud_expenses, v_comfort_net);

  -- ══ CHART OF ACCOUNTS — ADJUSTMENTS ══
  INSERT INTO finance.chart_of_accounts 
    (id, user_id, name, type, section, sort_order, form_line, return_schedule, category, is_computed) 
  VALUES
    (v_se_tax_ded, v_user_id, 'Deductible Self-Employment Tax (50%)', 'EXPENSE', 'adjustments', 10, 
     'Line 27', NULL, 'Computed', true),
    (v_sep_ira, v_user_id, 'SEP IRA Contribution', 'EXPENSE', 'adjustments', 20, 
     'Line 28', NULL, 'Form 5498', false),
    (v_se_health, v_user_id, 'Self-Employed Health Insurance', 'EXPENSE', 'adjustments', 30, 
     'Line 29', NULL, '1095-B', false);

  -- ══ CHART OF ACCOUNTS — ITEMIZED DEDUCTIONS ══
  INSERT INTO finance.chart_of_accounts 
    (id, user_id, name, type, section, sort_order, form_line, return_schedule, category) 
  VALUES
    (v_mortgage_int, v_user_id, 'Mortgage Interest - Woodridge', 'EXPENSE', 'deductions', 10, 
     'Sched A, Line 10', '2017_Schedule_A_Itemized_Deductions.pdf', 'Form 1098'),
    (v_re_taxes, v_user_id, 'Real Estate Taxes - Woodridge', 'EXPENSE', 'deductions', 20, 
     'Sched A, Line 6', '2017_Schedule_A_Itemized_Deductions.pdf', 'Property Tax Statement'),
    (v_state_local, v_user_id, 'State and Local Taxes Paid', 'EXPENSE', 'deductions', 30, 
     'Sched A, Line 5', '2017_Schedule_A_Itemized_Deductions.pdf', 'W-2 Box 17 / Estimates'),
    (v_charity, v_user_id, 'Charitable Contributions', 'EXPENSE', 'deductions', 40, 
     'Sched A, Line 16', '2017_Schedule_A_Itemized_Deductions.pdf', 'Receipts'),
    (v_medical, v_user_id, 'Medical and Dental Expenses', 'EXPENSE', 'deductions', 50, 
     'Sched A, Line 1', '2017_Schedule_A_Itemized_Deductions.pdf', 'HSA / 1099-SA');

  -- ══ CHART OF ACCOUNTS — RETIREMENT ══
  INSERT INTO finance.chart_of_accounts 
    (id, user_id, name, type, section, sort_order, category) 
  VALUES
    (v_jishnu_roth, v_user_id, 'Jishnu Roth IRA', 'ASSET', 'retirement', 10, 'Form 5498'),
    (v_deepika_roth, v_user_id, 'Deepika Roth IRA', 'ASSET', 'retirement', 20, 'Form 5498'),
    (v_k401, v_user_id, '401(k) Contributions', 'ASSET', 'retirement', 30, 'W-2 Box 12'),
    (v_child_ed, v_user_id, 'Child Education Fund (529)', 'ASSET', 'retirement', 40, 'Form 5498-ESA');

  -- ══ CHART OF ACCOUNTS — TAX COMPUTATION ══
  INSERT INTO finance.chart_of_accounts 
    (id, user_id, name, type, section, sort_order, form_line, return_schedule, category, is_computed) 
  VALUES
    (v_taxable_income, v_user_id, 'Taxable Income', 'INCOME', 'computation', 10, 
     'Line 43', '2017_Form_1040.pdf', 'AGI - Deductions - Exemptions', true),
    (v_income_tax, v_user_id, 'Income Tax', 'EXPENSE', 'computation', 20, 
     'Line 44', '2017_Form_1040.pdf', 'Tax Tables', true),
    (v_se_tax, v_user_id, 'Self-Employment Tax', 'EXPENSE', 'computation', 30, 
     'Line 57', '2017_Schedule_SE_Self_Employment.pdf', 'Schedule SE', true);

  -- ══ CHART OF ACCOUNTS — PAYMENTS ══
  INSERT INTO finance.chart_of_accounts 
    (id, user_id, name, type, section, sort_order, form_line, return_schedule, category) 
  VALUES
    (v_fed_withheld, v_user_id, 'Federal Income Tax Withheld', 'EXPENSE', 'payments', 10, 
     'Line 64', '2017_Form_1040.pdf', 'W-2 Box 2'),
    (v_est_payments, v_user_id, 'Estimated Tax Payments', 'EXPENSE', 'payments', 20, 
     'Line 65', '2017_Form_1040.pdf', 'Form 1040-ES');

  -- ══ TAX ENTRIES — 2017 AMOUNTS ══
  INSERT INTO finance.tax_entries 
    (user_id, account_id, year, amount, verified, source, status) 
  VALUES
    (v_user_id, v_w2_wages, 2017, 63132.46, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_biz_income, 2017, 202410.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_cloudbaud_gross, 2017, 334565.42, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_cloudbaud_expenses, 2017, -132155.42, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_comfort_net, 2017, -44581.92, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_cap_gains, 2017, -3000.00, true, 'AI_EXTRACTED', 'FINAL'),
    (v_user_id, v_se_tax_ded, 2017, 10597.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_sep_ira, 2017, 5244.90, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_mortgage_int, 2017, 17619.67, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_re_taxes, 2017, 5009.22, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_jishnu_roth, 2017, 5500.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_deepika_roth, 2017, 5500.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_k401, 2017, 3428.48, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_child_ed, 2017, 4000.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_taxable_income, 2017, 175798.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_income_tax, 2017, 36108.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_se_tax, 2017, 21194.00, true, 'CPA_VERIFIED', 'FINAL'),
    (v_user_id, v_fed_withheld, 2017, 7909.36, true, 'CPA_VERIFIED', 'FINAL');

  -- ══ CARRYFORWARDS — 2017 Capital Loss ══
  INSERT INTO finance.tax_carryforwards 
    (user_id, carry_type, origin_year, original_amount, applied_year, applied_amount, remaining, notes)
  VALUES
    (v_user_id, 'CAPITAL_LOSS', 2017, -76555.00, 2017, -3000.00, -73555.00, 
     'Net LT capital loss from Fidelity account. 3000 max deduction per IRC 1211(b).');

  RAISE NOTICE 'Seed complete: 24 COA items, 18 entries, 1 carryforward';
END;
$$;

COMMIT;
