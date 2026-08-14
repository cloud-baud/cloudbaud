import re
import json

domains = [
  "jishnunath.com",
  "cloudbaud.com",
  "rudrajabrahmins.org",
  "legalbench.in",
  "mergers365.in",
  "systemsdesign.tech",
  "synolic.tech",
  "sqlhealth.pro",
  "seattletechnical.com",
  "rudinsholding.com",
  "rudinsacademy.com",
  "rudinsstart.com",
  "rudinsreach.com",
  "fifasocial.live",
  "ageless.lifestyle",
  "famloop.com",
  "usjobs.tech",
  "NRIEssentials.com"
]

metadata_str = "{\n"
for index, domain in enumerate(domains):
    app_id = f"APP-{str(index + 1).zfill(3)}"
    name = domain.split('.')[0]
    if len(name) > 0:
        name = name[0].upper() + name[1:]
    
    status = 'Active' if index < 4 else 'Development'
    tier = 'Production' if index < 4 else 'Staging'

    metadata_str += f"""    '{domain}': {{
        app_id: '{app_id}',
        name: '{name}',
        status: '{status}',
        tier: '{tier}',
        hosting: 'Netlify'
    }},
"""
metadata_str += "}"

with open('src/workspace/it/CmdbDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()


old_loop = """            // Iterate over hardcoded metadata and upsert to DB
            for (const [domain, meta] of Object.entries(NETLIFY_METADATA)) {
                // Find existing app by domain to get other fields if needed, or just upsert known fields
                // We'll trust upsertAppByDomain to handle the merge/creation
                
                // Map component fields to DB snake_case
                const dbPayload = {
                    domain: domain,
                    // If creating new, we might need name etc, but for now we assume these apps exist or we are just updating metadata
                    // Ideally we should match existing apps.
                    screenshot_url: meta.screenshot,
                    admin_url: meta.adminUrl,
                    site_id: meta.siteId,
                    last_deploy_at: meta.lastDeploy,
                    build_status: meta.buildStatus,
                    github_repo: meta.repoUrl
                };"""

new_loop = """            // Iterate over hardcoded metadata and upsert to DB
            for (const [domain, meta] of Object.entries({...SEED_METADATA, ...NETLIFY_METADATA})) {
                const dbPayload = {
                    domain: domain,
                    ...(meta.name && { name: meta.name }),
                    ...(meta.app_id && { app_id: meta.app_id }),
                    ...(meta.status && { status: meta.status }),
                    ...(meta.tier && { tier: meta.tier }),
                    ...(meta.hosting && { hosting: meta.hosting }),
                    ...(meta.screenshot && { screenshot_url: meta.screenshot }),
                    ...(meta.adminUrl && { admin_url: meta.adminUrl }),
                    ...(meta.siteId && { site_id: meta.siteId }),
                    ...(meta.lastDeploy && { last_deploy_at: meta.lastDeploy }),
                    ...(meta.buildStatus && { build_status: meta.buildStatus }),
                    ...(meta.repoUrl && { github_repo: meta.repoUrl })
                };"""

if old_loop in content:
    content = content.replace(old_loop, new_loop)
else:
    print("WARNING: Could not find old_loop")
    import sys
    sys.exit(1)

inject = f"const SEED_METADATA = {metadata_str};\n\n"
if "const NETLIFY_METADATA = {" in content:
    content = content.replace("const NETLIFY_METADATA = {", inject + "const NETLIFY_METADATA = {")
else:
    print("WARNING: Could not find NETLIFY_METADATA dict")
    import sys
    sys.exit(1)

with open('src/workspace/it/CmdbDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched successfully")
