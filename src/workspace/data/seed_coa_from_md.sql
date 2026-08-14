
-- Insert Chart of Accounts from User Provided Markdown
-- Maps typical IT Consulting hierarchy to our Tax Dashboard sections

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get the most recently created user as the "Owner".
    select id into v_user_id from auth.users order by created_at desc limit 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No user found in auth.users. Skipping seed data.';
        RETURN;
    END IF;

    -- Clear existing to avoid duplicates in this specific seed run
    delete from public.chart_of_accounts where user_id = v_user_id;

    -- 1. ASSETS (Mapped to 'biz' for now or a new 'assets' section if we want balance sheet view)
    -- For Tax Dashboard, we mostly care about Income/Expense, but let's store them for completeness
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '1010 Cash - Operating Account', 'ASSET', 'biz', 1010),
    (v_user_id, '1100 Accounts Receivable (A/R)', 'ASSET', 'biz', 1100),
    (v_user_id, '1510 Computer Equipment', 'ASSET', 'biz', 1510);

    -- 2. REVENUE (Income) -> 'biz' Section
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '4110 Cloud Consulting Fees', 'INCOME', 'biz', 4110),
    (v_user_id, '4120 Fixed-Price Project Revenue', 'INCOME', 'biz', 4120),
    (v_user_id, '4140 AI Engineering Services', 'INCOME', 'biz', 4140),
    (v_user_id, '4210 Managed Services (MRR)', 'INCOME', 'biz', 4210),
    (v_user_id, '4310 Software/License Resale', 'INCOME', 'biz', 4310);

    -- 3. COGS (Direct Expenses) -> 'biz' Section (Negative values usually)
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '5110 Consultant Salaries (Billable)', 'EXPENSE', 'biz', 5110),
    (v_user_id, '5120 Subcontractors / 1099', 'EXPENSE', 'biz', 5120),
    (v_user_id, '5210 Client Cloud Usage (Rebilled)', 'EXPENSE', 'biz', 5210),
    (v_user_id, '5220 Project Software Licenses', 'EXPENSE', 'biz', 5220);

    -- 4. OPERATING EXPENSES (OpEx) -> 'deductions' or 'biz' 
    -- We'll put them in 'biz' as expenses for the P&L view
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '6110 Advertising & Promotion', 'EXPENSE', 'biz', 6110),
    (v_user_id, '6130 CRM & Sales Software', 'EXPENSE', 'biz', 6130),
    (v_user_id, '6140 Website & Hosting', 'EXPENSE', 'biz', 6140),
    (v_user_id, '6210 Training & Certifications', 'EXPENSE', 'biz', 6210),
    (v_user_id, '6230 Lab/Testing Infrastructure', 'EXPENSE', 'biz', 6230),
    (v_user_id, '6330 Rent & Utilities', 'EXPENSE', 'biz', 6330),
    (v_user_id, '6340 Legal & Professional Fees', 'EXPENSE', 'biz', 6340),
    (v_user_id, '6350 Accounting & Tax Services', 'EXPENSE', 'biz', 6350),
    (v_user_id, '6360 Insurance (Liability/Cyber)', 'EXPENSE', 'biz', 6360),
    (v_user_id, '6370 Bank Fees', 'EXPENSE', 'biz', 6370),
    (v_user_id, '6380 Office Supplies & Software', 'EXPENSE', 'biz', 6380);

    -- 5. PERSONAL / OTHER (Keep existing Personal categories)
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'W2 Wages (Personal)', 'INCOME', 'w2', 10),
    (v_user_id, 'Taxes Withheld (Personal)', 'EXPENSE', 'w2', 20),
    (v_user_id, 'Mortgage Interest (Personal)', 'EXPENSE', 'deductions', 10),
    (v_user_id, 'Real Estate Taxes (Personal)', 'EXPENSE', 'taxes', 10);

END $$;
