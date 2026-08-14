import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { fetchInboundEmails } from '@/workspace/services/communicationsService';
import { SharedInbox } from './inbox/SharedInbox';

const UnifiedCommunicationsPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadInbox = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchInboundEmails();
      setMessages(data);
    } catch (e) {
      setError(e.message || 'Failed to load inbound messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-1.5 lg:p-2 animate-in fade-in duration-500 overflow-hidden">
      {/* A very compact header */}
      <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            Unified Communications
            <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded-full border border-blue-900/30">Cockpit</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadInbox} disabled={loading} className="cursor-pointer h-7 text-[11px] px-2 py-0">
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {error && (
          <div className="mb-2 rounded-md border border-red-900/30 bg-red-950/20 px-2.5 py-1.5 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              {error}
            </div>
          </div>
        )}
        
        <SharedInbox 
          dbMessages={messages} 
          onRefresh={loadInbox} 
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default UnifiedCommunicationsPage;
