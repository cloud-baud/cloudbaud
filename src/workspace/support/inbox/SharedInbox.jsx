import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MessageSquare, Mail, Smartphone, Search, Filter, 
  Folder, Star, Clock, AlertCircle, ArrowLeft, 
  Send, MoreVertical, Archive, User, Tag, Paperclip,
  CheckCircle2, Reply, Forward, ShieldCheck, Play,
  FilePlus, Trash2, ShieldBan, ReplyAll, Calendar, MoreHorizontal,
  Zap, Users, FolderOutput, FileCog, BookOpen, Flag, Contact, Volume2, Languages, LayoutGrid, ChevronDown, Check, Bell,
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Pause, UserPlus, X, Edit2, ChevronRight, Grid, Tv, RefreshCw
} from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'sonner';
import { InboxEmptyState } from './InboxEmptyState';
import { InboxProviderWizard } from './InboxProviderWizard';
import './StandardInbox.css';

// --- DEFAULT MOCK DATA ---
const defaultMockMessages = [
  {
    id: 'mock_1',
    channel: 'email_outlook',
    from: 'Alice Smith',
    fromHandle: 'alice.smith@example.com',
    subject: 'CloudBaud Platform Customization Inquiry',
    preview: 'Hi, I saw your capability details page and would love to schedule a demo...',
    content: 'Hi CloudBaud Team,\n\nI was looking at your capabilities page regarding Agentic AI workflows. We are a medium-sized retail operations business and want to integrate custom agents for order fulfillment triage.\n\nCould we set up a call this week?\n\nBest,\nAlice',
    time: '10:42 AM',
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    priority: 'high',
    status: 'new',
    legalCategory: 'AI Engineering'
  },
  {
    id: 'mock_2',
    channel: 'whatsapp',
    from: 'David Miller',
    fromHandle: '+1 425 749 2101',
    subject: 'WhatsApp Inquiry',
    preview: 'Hey, does your CRM support real-time lead updates?',
    content: 'Hey, does your CRM support real-time lead updates?',
    time: 'Yesterday',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    priority: 'medium',
    status: 'assigned',
    isWhatsAppThread: true,
    whatsAppMessages: [
      { id: 'w1', text: 'Hello, looking for a demo of the CloudBaud cockpit CRM.', time: 'Yesterday 2:15 PM', isFromClient: true },
      { id: 'w2', text: 'Hi David! We can arrange that. What industry is your business in?', time: 'Yesterday 2:30 PM', isFromClient: false },
      { id: 'w3', text: 'We are in logistics. Does your CRM support real-time lead updates?', time: 'Yesterday 3:00 PM', isFromClient: true }
    ]
  },
  {
    id: 'mock_3',
    channel: 'telegram',
    from: 'Arthur McDanger',
    fromHandle: 'Telegram (+1 425 749 2101)',
    subject: 'Telegram Inquiry',
    preview: 'Is the API sandbox ready for testing?',
    content: 'Is the API sandbox ready for testing?',
    time: '2 hours ago',
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    priority: 'high',
    status: 'new',
    isWhatsAppThread: true,
    whatsAppMessages: [
      { id: 't1', text: 'Hello CloudBaud support, checking on client portal integration.', time: 'Today 3:00 PM', isFromClient: true },
      { id: 't2', text: 'Hi Arthur, we are setting it up right now. You should receive credentials soon.', time: 'Today 3:15 PM', isFromClient: false },
      { id: 't3', text: 'Awesome. Is the API sandbox ready for testing?', time: 'Today 3:20 PM', isFromClient: true }
    ],
    legalCategory: 'IT Operations'
  }
];

const mockConnectedProviders = [
  { id: 'outlook_1', type: 'email_outlook', label: 'cloud.baud@outlook.com', isActive: true, connectedAt: new Date() },
  { id: 'gmail_1', type: 'email_gmail', label: 'cloud9baud@gmail.com', isActive: true, connectedAt: new Date() },
  { id: 'resend_1', type: 'email_imap', label: 'jish.nath@cloudbaud.com (Resend)', isActive: true, connectedAt: new Date() },
  { id: 'whatsapp_1', type: 'whatsapp', label: 'WhatsApp (+1 425 749 2101)', isActive: true, connectedAt: new Date() },
  { id: 'sms_1', type: 'sms', label: 'SMS (+1 425 749 2101)', isActive: true, connectedAt: new Date() },
  { id: 'telegram_1', type: 'telegram', label: 'Telegram (+1 425 749 2101)', isActive: true, connectedAt: new Date() }
];

