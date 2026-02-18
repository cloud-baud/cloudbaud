
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  Calendar, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal,
  ArrowUpRight,
  RefreshCw,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Menu,
  DatabaseZap,
  X,
  Save,
  CreditCard,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { getContacts, createContact, updateContact, deleteContact, seedDemoContacts } from './contactsService';
import { inviteContact, getWorkspaceTree, buildTree } from '../services/workspaceService';
import { cn } from '@/lib/utils';
import { Separator } from '@/shared/ui/separator';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/shared/ui/dropdown-menu';

const TABS = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: BarChart },
];

const CATEGORIES = [
  { id: null, label: 'All', color: 'bg-slate-500' },
  { id: 'business', label: 'Business', color: 'bg-blue-500' },
  { id: 'tax-prep', label: 'Tax Prep', color: 'bg-amber-500' },
  { id: 'career', label: 'Career', color: 'bg-emerald-500' },
  { id: 'personal', label: 'Personal', color: 'bg-purple-500' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const EMPTY_CONTACT = {
  name: '', company: '', title: '', email: '', phone: '',
  address: '', website: '',
  category: 'business', tags: [], notes: ''
};

const CrmDashboard = () => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CONTACT);
  const [inviteTarget, setInviteTarget] = useState(null); // contact being invited
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);

  // --- Data Loading ---
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContacts(activeCategory);
      setContacts(data);
    } catch (err) {
      setError(err.message);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // --- Search Filter (client-side on loaded data) ---
  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q)
    );
  });

  // --- Category Stats ---
  const categoryCounts = contacts.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  // --- Form Handlers ---
  const openNewForm = () => {
    setEditingContact(null);
    setFormData({ ...EMPTY_CONTACT, category: activeCategory || 'business' });
    setShowForm(true);
  };

  const openEditForm = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      company: contact.company || '',
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      category: contact.category || 'business',
      tags: contact.tags || [],
      notes: contact.notes || ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
      } else {
        await createContact(formData);
      }
      setShowForm(false);
      setEditingContact(null);
      setFormData(EMPTY_CONTACT);
      await loadContacts();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await deleteContact(id);
      await loadContacts();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSeed = async () => {
    try {
      await seedDemoContacts();
      await loadContacts();
    } catch (err) {
      alert(`Seed failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] dark:bg-[#0f0f0f] text-slate-900 dark:text-slate-100 font-sans">
      {/* CRM App Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center px-4 h-12 shadow-sm relative">
          {/* Brand */}
          <div className="flex items-center gap-3 mr-6">
            <div className="w-8 h-8 bg-[#0176D3] rounded-md flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <span className="font-bold text-xs tracking-tighter">CRM</span>
            </div>
            <span className="font-semibold text-lg tracking-tight hidden md:block text-slate-800 dark:text-slate-100">
              Contacts
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 h-full border-b-2 text-sm font-medium transition-all whitespace-nowrap",
                    isActive 
                      ? "border-[#0176D3] text-[#0176D3]" 
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#0176D3]" : "text-slate-400")} />
                  {tab.label}
                  {isActive && <ChevronDown className="w-3 h-3 ml-1 opacity-50" />}
                </button>
              );
            })}
          </nav>

          {/* Global Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="Seed demo contacts" onClick={handleSeed}>
              <DatabaseZap className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="Refresh" onClick={loadContacts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Split Pane when form is open */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Main Content */}
        <div className={cn("flex-1 overflow-auto p-4 lg:p-6 bg-slate-50 dark:bg-[#0f0f0f]", showForm && "border-r border-slate-200 dark:border-slate-800")}>
          {activeTab === 'home' && <HomeView contacts={contacts} categoryCounts={categoryCounts} />}
          {activeTab === 'contacts' && (
            <ContactsView
              contacts={filteredContacts}
              loading={loading}
              error={error}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onNew={openNewForm}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onRefresh={loadContacts}
              onInvite={(contact) => setInviteTarget(contact)}
            />
          )}
        </div>

        {/* Right: Form Panel (inline split) */}
        {showForm && (
          <div className="w-[380px] shrink-0 flex flex-col bg-white dark:bg-[#1a1a1a] animate-in slide-in-from-right duration-200">
            <ContactFormPanel
              formData={formData}
              setFormData={setFormData}
              isEditing={!!editingContact}
              onSave={handleSave}
              onClose={() => { setShowForm(false); setEditingContact(null); }}
            />
          </div>
        )}
      </div>

      {/* Invite to Workspace Dialog */}
      {inviteTarget && (
        <InviteDialog
          contact={inviteTarget}
          onClose={() => setInviteTarget(null)}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          inviteLoading={inviteLoading}
          setInviteLoading={setInviteLoading}
        />
      )}
    </div>
  );
};

/* ============================================= */
/* --- Sub Components ---                        */
/* ============================================= */

const HomeView = ({ contacts, categoryCounts }) => {
  const pieData = CATEGORIES
    .filter(c => c.id)
    .map(c => ({ name: c.label, value: categoryCounts[c.id] || 0 }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contact Overview</h1>
        <div className="text-sm text-slate-500 font-medium">{contacts.length} total contacts</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.filter(c => c.id).map((cat) => (
          <div key={cat.id} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className={cn("absolute top-0 left-0 w-1 h-full", cat.color, "opacity-100")} />
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{cat.label}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{categoryCounts[cat.id] || 0}</div>
            <div className="text-xs text-slate-400">contacts</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Category Distribution</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-2xl font-bold">{contacts.length}</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Recently Added
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.id} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between group cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    {contact.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-[#0176D3]">{contact.name}</div>
                    <div className="text-xs text-slate-500">{contact.company} • {contact.category}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-normal">{contact.category}</Badge>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">No contacts yet. Use the seed button to add demo data.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const getCategoryColor = (category) => {
  switch(category) {
    case 'business':  return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20';
    case 'tax-prep':  return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/20';
    case 'career':    return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/20';
    case 'personal':  return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20';
    default:          return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-500/20';
  }
};

const ContactsView = ({ contacts, loading, error, activeCategory, setActiveCategory, searchQuery, setSearchQuery, onNew, onEdit, onDelete, onRefresh, onInvite }) => (
  <div className="space-y-4 h-full flex flex-col max-w-[1600px] mx-auto">
    {/* Toolbar */}
    <div className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-md", getCategoryColor(activeCategory || 'business'))}>
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Contacts</h2>
          <div className="text-xs text-slate-500">{contacts.length} records</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 h-9 w-64 bg-slate-50 border-slate-200"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button className="h-9 bg-[#0176D3] hover:bg-[#0176D3]/90 text-white shadow-sm font-semibold" onClick={onNew}>
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>
    </div>

    {/* Category Filter Chips */}
    <div className="flex items-center gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id || 'all'}
          onClick={() => setActiveCategory(cat.id)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
            activeCategory === cat.id
              ? "bg-[#0176D3] text-white border-[#0176D3] shadow-sm"
              : "bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0176D3] hover:text-[#0176D3]"
          )}
        >
          <span className={cn("inline-block w-2 h-2 rounded-full mr-1.5", cat.color)} />
          {cat.label}
        </button>
      ))}
    </div>

    {/* Error State */}
    {error && (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    )}

    {/* Table */}
    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
            <tr>
              <th className="p-4 w-10"><input type="checkbox" className="rounded border-slate-300" /></th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading contacts...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  No contacts found. Click <strong>New</strong> to add one or use the <DatabaseZap className="inline h-4 w-4" /> seed button.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", getCategoryColor(contact.category))}>
                        {contact.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-[#0176D3] hover:underline cursor-pointer" onClick={() => onEdit(contact)}>
                        {contact.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{contact.company || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{contact.title || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{contact.email || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{contact.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={cn("font-normal text-[10px]", getCategoryColor(contact.category))}>
                      {contact.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(contact.tags || []).map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0176D3] opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(contact)}>
                          <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInvite(contact)}>
                          <UserPlus className="h-3.5 w-3.5 mr-2" /> Invite to Workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(contact.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-black/20 mt-auto">
        <div>Showing {contacts.length} contacts • Sorted by Name</div>
      </div>
    </div>
  </div>
);


/* --- Inline Form Panel with AI Business Card Scan --- */
const ContactFormPanel = ({ formData, setFormData, isEditing, onSave, onClose }) => {
  const [showCardInput, setShowCardInput] = React.useState(false);
  const [cardText, setCardText] = React.useState('');
  const [scanning, setScanning] = React.useState(false);
  const [scanError, setScanError] = React.useState(null);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const scanBusinessCard = async () => {
    if (!cardText.trim()) return;
    setScanning(true);
    setScanError(null);

    const prompt = `Extract contact information from this business card text and return ONLY a valid JSON object with these exact keys: name, company, title, email, phone, address, website, category, notes.

For category, choose the best match from: "business", "tax-prep", "career", "personal". Default to "business" if unclear.
For address, include full street address, city, state, zip.
For website, include any URL or web address found.
For notes, include any remaining info not captured by other fields.
If a field is not found, use an empty string "".

Business card text:
---
${cardText}
---

Return ONLY the JSON object, no markdown fences, no explanation.`;

    try {
      const endpoint = localStorage.getItem('ai_endpoint') || 'http://localhost:11434/api/chat';
      const model = localStorage.getItem('ai_model') || 'llama3.1:8b';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });

      if (!res.ok) throw new Error('Ollama returned an error. Is it running?');

      const data = await res.json();
      let content = data.message?.content || '';

      // Clean markdown fences if present
      content = content.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(content);

      // Auto-fill the form
      setFormData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        company: parsed.company || prev.company,
        title: parsed.title || prev.title,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
        address: parsed.address || prev.address,
        website: parsed.website || prev.website,
        category: ['business', 'tax-prep', 'career', 'personal'].includes(parsed.category) ? parsed.category : prev.category,
        notes: parsed.notes || prev.notes,
      }));

      setShowCardInput(false);
      setCardText('');
    } catch (err) {
      setScanError(err.message.includes('JSON') ? 'AI returned invalid data. Try again or enter manually.' : err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {isEditing ? 'Edit Contact' : 'New Contact'}
        </h2>
        <div className="flex items-center gap-1">
          {!isEditing && (
            <Button
              variant={showCardInput ? "default" : "outline"}
              size="sm"
              className={cn("h-8 text-xs gap-1.5", showCardInput && "bg-[#0176D3] text-white")}
              onClick={() => setShowCardInput(!showCardInput)}
            >
              <CreditCard className="h-3.5 w-3.5" />
              {showCardInput ? 'Manual' : 'Scan Card'}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Business Card Scanner */}
      {showCardInput && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-500/5 space-y-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-[#0176D3]">
            <Sparkles className="h-3.5 w-3.5" />
            Paste business card text below — AI will extract the fields
          </div>
          <textarea
            className="w-full h-28 px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0176D3] resize-none font-mono"
            value={cardText}
            onChange={e => setCardText(e.target.value)}
            placeholder={"John Smith\nSenior Developer\nAcme Corp\njohn.smith@acme.com\n(555) 123-4567\n123 Main St, Seattle WA"}
            autoFocus
          />
          {scanError && (
            <div className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {scanError}
            </div>
          )}
          <Button
            className="w-full h-9 bg-[#0176D3] hover:bg-[#0176D3]/90 text-white text-xs font-semibold"
            onClick={scanBusinessCard}
            disabled={scanning || !cardText.trim()}
          >
            {scanning ? (
              <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Extracting with AI...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Extract Contact Info</>
            )}
          </Button>
        </div>
      )}

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Name *</label>
          <Input value={formData.name} onChange={e => update('name', e.target.value)} placeholder="Full name" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Company</label>
          <Input value={formData.company} onChange={e => update('company', e.target.value)} placeholder="Organization" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Title</label>
          <Input value={formData.title} onChange={e => update('title', e.target.value)} placeholder="Job title" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
            <Input value={formData.email} onChange={e => update('email', e.target.value)} placeholder="email@..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</label>
            <Input value={formData.phone} onChange={e => update('phone', e.target.value)} placeholder="555-..." />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category *</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.filter(c => c.id).map(cat => (
              <button
                key={cat.id}
                onClick={() => update('category', cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  formData.category === cat.id
                    ? "bg-[#0176D3] text-white border-[#0176D3]"
                    : "bg-white dark:bg-[#252525] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Address</label>
          <Input value={formData.address || ''} onChange={e => update('address', e.target.value)} placeholder="123 Main St, City, State ZIP" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Website</label>
          <Input value={formData.website || ''} onChange={e => update('website', e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tags</label>
          <Input
            value={(formData.tags || []).join(', ')}
            onChange={e => update('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="cpa, primary, active (comma-separated)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</label>
          <textarea
            className="w-full h-20 px-3 py-2 text-sm bg-white dark:bg-[#252525] border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0176D3] resize-none"
            value={formData.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-[#0176D3] hover:bg-[#0176D3]/90 text-white" onClick={onSave} disabled={!formData.name}>
          <Save className="h-4 w-4 mr-1" />
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </>
  );
};

// --- Invite Dialog with Tree Picker ---
const InviteDialog = ({ contact, onClose, inviteRole, setInviteRole, inviteLoading, setInviteLoading }) => {
  const [tree, setTree] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null); // { id, name, type }
  const [expanded, setExpanded] = useState({});
  const [treeLoading, setTreeLoading] = useState(true);

  useEffect(() => {
    getWorkspaceTree()
      .then(data => {
        setTree(buildTree(data));
        // Auto-expand all collections
        const exp = {};
        data.forEach(w => { if (w.type === 'hub' || w.type === 'collection') exp[w.id] = true; });
        setExpanded(exp);
      })
      .catch(err => console.error('Failed to load workspace tree:', err))
      .finally(() => setTreeLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const typeLabel = (type) => {
    switch (type) {
      case 'hub': return { text: 'HUB', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' };
      case 'collection': return { text: 'COLLECTION', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' };
      case 'site': return { text: 'SITE', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' };
      default: return { text: type, color: 'text-slate-500 bg-slate-100' };
    }
  };

  const renderNode = (node, depth = 0) => {
    const tl = typeLabel(node.type);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    const isSelected = selectedWs?.id === node.id;

    return (
      <div key={node.id}>
        <button
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all",
            isSelected
              ? "bg-[#0176D3]/10 border border-[#0176D3] text-[#0176D3]"
              : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
          )}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => {
            setSelectedWs({ id: node.id, name: node.name, type: node.type });
            if (hasChildren) toggle(node.id);
          }}
        >
          {hasChildren && (
            <ChevronDown className={cn("h-3 w-3 transition-transform shrink-0", !isExpanded && "-rotate-90")} />
          )}
          {!hasChildren && <span className="w-3" />}
          <span>{node.icon}</span>
          <span className="font-medium truncate">{node.name}</span>
          <span className={cn("ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono uppercase", tl.color)}>
            {tl.text}
          </span>
        </button>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            <UserPlus className="inline h-4 w-4 mr-2 text-[#0176D3]" />
            Invite to Workspace
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-400">
          Invite <span className="font-medium text-slate-800 dark:text-slate-200">{contact.name}</span> to collaborate.
        </div>

        {/* Workspace Tree */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Select Workspace</label>
          <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 p-1 space-y-0.5">
            {treeLoading ? (
              <div className="text-center text-xs text-slate-400 py-4">Loading workspaces...</div>
            ) : (
              tree.map(root => renderNode(root))
            )}
          </div>
          {selectedWs && (
            <div className="text-[10px] text-slate-400">
              {selectedWs.type === 'hub' && '⚠️ Hub access grants access to ALL workspaces'}
              {selectedWs.type === 'collection' && `📁 Access to all sites within ${selectedWs.name}`}
              {selectedWs.type === 'site' && `📄 Access to ${selectedWs.name} only`}
            </div>
          )}
        </div>

        {/* Role Picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Access Level</label>
          <div className="flex gap-2">
            {[
              { id: 'viewer', label: 'View & Chat', desc: 'Can see data and send messages' },
              { id: 'editor', label: 'Edit & Chat', desc: 'Can modify data and send messages' },
            ].map(r => (
              <button
                key={r.id}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg border text-left transition-all",
                  inviteRole === r.id
                    ? "border-[#0176D3] bg-[#0176D3]/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                )}
                onClick={() => setInviteRole(r.id)}
              >
                <div className={cn("text-xs font-medium", inviteRole === r.id ? "text-[#0176D3]" : "text-slate-700 dark:text-slate-300")}>{r.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={inviteLoading}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-[#0176D3] hover:bg-[#0176D3]/90 text-white"
            disabled={inviteLoading || !selectedWs}
            onClick={async () => {
              try {
                setInviteLoading(true);
                await inviteContact(selectedWs.id, contact.id, inviteRole);
                onClose();
                alert(`✅ ${contact.name} invited to ${selectedWs.name} as ${inviteRole}`);
              } catch (err) {
                alert(`❌ Failed to invite: ${err.message}`);
              } finally {
                setInviteLoading(false);
              }
            }}
          >
            {inviteLoading ? 'Inviting...' : selectedWs ? `Invite to ${selectedWs.name}` : 'Select a workspace'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrmDashboard;
