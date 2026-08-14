import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export function InboxProviderWizard({ isOpen, onClose, provider, onConnected }) {
  const [step, setStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsConnecting(false);
      setLabel('');
    }
  }, [isOpen]);

  if (!isOpen || !provider) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    
    if (provider.id === 'gmail') {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "732294158432-placeholder.apps.googleusercontent.com";
        const redirectUri = window.location.origin + "/oauth/callback";
        const scope = "openid email profile https://www.googleapis.com/auth/gmail.modify";
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
          `client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scope)}` +
          `&access_type=offline` +
          `&prompt=consent`;

        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          googleAuthUrl,
          "Google Auth",
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );

        if (!popup) {
          throw new Error("Popup blocked by browser. Please enable popups for this site.");
        }

        const pollTimer = setInterval(async () => {
          try {
            if (popup.closed) {
              clearInterval(pollTimer);
              setIsConnecting(false);
              return;
            }

            if (popup.location.origin === window.location.origin) {
              const urlParams = new URLSearchParams(popup.location.search);
              const code = urlParams.get("code");
              const error = urlParams.get("error");

              if (code || error) {
                clearInterval(pollTimer);
                popup.close();

                if (code) {
                  const { supabase } = await import('@/shared/lib/supabase');
                  const { data, error: invokeError } = await supabase.functions.invoke('google-oauth', {
                    body: { code }
                  });

                  if (invokeError || (data && data.error)) {
                    throw new Error(invokeError?.message || data?.error || "Failed to exchange authorization token");
                  }

                  if (data && data.email) {
                    setLabel(data.email);
                  }
                  setIsConnecting(false);
                  setStep(2);
                } else {
                  throw new Error(error || "Google authorization failed");
                }
              }
            }
          } catch (e) {
            // Ignore Cross-Origin errors while popup is on Google domain
          }
        }, 500);

      } catch (err) {
        console.error("OAuth error:", err);
        alert(err.message || "An error occurred during authentication.");
        setIsConnecting(false);
      }
    } else {
      setTimeout(() => {
        setIsConnecting(false);
        setStep(2);
      }, 2000);
    }
  };

  const handleFinish = () => {
    onConnected(provider.id, label || `${provider.name} Connection`);
    onClose();
  };

  const ProviderIcon = provider.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">Connect {provider.name}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto text-slate-300">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${provider.bg} shadow-sm`}>
                  <ProviderIcon className={`h-10 w-10 ${provider.color}`} />
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="text-xl font-medium text-slate-100">Authorize Access</h4>
                <p className="text-slate-400 mt-2 text-sm">
                  CloudBaud needs permission to securely read and send messages using your {provider.name} account.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Read messages and attachments</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Send messages on your behalf</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Sync labels and folders</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-sm animate-pulse">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-medium text-slate-100">Connection Successful</h4>
                <p className="text-slate-400 mt-2 text-sm">
                  Your {provider.name} account is now connected to CloudBaud.
                </p>
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Connection Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Work Email, Support Line"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Connect Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-750 transition-colors cursor-pointer"
            >
              Finish Setup
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
