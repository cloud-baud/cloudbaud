-- ============================================================================
-- SEED 2017 TAX DATA - GROUND TRUTH VALUES
-- ============================================================================
-- This script populates the tax_2017 schema with actual values from the 2017 return
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_w2_wages_id UUID;
    v_taxes_withheld_id UUID;
    v_cloudbaud_id UUID;
    v_comfort_foods_id UUID;
    v_jishnu_roth_id UUID;
    v_deepika_roth_id UUID;
    v_sep_ira_id UUID;
    v_child_ed_id UUID;
    v_re_interest_woodridge_id UUID;
    v_re_taxes_woodridge_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found. Please create a user first.';
    END IF;

    RAISE NOTICE 'Seeding 2017 tax data for user: %', v_user_id;

    -- Get category IDs from public.client_input_categories
    SELECT id INTO v_w2_wages_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'W2 Wages';
    SELECT id INTO v_taxes_withheld_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'Taxes Withheld';
    SELECT id INTO v_cloudbaud_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = '2. CloudBaud LLC';
    SELECT id INTO v_comfort_foods_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = '1. Comfort Foods (dba Robertos Pizza)';
    SELECT id INTO v_jishnu_roth_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'Jishnu Roth IRA';
    SELECT id INTO v_deepika_roth_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'Deepika ROTH IRA';
    SELECT id INTO v_sep_ira_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'SEP IRA';
    SELECT id INTO v_child_ed_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'Child Education Fund';
    SELECT id INTO v_re_interest_woodridge_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'Real Estate Interest Woodridge';
    SELECT id INTO v_re_taxes_woodridge_id FROM public.client_input_categories WHERE user_id = v_user_id AND name = 'Real Estate Taxes Woodridge';

    -- Insert 2017 values into tax_2017.client_input_values
    
    -- W2 Income
    IF v_w2_wages_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_w2_wages_id, 63132.46, 'From 2017 W2', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 63132.46, data_status = 'COMPLETE';
    END IF;

    IF v_taxes_withheld_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_taxes_withheld_id, 7909.36, 'From 2017 W2', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 7909.36, data_status = 'COMPLETE';
    END IF;

    -- Business Income
    IF v_cloudbaud_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_cloudbaud_id, 334565.42, 'Schedule C - Net Profit', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 334565.42, data_status = 'COMPLETE';
    END IF;

    IF v_comfort_foods_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_comfort_foods_id, -44581.92, 'Schedule C - Net Loss', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = -44581.92, data_status = 'COMPLETE';
    END IF;

    -- IRA Contributions
    IF v_jishnu_roth_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_jishnu_roth_id, 5500.00, 'Roth IRA Contribution', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 5500.00, data_status = 'COMPLETE';
    END IF;

    IF v_deepika_roth_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_deepika_roth_id, 5500.00, 'Roth IRA Contribution', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 5500.00, data_status = 'COMPLETE';
    END IF;

    IF v_sep_ira_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_sep_ira_id, 5244.90, 'SEP IRA Contribution', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 5244.90, data_status = 'COMPLETE';
    END IF;

    IF v_child_ed_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_child_ed_id, 4000.00, 'Child Education Fund', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 4000.00, data_status = 'COMPLETE';
    END IF;

    -- Deductions
    IF v_re_interest_woodridge_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_re_interest_woodridge_id, 17619.67, 'Form 1098 - Mortgage Interest', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 17619.67, data_status = 'COMPLETE';
    END IF;

    IF v_re_taxes_woodridge_id IS NOT NULL THEN
        INSERT INTO tax_2017.client_input_values (user_id, category_id, amount, user_notes, data_status, evidence_status)
        VALUES (v_user_id, v_re_taxes_woodridge_id, 5009.22, 'Property Tax Statement', 'COMPLETE', 'ATTACHED')
        ON CONFLICT (user_id, category_id) DO UPDATE SET amount = 5009.22, data_status = 'COMPLETE';
    END IF;

    RAISE NOTICE '✅ 2017 tax data seeded successfully!';

END $$;