export function SharedInbox({ dbMessages = [], onRefresh, loading }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Navigation State
  const [activeRibbonTab, setActiveRibbonTab] = useState('Home');
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(false);
  const [showFolderPane, setShowFolderPane] = useState(true);
  const [readingPanePosition, setReadingPanePosition] = useState('right');

  // Dialpad Layout and Calling Simulation States
  const [isDialpadView, setIsDialpadView] = useState(() => {
    const saved = localStorage.getItem('inbox_isDialpadView');
    return saved !== null ? saved === 'true' : false; // Default to classic Outlook
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [isAiActive, setIsAiActive] = useState(true);
  const [callTime, setCallTime] = useState(256); // 4 min 16 sec
  const [openAccordion, setOpenAccordion] = useState('profile');
  const [dialpadSearch, setDialpadSearch] = useState('');
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  // Connection State
  const [providers, setProviders] = useState(() => {
    try {
      const saved = localStorage.getItem('inbox_providers');
      return saved ? JSON.parse(saved) : mockConnectedProviders;
    } catch (e) {
      return mockConnectedProviders;
    }
  });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedWizardProvider, setSelectedWizardProvider] = useState(null);

  // Synchronize providers dynamically when changed in settings
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('inbox_providers');
        if (saved) setProviders(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const [activeChannel, setActiveChannel] = useState(() => localStorage.getItem('inbox_activeChannel') || 'all');
  const [activeFolder, setActiveFolder] = useState(() => localStorage.getItem('inbox_activeFolder') || 'inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeArrangeBy, setActiveArrangeBy] = useState(() => localStorage.getItem('inbox_activeArrangeBy') || 'Date');
  const [activeSortOrder, setActiveSortOrder] = useState(() => localStorage.getItem('inbox_activeSortOrder') || 'newest');

  // Local storage mapping functions
  const getLocalState = (id, key, defaultValue) => {
    try {
      const states = JSON.parse(localStorage.getItem('inbox_message_states') || '{}');
      if (states[id] && states[id][key] !== undefined) {
        return states[id][key];
      }
    } catch (e) {}
    return defaultValue;
  };

  const setLocalState = (id, key, value) => {
    try {
      const states = JSON.parse(localStorage.getItem('inbox_message_states') || '{}');
      if (!states[id]) states[id] = {};
      states[id][key] = value;
      localStorage.setItem('inbox_message_states', JSON.stringify(states));
    } catch (e) {}
  };

  // Sync dbMessages prop into local state
  const mappedMessages = useMemo(() => {
    if (!dbMessages || dbMessages.length === 0) return [];
    
    return dbMessages.map(msg => {
      const id = msg.id;
      
      let channel = 'email_imap';
      if (msg.provider === 'twilio' || msg.provider === 'sms') {
        channel = 'sms';
      } else if (msg.provider === 'whatsapp') {
        channel = 'whatsapp';
      } else if (msg.provider === 'telegram') {
        channel = 'telegram';
      } else if (msg.provider === 'email_gmail' || msg.provider === 'gmail') {
        channel = 'email_gmail';
      } else if (msg.provider === 'email_outlook' || msg.provider === 'outlook') {
        channel = 'email_outlook';
      }
      
      const isStarred = getLocalState(id, 'isStarred', false);
      const isRead = getLocalState(id, 'isRead', false);
      const status = getLocalState(id, 'status', 'new');
      
      const content = msg.text_body || msg.html_body || '';
      
      return {
        id,
        channel,
        from: msg.from_name || msg.from_email || 'Unknown sender',
        fromHandle: msg.from_email || '',
        subject: msg.subject || '(No subject)',
        preview: msg.text_body ? msg.text_body.slice(0, 200) : (msg.html_body ? msg.html_body.replace(/<[^>]+>/g, ' ').slice(0, 200) : 'No content preview'),
        content,
        time: msg.received_at ? new Date(msg.received_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
        isRead,
        isStarred,
        hasAttachment: false,
        priority: 'medium',
        status,
        legalCategory: msg.provider === 'resend' || msg.provider === 'email_imap' ? 'General Support' : (msg.provider === 'telegram' ? 'Telegram Support' : 'IT Operations')
      };
    });
  }, [dbMessages]);

  useEffect(() => {
    if (mappedMessages.length > 0) {
      setMessages(mappedMessages);
    } else {
      setMessages(defaultMockMessages);
    }
  }, [mappedMessages]);

  useEffect(() => {
    localStorage.setItem('inbox_isDialpadView', isDialpadView.toString());
  }, [isDialpadView]);

  useEffect(() => {
    let timer;
    if (!isOnHold && !isCallEnded && isDialpadView) {
      timer = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOnHold, isCallEnded, isDialpadView]);

  // Persist settings to LocalStorage
  useEffect(() => {
    localStorage.setItem('inbox_activeChannel', activeChannel);
    localStorage.setItem('inbox_activeFolder', activeFolder);
    localStorage.setItem('inbox_activeArrangeBy', activeArrangeBy);
    localStorage.setItem('inbox_activeSortOrder', activeSortOrder);
  }, [activeChannel, activeFolder, activeArrangeBy, activeSortOrder]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleConnectAccount = (type, name, icon, color, bg) => {
    setSelectedWizardProvider({ id: crypto.randomUUID(), type, name, icon, color, bg });
    setWizardOpen(true);
  };

  const handleMockAction = (actionName) => {
    toast(`Simulated: ${actionName}`);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredMessages.map(m => m.id);
    const allSelected = allFilteredIds.every(id => selectedIds.has(id));
    
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        allFilteredIds.forEach(id => next.delete(id));
      } else {
        allFilteredIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // --- ACTIONS ---
  const handleDelete = () => {
    const idsToDelete = selectedIds.size > 0 ? Array.from(selectedIds) : (selectedMessage ? [selectedMessage.id] : []);
    if (idsToDelete.length === 0) return;
    
    idsToDelete.forEach(id => {
      setLocalState(id, 'status', 'deleted');
    });
    
    setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));
    setSelectedIds(new Set());
    
    if (selectedMessage && idsToDelete.includes(selectedMessage.id)) {
      setSelectedMessage(null);
    }
    
    toast.success(idsToDelete.length === 1 ? "Message deleted" : `${idsToDelete.length} messages deleted`);
  };

  const handleArchive = () => {
    const idsToArchive = selectedIds.size > 0 ? Array.from(selectedIds) : (selectedMessage ? [selectedMessage.id] : []);
    if (idsToArchive.length === 0) return;
    
    idsToArchive.forEach(id => {
      setLocalState(id, 'status', 'closed');
    });
    
    setMessages(prev => prev.map(m => idsToArchive.includes(m.id) ? { ...m, status: 'closed' } : m));
    setSelectedIds(new Set());
    
    if (selectedMessage && idsToArchive.includes(selectedMessage.id)) {
      setSelectedMessage(null);
    }
    
    toast.success(idsToArchive.length === 1 ? "Message archived" : `${idsToArchive.length} messages archived`);
  };

  const handleToggleRead = () => {
    const idsToToggle = selectedIds.size > 0 ? Array.from(selectedIds) : (selectedMessage ? [selectedMessage.id] : []);
    if (idsToToggle.length === 0) return;
    
    const currentMsg = messages.find(m => m.id === idsToToggle[0]);
    if (!currentMsg) return;
    const nextRead = !currentMsg.isRead;
    
    idsToToggle.forEach(id => {
      setLocalState(id, 'isRead', nextRead);
    });
    
    setMessages(prev => prev.map(m => idsToToggle.includes(m.id) ? { ...m, isRead: nextRead } : m));
    
    if (selectedMessage && idsToToggle.includes(selectedMessage.id)) {
      setSelectedMessage(prev => prev ? { ...prev, isRead: nextRead } : null);
    }
    
    toast.info(nextRead ? "Marked as read" : "Marked as unread");
  };

  const handleToggleFlag = () => {
    const idsToToggle = selectedIds.size > 0 ? Array.from(selectedIds) : (selectedMessage ? [selectedMessage.id] : []);
    if (idsToToggle.length === 0) return;
    
    const currentMsg = messages.find(m => m.id === idsToToggle[0]);
    if (!currentMsg) return;
    const nextStarred = !currentMsg.isStarred;
    
    idsToToggle.forEach(id => {
      setLocalState(id, 'isStarred', nextStarred);
    });
    
    setMessages(prev => prev.map(m => idsToToggle.includes(m.id) ? { ...m, isStarred: nextStarred } : m));
    
    if (selectedMessage && idsToToggle.includes(selectedMessage.id)) {
      setSelectedMessage(prev => prev ? { ...prev, isStarred: nextStarred } : null);
    }
  };

  const toggleStar = (e, id) => {
    e.stopPropagation();
    const isStarred = getLocalState(id, 'isStarred', false);
    const nextStarred = !isStarred;
    setLocalState(id, 'isStarred', nextStarred);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: nextStarred } : m));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(prev => prev ? { ...prev, isStarred: nextStarred } : null);
    }
  };

  const markAsRead = (id) => {
    const isRead = getLocalState(id, 'isRead', false);
    if (!isRead) {
      setLocalState(id, 'isRead', true);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, isRead: true } : null);
      }
    }
  };
  
  const focusReplyBox = () => {
    const textarea = document.querySelector('textarea[placeholder^="Reply"]');
    if (textarea) {
       textarea.focus();
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    const replyBody = replyText.trim();
    setReplyText('');
    
    const toastId = toast.loading("Sending reply...");
    
    try {
      const { supabase } = await import('@/shared/lib/supabase');
      const { error } = await supabase.from('communications_inbox').insert({
        provider: 'resend',
        direction: 'outbound',
        subject: `Re: ${selectedMessage.subject}`,
        text_body: replyBody,
        from_email: 'hello@cloudbaud.com',
        to_emails: [selectedMessage.fromHandle],
        received_at: new Date().toISOString(),
        raw_payload: { source: 'inbox_reply', reply_to_id: selectedMessage.id }
      });
      
      if (error) throw error;
      
      toast.success("Reply sent and logged successfully!", { id: toastId });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.success("Logged reply locally (offline mode)", { id: toastId });
      
      // Update local thread UI
      if (selectedMessage.isWhatsAppThread || selectedMessage.channel === 'whatsapp' || selectedMessage.channel === 'sms' || selectedMessage.channel === 'telegram') {
        const updatedMessage = {
          ...selectedMessage,
          whatsAppMessages: [
            ...(selectedMessage.whatsAppMessages || []),
            { id: Math.random().toString(), text: replyBody, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), isFromClient: false }
          ]
        };
        setMessages(prev => prev.map(m => m.id === selectedMessage.id ? updatedMessage : m));
        setSelectedMessage(updatedMessage);
      }
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Globally filter out deleted items
      if (msg.status === 'deleted') return false;

      // Search filter
      const matchesSearch = !searchQuery || 
        msg.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (!matchesSearch) return false;

      // Channel filter
      if (activeChannel !== 'all') {
        if (activeChannel === 'email_outlook' || activeChannel === 'email_gmail' || activeChannel === 'email_imap') {
          if (!msg.channel.startsWith('email')) return false;
        } else {
          if (msg.channel !== activeChannel) return false;
        }
      }

      // Folder filter
      switch (activeFolder) {
        case 'inbox': return msg.status === 'new' || msg.status === 'assigned';
        case 'starred': return msg.isStarred;
        case 'assigned': return msg.status === 'assigned';
        case 'archive': return msg.status === 'closed';
        default: return true;
      }
    });
  }, [messages, searchQuery, activeChannel, activeFolder]);

  const getChannelConfig = (channel) => {
    switch(channel) {
      case 'email_outlook': return { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-900/30', label: 'Outlook' };
      case 'email_gmail': return { icon: Mail, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-900/30', label: 'Gmail' };
      case 'email_imap': return { icon: Mail, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-800', label: 'Email' };
      case 'whatsapp': return { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-900/30', label: 'WhatsApp' };
      case 'sms': return { icon: Smartphone, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-900/30', label: 'SMS' };
      case 'telegram': return { icon: Send, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-900/30', label: 'Telegram' };
      default: return { icon: Mail, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-800', label: 'Email' };
    }
  };

  const renderTab = (tabId, label) => {
    const isActive = activeRibbonTab === tabId;
    return (
      <div 
        onClick={() => {
          if (tabId === 'File') {
            setActiveRibbonTab('File');
            return;
          }
          if (isActive) {
            setIsRibbonCollapsed(!isRibbonCollapsed);
          } else {
            setActiveRibbonTab(tabId);
            setIsRibbonCollapsed(false);
          }
        }}
        className={`px-4 py-1.5 text-xs font-semibold cursor-pointer rounded-t-sm transition-colors select-none ${
          isActive && !isRibbonCollapsed && tabId !== 'File'
            ? 'bg-slate-850 text-blue-400 border-t-2 border-blue-500' 
            : tabId === 'File' 
              ? 'text-white hover:opacity-90'
              : 'hover:bg-slate-800 text-slate-400 border-t-2 border-transparent'
        }`}
        style={tabId === 'File' ? { backgroundColor: '#0f6cbd' } : undefined}
      >
        {label}
      </div>
    );
  };

  if (providers.length === 0) {
    return <InboxEmptyState />;
  }

  if (activeRibbonTab === 'File') {
    return (
      <div className="flex w-full h-full bg-slate-900 font-sans rounded-xl overflow-hidden shadow-lg border border-slate-800">
        {/* Left Sidebar */}
        <div className="w-[180px] bg-slate-950 text-slate-100 flex flex-col pt-4">
          <div 
            className="flex items-center px-4 mb-6 cursor-pointer hover:bg-slate-900 py-2 w-16"
            onClick={() => setActiveRibbonTab('Home')}
          >
            <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
               <ArrowLeft className="h-4 w-4 text-slate-100" strokeWidth={2} />
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-blue-600 px-4 py-3 flex items-center space-x-3 cursor-pointer">
              <Mail className="h-5 w-5 text-white" strokeWidth={1.5} />
              <span className="text-[15px] font-medium text-white">Info</span>
            </div>
            <div className="px-4 py-3 flex items-center space-x-3 hover:bg-slate-900 cursor-pointer text-slate-400 hover:text-white mt-2 border-b border-slate-800 pb-4">
               <Folder className="h-5 w-5" strokeWidth={1.5} />
               <span className="text-[15px]">Open & Export</span>
            </div>
            <div className="px-4 py-3 flex items-center space-x-3 hover:bg-slate-900 cursor-pointer text-slate-400 hover:text-white mt-2">
               <FilePlus className="h-5 w-5" strokeWidth={1.5} />
               <span className="text-[15px]">Save As</span>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-slate-900 p-10 overflow-y-auto">
          <h1 className="text-3xl font-normal text-slate-200 mb-8 tracking-tight">Account Information</h1>
          
          <div className="max-w-2xl bg-slate-950 border border-slate-800 flex items-center justify-between p-2.5 mb-4 rounded-lg">
             <div className="flex items-center space-x-3 pl-2">
               <Mail className="h-6 w-6 text-blue-400" />
               <div>
                 <div className="text-slate-200 text-sm font-medium">{providers[0]?.label || 'support@cloudbaud.com'}</div>
                 <div className="text-slate-500 text-xs">Resend Webhook Server</div>
               </div>
             </div>
             <ChevronDown className="h-4 w-4 text-slate-500 mr-2" />
          </div>
          
          <div className="flex space-x-2 mb-8">
            <button 
              className="flex items-center space-x-2 border border-slate-850 bg-slate-950/40 px-3 py-1 hover:bg-slate-800 text-slate-200 rounded-lg font-medium transition-all"
              onClick={() => handleConnectAccount('email_outlook', 'Microsoft Outlook', Mail, 'text-blue-400', 'bg-blue-500/10')}
            >
              <span className="text-blue-400 text-lg font-bold leading-none mb-0.5">+</span>
              <span className="text-sm">Add Outlook</span>
            </button>
            <button 
              className="flex items-center space-x-2 border border-slate-850 bg-slate-950/40 px-3 py-1 hover:bg-slate-800 text-slate-200 rounded-lg font-medium transition-all"
              onClick={() => handleConnectAccount('email_gmail', 'Google Workspace', Mail, 'text-red-400', 'bg-red-500/10')}
            >
              <span className="text-red-400 text-lg font-bold leading-none mb-0.5">+</span>
              <span className="text-sm">Add Gmail</span>
            </button>
          </div>

          <div className="space-y-6 max-w-3xl">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center rounded-xl shadow-sm">
                 <User className="h-8 w-8 text-slate-400 mb-1" strokeWidth={1} />
                 <span className="text-[11px] text-slate-300 font-medium text-center leading-tight">Account<br/>Settings</span>
                 <ChevronDown className="h-3 w-3 text-slate-500 mt-0.5" />
              </div>
              <div className="flex-1 pt-1 text-slate-300">
                <h3 className="text-lg font-medium text-slate-100">Account Settings</h3>
                <p className="text-sm text-slate-400 mb-1">Change settings for this account or set up more connections.</p>
              </div>
            </div>
          </div>
        </div>
        
        {wizardOpen && (
          <InboxProviderWizard
            isOpen={wizardOpen}
            onClose={() => setWizardOpen(false)}
            provider={selectedWizardProvider}
            onConnected={(id, label) => {
              const newProvider = {
                id,
                type: selectedWizardProvider.type,
                label,
                isActive: true,
                connectedAt: new Date()
              };
              setProviders(prev => [...prev, newProvider]);
            }}
          />
        )}
      </div>
    );
  }

  if (isDialpadView) {
    const formatDialpadTime = (secs) => {
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="flex flex-col h-full bg-[#0b0c10] font-sans w-full overflow-hidden relative text-slate-200 antialiased rounded-xl border border-slate-800">
        {/* DIALPAD TOP BAR */}
        <header className="bg-slate-950 border-b border-slate-900 h-[64px] px-6 flex items-center justify-between flex-shrink-0 z-30 select-none shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-[#e31a80] text-white flex items-center justify-center font-extrabold text-xl w-10 h-10 rounded-xl shadow-md transform hover:scale-105 transition-all">
              d*
            </div>
            <div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">Dialpad</span>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-1.5 py-0.5 rounded-full ml-2 border border-purple-900/30">AI Cockpit</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search history or transcripts..."
                value={dialpadSearch}
                onChange={(e) => setDialpadSearch(e.target.value)}
                className="w-full bg-slate-900 hover:bg-slate-850 focus:bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 transition-all placeholder-slate-500 outline-none focus:ring-1 focus:ring-[#e31a80]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-purple-950/20 hover:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-900/30 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
              <span className="text-xs text-purple-400 font-bold">Dialpad AI Active</span>
            </div>

            <button 
              onClick={() => setIsDialpadView(false)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 flex items-center space-x-1.5 border border-slate-800 cursor-pointer"
            >
              <span>Classic Outlook</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* DIALPAD MULTI-PANE LAYOUT */}
        <div className="flex-1 flex overflow-hidden relative">
          <PanelGroup direction="horizontal">
            {/* PANEL 1: LEFTRail SIDEBAR */}
            <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-slate-950 border-r border-slate-900 flex flex-col h-full overflow-hidden select-none">
              <div className="p-4 border-b border-slate-900">
                <div className="flex items-center space-x-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-900">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      CB
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">CloudBaud Agent</h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Available
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 mb-2">Workspace</div>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-[#e31a80]/10 text-[#e31a80] border border-[#e31a80]/20 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-[#e31a80]" />
                      <span>Unified Inbox</span>
                    </div>
                    <span className="bg-[#e31a80] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">2</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Contacts</span>
                  </button>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-slate-950 hover:bg-[#e31a80]/30 cursor-col-resize transition-all z-10" />

            {/* PANEL 2: MAIN WORKSPACE */}
            <Panel defaultSize={55} minSize={40} className="bg-slate-900/40 flex flex-col h-full overflow-hidden">
              <div className="bg-slate-950 border-b border-slate-900 p-4 flex items-center justify-between flex-shrink-0 z-10 select-none">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-[#e31a80] flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                    AM
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-extrabold text-slate-100">Arthur McDanger</h2>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">Work: (503) 300-1940</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all" title="Call">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all" title="Send Message">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chat & Call Log Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isCallEnded && (
                  <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-5 shadow-sm max-w-2xl mx-auto flex items-start space-x-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-extrabold text-emerald-300">Call Completed Successfully</h3>
                      <p className="text-xs text-emerald-500 mt-1 leading-relaxed">
                        Call with Arthur McDanger has ended. The transcript and action items have been processed by Dialpad AI.
                      </p>
                      <button 
                        onClick={() => {
                          setIsCallEnded(false);
                          setCallTime(256);
                        }}
                        className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Restart Calling Simulation
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 border border-slate-850 rounded-3xl shadow-xl max-w-2xl mx-auto overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-900 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-[#e31a80] flex items-center justify-center text-sm font-bold flex-shrink-0">
                          AM
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-slate-100">You called Arthur</span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded-full border border-amber-900/30">Dialpad AI</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">Dialpad (541) 414-6315 → Work (503) 300-1940</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-slate-900/30 rounded-2xl p-4 border border-slate-900">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Call Summary</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        Arthur and Max discuss the features and benefits of using Dialpad for collaboration and communication. They highlight its integration capabilities with various tools and its user-friendly interface. The conversation ends with a playful exchange about meeting setups and the use of AI in their work.
                      </p>
                    </div>
                  </div>
                </div>

                {!isCallEnded && (
                  <div className="bg-slate-950 border border-slate-850 rounded-3xl shadow-lg max-w-2xl mx-auto p-5 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shadow-sm">
                            <Phone className="w-4 h-4 text-[#e31a80]" />
                          </div>
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-200">Live Call with Arthur</h3>
                          <span className="text-[10px] text-slate-500 font-semibold font-mono">Work (503) 300-1940</span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold bg-[#e31a80]/10 text-[#e31a80] px-2.5 py-1 rounded-xl border border-[#e31a80]/20 animate-pulse shadow-sm">
                        {formatDialpadTime(callTime)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-1 h-14 bg-slate-900 rounded-2xl p-4 border border-slate-850 overflow-hidden relative">
                      <div className="flex items-center gap-0.5 mx-auto">
                        {[16, 28, 40, 12, 8, 36, 44, 20, 24, 48, 12, 16, 4, 32, 40, 24, 8, 16, 36, 40, 12, 24, 32, 16, 8, 48, 40, 24, 12, 8, 36, 44, 20, 24, 48, 16].map((h, i) => (
                          <div 
                            key={i} 
                            style={{ 
                              height: `${isOnHold ? 4 : h}px`, 
                            }}
                            className={`w-[3px] rounded-full bg-gradient-to-t ${i % 2 === 0 ? 'from-[#e31a80] to-purple-600' : 'from-purple-500 to-pink-500'} opacity-75 shadow-sm`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom message textbox */}
              <div className="p-4 bg-slate-950 border-t border-slate-900 flex-shrink-0 select-none shadow-inner">
                <div className="max-w-3xl mx-auto flex items-end space-x-3">
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-[#e31a80] focus-within:bg-slate-950 transition-all shadow-sm">
                    <textarea 
                      placeholder="Type a message..."
                      className="w-full bg-transparent border-0 px-4 py-3 text-xs focus:ring-0 resize-none min-h-[44px] max-h-[120px] placeholder-slate-500 text-slate-100 outline-none"
                      rows={1}
                    />
                    <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-850 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <button className="p-2 text-slate-500 hover:text-slate-350 hover:bg-slate-900 rounded-xl transition-colors"><Paperclip className="w-4 h-4" /></button>
                      </div>
                      <button className="bg-[#e31a80] hover:bg-[#c2146c] text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 cursor-pointer">
                        <span>Send</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-slate-950 hover:bg-[#e31a80]/30 cursor-col-resize transition-all z-10" />

            {/* PANEL 3: RIGHT PANEL */}
            <Panel defaultSize={25} minSize={20} maxSize={35} className="bg-slate-950 border-l border-slate-900 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-900 flex items-center justify-between flex-shrink-0 z-10 shadow-sm select-none">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-extrabold text-sm text-slate-200">Profile</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="border border-slate-900 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setOpenAccordion(openAccordion === 'open_activities' ? null : 'open_activities')}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 font-extrabold text-xs text-slate-300 uppercase tracking-wider"
                  >
                    <span>Open Activities</span>
                    <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${openAccordion === 'open_activities' ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion === 'open_activities' && (
                    <div className="p-4 text-xs font-semibold text-slate-500 bg-slate-950 border-t border-slate-900">
                      No open activities for Arthur McDanger.
                    </div>
                  )}
                </div>

                <div className="space-y-2 select-none pt-2">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Integrations</div>
                  {/* Zendesk */}
                  <div className="border border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-shadow">
                    <button 
                      onClick={() => setOpenAccordion(openAccordion === 'zendesk' ? null : 'zendesk')}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/20 hover:bg-slate-900/40"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-extrabold text-sm border border-emerald-900/30 flex-shrink-0">
                          Z
                        </div>
                        <span className="text-xs font-extrabold text-slate-200">Zendesk</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transform transition-transform ${openAccordion === 'zendesk' ? 'rotate-90' : ''}`} />
                    </button>
                    {openAccordion === 'zendesk' && (
                      <div className="p-4 bg-emerald-950/10 border-t border-slate-900 text-xs text-slate-400 font-bold space-y-2 leading-relaxed">
                        <div className="text-emerald-400 flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Integration Connected</span>
                        </div>
                        <p className="font-semibold text-slate-500">2 pending support tickets for Arthur McDanger.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>

        {/* PERSISTENT CALL CONTROL BAR */}
        <div className="bg-slate-950 border-t border-slate-900 h-[84px] px-6 flex items-center justify-between flex-shrink-0 z-50 text-white select-none shadow-2xl relative">
          <div className="flex items-center space-x-4 max-w-sm min-w-[200px]">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e31a80] to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md animate-pulse">
                AM
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold truncate text-white">Arthur McDanger</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block truncate mt-0.5">
                {isCallEnded ? 'Call Ended' : isOnHold ? 'Call On Hold' : isMuted ? 'Muted' : 'Coaching active'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-95 border cursor-pointer ${
                isMuted ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-900 text-slate-300 border-transparent hover:bg-slate-800'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-[8px] font-extrabold mt-1 uppercase">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button 
              onClick={() => setIsOnHold(!isOnHold)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-95 border cursor-pointer ${
                isOnHold ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-slate-900 text-slate-300 border-transparent hover:bg-slate-800'
              }`}
            >
              <Pause className="w-4 h-4" />
              <span className="text-[8px] font-extrabold mt-1 uppercase">{isOnHold ? 'Holding' : 'Hold'}</span>
            </button>
          </div>

          <div className="flex-shrink-0">
            <button 
              onClick={() => {
                setIsCallEnded(!isCallEnded);
              }}
              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all active:scale-95 shadow-lg cursor-pointer ${
                isCallEnded ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <PhoneOff className={`w-4 h-4 transform ${isCallEnded ? 'rotate-135' : ''}`} />
              <span>{isCallEnded ? 'Call Arthur' : 'End'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl shadow-lg border border-slate-800 overflow-hidden w-full min-h-[600px]">
      {/* OUTLOOK RIBBON */}
      <div className="flex flex-col border-b border-slate-800 bg-slate-900 flex-shrink-0 select-none">
        <div className="flex items-end justify-between px-2 pt-1 bg-slate-950 text-slate-400 border-b border-slate-900">
          <div className="flex items-center space-x-1">
            {renderTab('File', 'File')}
            {renderTab('Home', 'Home')}
            {renderTab('SendReceive', 'Send / Receive')}
            {renderTab('Folder', 'Folder')}
            {renderTab('View', 'View')}
            {renderTab('Help', 'Help')}
          </div>
          <button 
            onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors mr-2 mb-0.5 cursor-pointer flex items-center justify-center"
            title={isRibbonCollapsed ? "Show Ribbon" : "Hide Ribbon"}
          >
            {isRibbonCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 rotate-90" />}
          </button>
        </div>

        {!isRibbonCollapsed && (
          <div className="flex items-stretch px-2 py-1.5 overflow-x-auto scrollbar-hide space-x-1 h-[90px]">
            {activeRibbonTab === 'Home' && (
              <>
                <div className="flex items-start space-x-1 border-r border-slate-800 pr-2">
                  <div onClick={() => handleMockAction('New Email')} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer min-w-[50px] text-slate-300">
                    <FilePlus className="h-6 w-6 text-blue-400 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] leading-tight text-center">New<br/>Email</span>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">New</span></div>
                </div>

                <div className="flex items-start border-r border-slate-800 pr-2 pl-1">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-0.5">
                    <div onClick={() => handleDelete()} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
                      <Trash2 className="h-6 w-6 text-slate-400 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px]">Delete</span>
                    </div>
                    <div onClick={() => handleArchive()} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
                      <Archive className="h-6 w-6 text-slate-400 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px]">Archive</span>
                    </div>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">Delete</span></div>
                </div>

                <div className="flex items-start border-r border-slate-800 pr-2 pl-1">
                  <div className="flex space-x-1">
                    <div onClick={() => focusReplyBox()} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
                      <Reply className="h-6 w-6 text-blue-400 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px]">Reply</span>
                    </div>
                    <div onClick={() => focusReplyBox()} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
                      <ReplyAll className="h-6 w-6 text-blue-400 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px]">Reply All</span>
                    </div>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">Respond</span></div>
                </div>

                <div className="flex flex-col items-center border-r border-slate-800 pr-2 pl-1">
                  <div className="flex space-x-1 mt-0.5">
                    <div onClick={() => handleToggleRead()} className="flex flex-col items-center justify-center p-1 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
                      <Mail className="h-5 w-5 text-slate-400 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px] text-center leading-none">Unread/<br/>Read</span>
                    </div>
                    <div onClick={() => handleToggleFlag()} className="flex flex-col items-center justify-center p-1 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
                      <Flag className="h-5 w-5 text-red-500 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px] text-center leading-none">Follow<br/>Up</span>
                    </div>
                  </div>
                  <div className="flex self-end w-full justify-center mt-auto pb-0.5"><span className="text-[9px] text-slate-500">Tags</span></div>
                </div>

                <div className="flex flex-col items-center pr-2 pl-1">
                  <div className="flex space-x-1 mt-0.5">
                    <button 
                      onClick={() => setIsDialpadView(true)}
                      className="flex flex-col items-center justify-center p-1 hover:bg-purple-950/20 hover:text-purple-400 rounded cursor-pointer min-w-[65px] border border-dashed border-purple-900/50 transition-all active:scale-95 bg-purple-950/10 text-purple-300"
                    >
                      <Smartphone className="h-5 w-5 text-purple-400 mb-1 animate-pulse" strokeWidth={1.5} />
                      <span className="text-[10px] text-center font-bold leading-none">Dialpad<br/>Mode</span>
                    </button>
                  </div>
                  <div className="flex self-end w-full justify-center mt-auto pb-0.5"><span className="text-[9px] text-purple-400 font-semibold">Workspace</span></div>
                </div>
              </>
            )}

            {activeRibbonTab === 'SendReceive' && (
              <>
                <div className="flex items-start space-x-1 border-r border-slate-800 pr-2">
                  <div onClick={() => { onRefresh ? onRefresh() : handleMockAction('Send/Receive All Folders') }} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer min-w-[60px] text-slate-300">
                    <RefreshCw className="h-6 w-6 text-blue-400 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] leading-tight text-center">Update<br/>Folder</span>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">Send & Receive</span></div>
                </div>
              </>
            )}

            {activeRibbonTab === 'Folder' && (
              <>
                <div className="flex items-start space-x-1 border-r border-slate-800 pr-2">
                  <div onClick={() => handleMockAction('New Folder')} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer min-w-[55px] text-slate-300">
                    <Folder className="h-6 w-6 text-blue-400 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] leading-tight text-center">New<br/>Folder</span>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">New</span></div>
                </div>
                <div className="flex items-start border-r border-slate-800 pr-2 pl-1">
                  <div onClick={() => handleArchive()} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer min-w-[55px] text-slate-300">
                    <Archive className="h-6 w-6 text-slate-400 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] leading-tight text-center">Clean<br/>Up</span>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">Clean Up</span></div>
                </div>
              </>
            )}

            {activeRibbonTab === 'View' && (
              <>
                <div className="flex items-start space-x-1 border-r border-slate-800 pr-2">
                  <div 
                    onClick={() => setIsRibbonCollapsed(true)} 
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer min-w-[60px] text-slate-300"
                    title="Collapse Ribbon"
                  >
                    <LayoutGrid className="h-6 w-6 text-blue-400 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] leading-tight text-center">Minimize<br/>Ribbon</span>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">Ribbon</span></div>
                </div>

                <div className="flex items-start border-r border-slate-800 pr-2 pl-1">
                  <div 
                    onClick={() => setShowFolderPane(!showFolderPane)} 
                    className={`flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer min-w-[60px] ${showFolderPane ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}
                    title="Toggle folder navigation panel"
                  >
                    <Folder className="h-6 w-6 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] leading-tight text-center">Folder<br/>Pane</span>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">Layout</span></div>
                </div>

                <div className="flex items-start border-r border-slate-800 pr-2 pl-1">
                  <div className="flex space-x-1 mt-0.5">
                    <div 
                      onClick={() => setReadingPanePosition('right')} 
                      className={`flex flex-col items-center justify-center p-1 hover:bg-slate-800 rounded cursor-pointer min-w-[45px] ${readingPanePosition === 'right' ? 'text-blue-400 bg-slate-800/40 font-semibold' : 'text-slate-400'}`}
                    >
                      <Grid className="h-4.5 w-4.5 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px]">Right</span>
                    </div>
                    <div 
                      onClick={() => setReadingPanePosition('off')} 
                      className={`flex flex-col items-center justify-center p-1 hover:bg-slate-800 rounded cursor-pointer min-w-[45px] ${readingPanePosition === 'off' ? 'text-blue-400 bg-slate-800/40 font-semibold' : 'text-slate-400'}`}
                    >
                      <Tv className="h-4.5 w-4.5 mb-1" strokeWidth={1.5} />
                      <span className="text-[10px]">Off</span>
                    </div>
                  </div>
                  <div className="flex self-end w-full justify-center mt-auto pb-0.5"><span className="text-[9px] text-slate-500">Reading Pane</span></div>
                </div>
              </>
            )}

            {activeRibbonTab === 'Help' && (
              <>
                <div className="flex items-start space-x-1 border-r border-slate-800 pr-2">
                  <div onClick={() => handleMockAction('Help Documentation')} className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-800 rounded cursor-pointer min-w-[55px] text-slate-300">
                    <BookOpen className="h-6 w-6 text-blue-400 mb-1" strokeWidth={1.5} />
                    <span className="text-[10px] leading-tight text-center">Help<br/>Center</span>
                  </div>
                  <div className="flex self-end w-full justify-center mt-1"><span className="text-[9px] text-slate-500">Support</span></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3-PANE LAYOUT */}
      <PanelGroup direction="horizontal" className="flex-1 w-full h-full">
        {/* PANE 1: FOLDERS & CHANNELS */}
        {showFolderPane && (!isMobile || (!selectedMessage && isMobile)) && (
          <Panel defaultSize={20} className="bg-slate-950 text-slate-300 min-w-0 flex flex-col border-r border-slate-900">
            <div className="p-2.5 flex-1 overflow-y-auto space-y-4">
              
              <div className="space-y-0.5">
                <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 px-2">Folders</h3>
                {[
                  { id: 'inbox', label: 'Inbox', icon: Folder, count: messages.filter(m => m.status !== 'closed' && m.status !== 'deleted').length },
                  { id: 'starred', label: 'Starred', icon: Star, count: messages.filter(m => m.isStarred && m.status !== 'deleted').length },
                  { id: 'assigned', label: 'Assigned', icon: User, count: messages.filter(m => m.status === 'assigned' && m.status !== 'deleted').length },
                  { id: 'archive', label: 'Archive', icon: Archive, count: messages.filter(m => m.status === 'closed' && m.status !== 'deleted').length },
                ].map(folder => (
                  <button 
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                      activeFolder === folder.id ? 'bg-blue-500/10 text-blue-400 font-semibold' : 'hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <folder.icon className={`h-3.5 w-3.5 ${activeFolder === folder.id ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span>{folder.label}</span>
                    </div>
                    {folder.count > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        activeFolder === folder.id ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {folder.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-0.5">
                <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 px-2">Channels</h3>
                {[
                  { id: 'all', label: 'All Channels', icon: Folder, color: 'text-slate-500' },
                  { id: 'email_outlook', label: 'Email Integrations', icon: Mail, color: 'text-blue-400' },
                  { id: 'whatsapp', label: 'WhatsApp Live', icon: MessageSquare, color: 'text-emerald-400' },
                  { id: 'sms', label: 'SMS Gateway', icon: Smartphone, color: 'text-indigo-400' },
                  { id: 'telegram', label: 'Telegram Bot', icon: Send, color: 'text-sky-400' }
                ].map(channel => (
                  <button 
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center space-x-2 px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                      activeChannel === channel.id ? 'bg-slate-900 text-slate-200 font-semibold' : 'hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <channel.icon className={`h-3.5 w-3.5 ${channel.color}`} />
                    <span>{channel.label}</span>
                  </button>
                ))}
              </div>

            </div>
          </Panel>
        )}

        <PanelResizeHandle className="w-1 bg-slate-950 hover:bg-blue-500/20 cursor-col-resize transition-all z-10" />

        {/* PANE 2: MESSAGE LIST */}
        {(!isMobile || (!selectedMessage && isMobile)) && (
          <Panel defaultSize={30} className="bg-slate-950 flex flex-col min-w-0 border-r border-slate-900">
            <div className="p-2 border-b border-slate-900 flex items-center justify-between bg-slate-950 relative z-20 shadow-sm">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={filteredMessages.length > 0 && filteredMessages.every(m => selectedIds.has(m.id))}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-850 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-950 size-3.5 cursor-pointer mr-1"
                  title="Select All"
                />
                <span className="text-[13px] font-semibold text-blue-400 border-b-2 border-blue-500 pb-1 cursor-pointer">Focused</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200 px-1 py-0.5 hover:bg-slate-900 rounded cursor-pointer"
                >
                  <span>By {activeArrangeBy}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 rounded-lg text-slate-300">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-500">Arrange by</div>
                    {['Date', 'From', 'Subject'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => { setActiveArrangeBy(opt); setShowSortDropdown(false); }}
                        className="w-full flex items-center px-3 py-1.5 hover:bg-slate-800 text-[12px] text-left transition-colors cursor-pointer"
                      >
                        <span className="w-5 flex justify-center">{activeArrangeBy === opt && <Check className="h-3 w-3 text-blue-400" />}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <Play className="animate-spin h-4 w-4" /> Loading communications...
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-800">
                    <CheckCircle2 className="h-6 w-6 text-slate-600" />
                  </div>
                  <p className="text-sm">Inbox empty in this view</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const channelCfg = getChannelConfig(msg.channel);
                  const isSelected = selectedMessage?.id === msg.id;
                  
                  return (
                    <div 
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        markAsRead(msg.id);
                      }}
                      className={`p-2.5 cursor-pointer transition-all border-l-4 flex items-start gap-2.5 ${
                        isSelected 
                          ? 'bg-blue-500/5 border-l-blue-500' 
                          : 'hover:bg-slate-900/50 border-l-transparent'
                      } ${!msg.isRead ? 'bg-slate-900/30' : ''}`}
                    >
                      <div className="flex items-center mt-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(msg.id)}
                          onChange={() => handleToggleSelect(msg.id)}
                          className="rounded border-slate-850 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-950 size-3.5 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="flex items-center space-x-1.5 truncate pr-2">
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${channelCfg.bg} border ${channelCfg.border}`}>
                              <channelCfg.icon className={`h-3 w-3 ${channelCfg.color}`} />
                            </div>
                            <span className={`text-[13px] truncate ${!msg.isRead ? 'font-bold text-slate-200' : 'font-medium text-slate-400'}`}>
                              {msg.from}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <span className="text-[11px] text-slate-500">{msg.time}</span>
                            <button onClick={(e) => toggleStar(e, msg.id)} className="cursor-pointer">
                              <Star className={`h-3.5 w-3.5 ${msg.isStarred ? 'text-yellow-500 fill-current' : 'text-slate-600 hover:text-slate-400'}`} />
                            </button>
                          </div>
                        </div>
                        
                        {msg.subject && (
                          <h4 className={`text-[11px] truncate mb-0.5 ${!msg.isRead ? 'font-semibold text-slate-350' : 'text-slate-400'}`}>
                            {msg.subject}
                          </h4>
                        )}
                        
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {msg.preview}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          {msg.legalCategory && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/10 text-purple-400 border border-purple-900/30">
                              <Tag className="w-2.5 h-2.5 mr-1" />
                              {msg.legalCategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Panel>
        )}

        <PanelResizeHandle className="w-1 bg-slate-950 hover:bg-blue-500/20 cursor-col-resize transition-all z-10" />

        {/* PANE 3: MESSAGE DETAIL */}
        {readingPanePosition !== 'off' && (!isMobile || ((selectedMessage || selectedIds.size > 0) && isMobile)) && (
          <Panel defaultSize={50} className="flex flex-col bg-slate-950 min-w-0">
            {selectedIds.size > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/20 p-8 text-center animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-900/20 shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-blue-450" />
                </div>
                <h3 className="text-base font-bold text-slate-200 mb-1">{selectedIds.size} Messages Selected</h3>
                <p className="text-xs text-slate-500 mb-6 max-w-[240px] leading-relaxed">Choose an action to apply to all selected messages.</p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button 
                    onClick={handleToggleRead}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-800 transition-all cursor-pointer hover:border-slate-700 active:scale-95"
                  >
                    Mark Read/Unread
                  </button>
                  <button 
                    onClick={handleArchive}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-350 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-800 transition-all cursor-pointer hover:border-slate-700 active:scale-95"
                  >
                    Archive All
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="bg-red-950/20 hover:bg-red-950/40 text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-red-900/35 transition-all cursor-pointer active:scale-95"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            ) : selectedMessage ? (
              <>
                <div className="p-2.5 border-b border-slate-900 flex items-center justify-between bg-slate-950 shadow-sm z-10">
                  <div className="flex items-center space-x-3">
                    {isMobile && (
                      <button onClick={() => setSelectedMessage(null)} className="p-1 -ml-1 mr-1 rounded-lg hover:bg-slate-900 text-slate-400 cursor-pointer">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 ${
                        getChannelConfig(selectedMessage.channel).bg
                      } ${getChannelConfig(selectedMessage.channel).color}`}>
                        {React.createElement(getChannelConfig(selectedMessage.channel).icon, { className: "w-2.5 h-2.5" })}
                        <span>{getChannelConfig(selectedMessage.channel).label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-100 rounded-lg cursor-pointer" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={handleArchive} className="p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-100 rounded-lg cursor-pointer" title="Archive">
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={handleToggleRead} className="p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-100 rounded-lg cursor-pointer" title="Mark Unread/Read">
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-900/10 min-w-0">
                  <div className="p-4 pb-3 bg-slate-950 border-b border-slate-900">
                    <h2 className="text-base font-bold text-slate-100 mb-2">
                      {selectedMessage.subject || `Message from ${selectedMessage.from}`}
                    </h2>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                          {selectedMessage.from.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-200 text-xs">{selectedMessage.from}</span>
                            <span className="text-[10px] text-slate-500">&lt;{selectedMessage.fromHandle}&gt;</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-2">
                            <span>{selectedMessage.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {selectedMessage.isWhatsAppThread ? (
                      <div className="space-y-3 max-w-2xl mx-auto flex flex-col">
                        {selectedMessage.whatsAppMessages?.map((waMsg) => (
                          <div key={waMsg.id} className={`flex ${waMsg.isFromClient ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-xl px-3 py-2 shadow-sm relative ${
                              waMsg.isFromClient 
                                ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm text-xs' 
                                : 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 rounded-tr-sm text-xs'
                            }`}>
                              <p className="whitespace-pre-wrap">{waMsg.text}</p>
                              <span className={`text-[8px] mt-0.5 block text-right text-slate-500`}>
                                {waMsg.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 shadow-sm max-w-3xl">
                        <div className="prose prose-invert prose-xs max-w-none text-slate-350 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                          {selectedMessage.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Box */}
                <div className="p-3 bg-slate-950 border-t border-slate-900">
                  <div className="max-w-4xl mx-auto flex items-end space-x-3">
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-slate-950 transition-all">
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply via ${getChannelConfig(selectedMessage.channel).label}...`}
                        className="w-full bg-transparent border-0 px-3 py-2 text-xs focus:ring-0 resize-none min-h-[40px] max-h-[150px] text-slate-100 placeholder-slate-500 outline-none"
                        rows={1}
                      />
                      <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-850 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-slate-500 hover:text-slate-350 hover:bg-slate-900 rounded-lg cursor-pointer"><Paperclip className="w-3.5 h-3.5" /></button>
                        </div>
                        <button 
                          onClick={handleSendReply}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <span>Send Reply</span>
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-900/10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-950 rounded-full shadow-sm border border-slate-900 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-400">Select a message to view conversation</h3>
                </div>
              </div>
            )}
          </Panel>
        )}
      </PanelGroup>

      {/* Account Wizard Modal */}
      {wizardOpen && (
        <InboxProviderWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          provider={selectedWizardProvider}
          onConnected={(id, label) => {
            const newProvider = {
              id,
              type: selectedWizardProvider.type,
              label,
              isActive: true,
              connectedAt: new Date()
            };
            const updated = [...providers, newProvider];
            setProviders(updated);
            localStorage.setItem('inbox_providers', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
            toast.success(`Connected ${selectedWizardProvider.name} successfully!`);
          }}
        />
      )}
    </div>
  );
}
