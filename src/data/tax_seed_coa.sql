
-- Insert Initial Chart of Accounts (COA) for Tax Dashboard
-- This seed script populates the database with the user's initial financial structure

DO $$
DECLARE
    v_user_id uuid;
    v_w2_id uuid;
    v_biz_id uuid;
    v_rental_id uuid;
    v_ira_id uuid;
    v_deductions_id uuid;
    v_taxes_id uuid;
BEGIN
    -- Get the first user (FOR DEV ONLY - Remove this block in Prod or use auth.uid() in Supabase SQL Editor if logged in)
    -- select id into v_user_id from auth.users limit 1;
    -- IF NOT FOUND THEN RAISE EXCEPTION 'No user found'; END IF;

    -- NOTE: In Supabase SQL Editor, replace v_user_id with your actual User UUID.
    -- For now, this script assumes it's running in a context where auth.uid() works or you hardcode it.
    v_user_id := auth.uid(); 
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No authenticated user found in context. Subsitute your User ID here.';
        RETURN;
    END IF;

    -- Clear existing for idempotent run (Optional - be careful if data exists!)
    delete from public.chart_of_accounts where user_id = v_user_id;

    -- 1. W2 Wages
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'W2 Wages', 'INCOME', 'w2', 10),
    (v_user_id, 'Taxes Withheld', 'EXPENSE', 'w2', 20);

    -- 2. Business Income (Biz)
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '1. Comfort Foods (dba Robertos Pizza)', 'INCOME', 'biz', 10),
    (v_user_id, '2. CloudBaud LLC', 'INCOME', 'biz', 20),
    (v_user_id, '3. Teaching Income', 'INCOME', 'biz', 30),
    (v_user_id, '4. Canada Condo Sale', 'INCOME', 'biz', 40);

    -- 3. Rental Income
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '1. Olympic Court', 'INCOME', 'rental', 10),
    (v_user_id, '2. Cherry Crest', 'INCOME', 'rental', 20),
    (v_user_id, '3. Woodridge', 'INCOME', 'rental', 30);

    -- 4. IRA / Retirement
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'Jishnu Roth IRA', 'ASSET', 'ira', 10),
    (v_user_id, 'Deepika ROTH IRA', 'ASSET', 'ira', 20),
    (v_user_id, 'SEP IRA', 'ASSET', 'ira', 30),
    (v_user_id, '1099-R', 'INCOME', 'ira', 40),
    (v_user_id, 'Child Education Fund', 'ASSET', 'ira', 50);

    -- 5. Deductions
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'Real Estate Interest Woodridge', 'EXPENSE', 'deductions', 10),
    (v_user_id, 'Real Estate Interest Lake Hills', 'EXPENSE', 'deductions', 20),
    (v_user_id, 'Real Estate Interest Olympic Court', 'EXPENSE', 'deductions', 30);

    -- 6. Taxes (Real Estate)
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'Real Estate Taxes Woodridge', 'EXPENSE', 'taxes', 10),
    (v_user_id, 'Real Estate Taxes Cherry Crest', 'EXPENSE', 'taxes', 20),
    (v_user_id, 'Real Estate Taxes Lake Hills', 'EXPENSE', 'taxes', 30),
    (v_user_id, 'Real Estate Taxes Olympic Court', 'EXPENSE', 'taxes', 40),
    (v_user_id, 'Real Estate Taxes Rudins Lounge', 'EXPENSE', 'taxes', 50);

END $$;
