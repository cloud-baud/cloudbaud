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
  "seattletechnical",
  "rudinsholding",
  "rudinsacademy",
  "rudinsstart",
  "rudinsreach",
  "fifasocial.live",
  "ageless.lifestyle",
  "famloop",
  "usjobs.tech",
  "NRIEssentials.com"
]

content = ""

for index, domain in enumerate(domains):
    app_id = f"APP-{str(index + 1).zfill(3)}"
    name = domain.split('.')[0].replace('com', '').capitalize()
    domain_ext = domain if '.' in domain else domain + ".com"
    content += f"""    {{
        name: '{name}',
        domain: '{domain_ext}',
        hosting: 'Netlify',
        status: '{'Active' if index < 4 else 'Development'}',
        tier: '{'Production' if index < 4 else 'Staging'}',
        app_id: '{app_id}'
    }},\n"""

# Let's save a sql insert script instead
sql_content = "INSERT INTO cmdb_applications (name, domain, hosting, status, tier, app_id) VALUES\n"
for index, domain in enumerate(domains):
    app_id = f"APP-{str(index + 1).zfill(3)}"
    name = domain.split('.')[0]
    if len(name) > 0:
        name = name[0].upper() + name[1:]
    
    domain_ext = domain if '.' in domain else domain + ".com"
    status = 'Active' if index < 4 else 'Development'
    tier = 'Production' if index < 4 else 'Staging'
    
    is_last = index == len(domains) - 1
    term = ";" if is_last else ","
    sql_content += f"('{name}', '{domain_ext}', 'Netlify', '{status}', '{tier}', '{app_id}'){term}\n"

with open("seed_cmdb.sql", "w") as f:
    f.write(sql_content)

print("Generated seed_cmdb.sql")

