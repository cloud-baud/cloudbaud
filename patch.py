import re

with open('src/workspace/it/CmdbDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "RefreshCw\n} from 'lucide-react';",
    "RefreshCw,\n    X,\n    Save,\n    Check\n} from 'lucide-react';"
)

# 2. State and Handlers
state_additions = """    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // DETAIL PANEL STATE
    const [selectedApp, setSelectedApp] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // COLUMN VISIBILITY STATE
    const [visibleColumns, setVisibleColumns] = useState({
        appName: true,
        appId: true,
        domain: true,
        hosting: true,
        repo: true,
        status: true,
        tier: true,
        lastDeploy: false,
        buildStatus: false,
        siteId: false
    });"""
content = content.replace("    const [isCreateOpen, setIsCreateOpen] = useState(false);", state_additions)

handlers_additions = """    const handleSelectApp = (app) => {
        setSelectedApp(app);
        setEditForm({ ...app });
    };

    const handleClosePanel = () => {
        setSelectedApp(null);
        setEditForm(null);
    };

    const handleSaveApp = async () => {
        if (!editForm || !editForm.id) return;
        setIsSaving(true);
        try {
            await CmdbService.updateApp(editForm.id, {
                name: editForm.name,
                domain: editForm.domain,
                hosting: editForm.hosting,
                github_repo: editForm.github_repo,
                status: editForm.status,
                tier: editForm.tier,
                app_id: editForm.app_id
            });
            // Just refresh data silently
            const updatedApps = await CmdbService.getApps();
            setApps(updatedApps); // the fetchApps has logic to inject metadata but we don't have access to fetchApps here if we don't call it. 
            // Wait, fetchApps is in scope in the React component? Yes, handleSaveApp is just added to the component.
            // But we can just call fetchApps(). Wait, we actually can't be sure fetchApps is accessible without checking scope.
            // we will just call fetchApps() since it's defined. Wait, fetchApps is defined as React.useCallback before.
            // Oh, I am inserting this before fetchApps is defined? Let's check where the replace is happening:
            // "const isAdmin = ...;" occurs after state but before fetchApps. So fetchApps is not yet defined.
            // It's safer to just let the component handle fetchApps after update. Actually we can define handleSaveApp after fetchApps.
            // No, the handlers insertion is replacing "const isAdmin = ...", which is before fetchApps.
            // I'll move handleSaveApp and such after fetchApps in the python script.
            
"""
# Oops, need to be careful with scope. Let's do it right.
