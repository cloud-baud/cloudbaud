-- Function to populate default COA including Checklist items
CREATE OR REPLACE FUNCTION public.populate_default_coa()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Only populate if empty to avoid overwriting or duplicating
    IF NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE user_id = v_user_id) THEN
        INSERT INTO public.chart_of_accounts (user_id, name, code, type, section, sort_order)
        VALUES 
            -- ASSETS (1000-1999)
            -- 1000 Current Assets
            (v_user_id, 'Cash - Operating Account', '1010', 'ASSET', 'biz', 10),
            (v_user_id, 'Cash - Payroll Account', '1020', 'ASSET', 'biz', 20),
            (v_user_id, 'Cash - Savings/Reserve', '1030', 'ASSET', 'biz', 30),
            (v_user_id, 'Accounts Receivable (A/R)', '1100', 'ASSET', 'biz', 40),
            (v_user_id, 'Unbilled Receivables (WIP)', '1150', 'ASSET', 'biz', 50),
            (v_user_id, 'Prepaid Expenses', '1200', 'ASSET', 'biz', 60),
            (v_user_id, 'Employee Advances', '1300', 'ASSET', 'biz', 70),
            
            -- 1500 Fixed Assets
            (v_user_id, 'Computer Equipment', '1510', 'ASSET', 'biz', 80),
            (v_user_id, 'Accum. Depr. - Computer Equip', '1520', 'ASSET', 'biz', 90),
            (v_user_id, 'Office Furniture & Fixtures', '1530', 'ASSET', 'biz', 100),
            (v_user_id, 'Accum. Depr. - Furniture', '1540', 'ASSET', 'biz', 110),
            (v_user_id, 'Internal Software Dev (Cap)', '1600', 'ASSET', 'biz', 120),

            -- LIABILITIES (2000-2999)
            -- 2000 Current Liabilities
            (v_user_id, 'Accounts Payable (A/P)', '2010', 'LIABILITY', 'biz', 130),
            (v_user_id, 'Corp Credit Cards Payable', '2020', 'LIABILITY', 'biz', 140),
            (v_user_id, 'Accrued Expenses', '2100', 'LIABILITY', 'biz', 150),
            (v_user_id, 'Deferred Revenue', '2200', 'LIABILITY', 'biz', 160),
            (v_user_id, 'Sales Tax Payable', '2300', 'LIABILITY', 'biz', 170),
            (v_user_id, 'Payroll Liabilities', '2400', 'LIABILITY', 'biz', 180),

            -- 2700 Long-Term Liabilities
            (v_user_id, 'Business Loans', '2710', 'LIABILITY', 'biz', 190),
            (v_user_id, 'Notes Payable', '2720', 'LIABILITY', 'biz', 200),

            -- EQUITY (3000-3999)
            (v_user_id, 'Owner Capital / Equity', '3010', 'EQUITY', 'biz', 210),
            (v_user_id, 'Owner Draw / Distributions', '3020', 'EQUITY', 'biz', 220),
            (v_user_id, 'Retained Earnings', '3900', 'EQUITY', 'biz', 230),

            -- REVENUE (4000-4999)
            -- 4100 Professional Services
            (v_user_id, 'Cloud Consulting Fees', '4110', 'INCOME', 'biz', 240),
            (v_user_id, 'Fixed-Price Project Revenue', '4120', 'INCOME', 'biz', 250),
            (v_user_id, 'Imp & Migration Services', '4130', 'INCOME', 'biz', 260),
            (v_user_id, 'AI Engineering Services', '4140', 'INCOME', 'biz', 270),

            -- 4200 Managed Services
            (v_user_id, 'Managed Services (MRR)', '4210', 'INCOME', 'biz', 280),
            (v_user_id, 'DevOps Management Fees', '4220', 'INCOME', 'biz', 290),

            -- 4300 Resale & Other
            (v_user_id, 'Software/License Resale', '4310', 'INCOME', 'biz', 300),
            (v_user_id, 'Reimbursable Expense Income', '4900', 'INCOME', 'biz', 310),

            -- COGS (5000-5999)
            -- 5100 Direct Labor
            (v_user_id, 'Consultant Salaries (Billable)', '5110', 'EXPENSE', 'biz', 320),
            (v_user_id, 'Subcontractors / 1099', '5120', 'EXPENSE', 'biz', 330),
            (v_user_id, 'Billable Travel Expenses', '5130', 'EXPENSE', 'biz', 340),

            -- 5200 Direct Software
            (v_user_id, 'Client Cloud Usage (Rebilled)', '5210', 'EXPENSE', 'biz', 350),
            (v_user_id, 'Project Software Licenses', '5220', 'EXPENSE', 'biz', 360),
            (v_user_id, 'Third-Party Tooling', '5230', 'EXPENSE', 'biz', 370),

            -- EXPENSES (6000-6999)
            -- 6100 Sales & Marketing
            (v_user_id, 'Advertising & Promotion', '6110', 'EXPENSE', 'biz', 380),
            (v_user_id, 'Sales Commissions', '6120', 'EXPENSE', 'biz', 390),
            (v_user_id, 'CRM & Sales Software', '6130', 'EXPENSE', 'biz', 400),
            (v_user_id, 'Website & Hosting', '6140', 'EXPENSE', 'biz', 410),

            -- 6200 R&D
            (v_user_id, 'Training & Certifications', '6210', 'EXPENSE', 'biz', 420),
            (v_user_id, 'R&D Salaries (Non-billable)', '6220', 'EXPENSE', 'biz', 430),
            (v_user_id, 'Lab/Testing Cloud Infra', '6230', 'EXPENSE', 'biz', 440),

            -- 6300 G&A
            (v_user_id, 'Executive Salaries', '6310', 'EXPENSE', 'biz', 450),
            (v_user_id, 'Administrative Salaries', '6320', 'EXPENSE', 'biz', 460),
            (v_user_id, 'Rent & Utilities', '6330', 'EXPENSE', 'biz', 470),
            (v_user_id, 'Legal & Professional Fees', '6340', 'EXPENSE', 'biz', 480),
            (v_user_id, 'Accounting & Tax Services', '6350', 'EXPENSE', 'biz', 490),
            (v_user_id, 'Insurance (GL, E&O, Cyber)', '6360', 'EXPENSE', 'biz', 500),
            (v_user_id, 'Bank Fees & Interest', '6370', 'EXPENSE', 'biz', 510),
            (v_user_id, 'Office Supplies & Software', '6380', 'EXPENSE', 'biz', 520),

            -- PERSONAL (TAX RETURN MAPPING - Keep these as they are useful for your specific Tax Dashboard)
            (v_user_id, 'W2 Wages (Personal)', 'W2-01', 'INCOME', 'w2', 800),
            (v_user_id, 'Federal Tax Withheld', 'W2-02', 'EXPENSE', 'w2', 810),
            (v_user_id, 'Mortgage Interest (Home)', 'SCH-A1', 'EXPENSE', 'deductions', 820),
            (v_user_id, 'Real Estate Taxes (Home)', 'SCH-A2', 'EXPENSE', 'deductions', 830),
            (v_user_id, 'Charitable Contributions', 'SCH-A3', 'EXPENSE', 'deductions', 840)
        ON CONFLICT (user_id, code) DO NOTHING;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.populate_default_coa TO authenticated;
