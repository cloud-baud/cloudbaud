import re

with open('src/workspace/it/CmdbDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const [searchTerm, setSearchTerm] = useState('');\n", "")
content = content.replace("app.name.toLowerCase().includes(searchTerm.toLowerCase()) || \n        (app.domain && app.domain.toLowerCase().includes(searchTerm.toLowerCase()))", "true")
content = content.replace(
"""                    {/* 1. Search Input */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search apps..." 
                            className="w-64 pl-9 bg-card"
                        />
                    </div>""", "{/* Removed redundant Search Input */}")

with open('src/workspace/it/CmdbDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
