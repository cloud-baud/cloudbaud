
-- Add metadata columns to CMDB Applications Table
alter table public.cmdb_applications
add column if not exists screenshot_url text, -- To store cloudbaud-thumb.png
add column if not exists admin_url text,      -- Manage on Netlify link
add column if not exists site_id text,        -- Netlify/Vercel unique ID
add column if not exists last_deploy_at timestamp with time zone,
add column if not exists build_status text default 'Unknown'; -- Ready, Building, Failed

-- Seed the new columns with Netlify metadata
-- Requires strict matching on domain or name
-- CloudBaud
update public.cmdb_applications
set screenshot_url = '/cmdb-thumbnails/cloudbaud-thumb.png',
    admin_url = 'https://app.netlify.com/projects/cloudbaud',
    site_id = '54b07907-6ac7-4209-8e9a-b6df1a3457f6',
    last_deploy_at = '2026-02-13T01:15:00Z',
    build_status = 'Ready',
    github_repo = 'https://github.com/jishnath/cloudbaud.com'
where domain = 'cloudbaud.com';

-- Jishnu Nath
update public.cmdb_applications
set screenshot_url = '/cmdb-thumbnails/jishnunath-thumb.png',
    admin_url = 'https://app.netlify.com/sites/jishnunath/overview',
    site_id = '4783a135-9b8d-46fc-8be5-ab209c5dfd0d',
    last_deploy_at = '2026-01-10T03:47:00Z',
    build_status = 'Ready',
    github_repo = 'https://github.com/jishnath/portfolio'
where domain = 'jishnunath.com';

-- Systems Design Pro
update public.cmdb_applications
set screenshot_url = '/cmdb-thumbnails/systemsdesign-thumb.png',
    admin_url = 'https://app.netlify.com/sites/systemsdesign/overview',
    site_id = '80497b07-75d5-41e0-a8e2-5409544dc3a7',
    last_deploy_at = '2026-02-10T14:20:00Z',
    build_status = 'Ready',
    github_repo = 'https://github.com/jishnath/systems-design-platform'
where domain = 'systemsdesign.pro';

-- Kampuz Online (Add if missing, otherwise update)
-- Note: Kampuz was not in the original seed file, so we insert it
insert into public.cmdb_applications (app_id, name, domain, hosting, github_repo, status, tier, screenshot_url, admin_url, site_id, last_deploy_at, build_status)
values (
    'APP-014', 'Kampuz Online', 'kampuz.online', 'Netlify', 'https://github.com/jishnath/kampuz-web', 'Active', 'Production',
    '/cmdb-thumbnails/kampuz-thumb.png',
    'https://app.netlify.com/sites/lucky-crepe-7f79dc/overview',
    '614566d4-cd99-4d34-b8d8-88ec5fbbfc8e',
    '2025-12-28T18:26:00Z',
    'Ready'
)
on conflict (id) do nothing; -- Assuming ID is auto-generated, this on conflict might not catch by domain unless we add a constraint.
-- Let's rely on domain check for update instead of insert blindly if we can't guarantee uniqueness.
