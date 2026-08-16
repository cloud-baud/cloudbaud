import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error | expired
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No token provided');
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch('/.netlify/functions/validate-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (!res.ok) {
          if (data.code === 'EXPIRED') {
            setStatus('expired');
          } else {
            setStatus('error');
          }
          setError(data.error || 'Invalid invite');
          return;
        }

        // Success - store session
        setInvite(data);
        localStorage.setItem('finance_invite_token', token);
        localStorage.setItem('finance_invite_session', JSON.stringify(data));
        localStorage.setItem('finance_cpa_email', data.email);
        localStorage.setItem('finance_role', data.role);
        
        // Mark as used for non-test via optional call (we don't block test reuse)
        setStatus('success');
      } catch (e) {
        console.error(e);
        setStatus('error');
        setError('Network error validating invite');
      }
    };

    validate();
  }, [token]);

  const handleContinue = () => {
    // For David handover - go directly to 2022 taxes
    navigate('/finance/taxes?year=2022');
    // Fallback for finance subdomain root
    setTimeout(() => {
      if (window.location.pathname.includes('/invite')) {
        window.location.href = '/taxes?year=2022';
      }
    }, 100);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
        <div className="max-w-md w-full p-8 rounded-xl border border-white/10 bg-black/50 text-center">
          <div className="animate-pulse">
            <div className="h-2 w-24 bg-cyan-400/30 rounded mx-auto mb-6"></div>
            <h2 className="text-xl font-bold mb-2">Validating Secure Invite...</h2>
            <p className="text-sm text-slate-400 font-mono break-all">{token?.slice(0, 16)}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'expired' || status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white p-6">
        <div className="max-w-md w-full p-8 rounded-xl border border-red-500/20 bg-black/80 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">✕</div>
          <h2 className="text-xl font-bold mb-2">{status === 'expired' ? 'Invite Expired' : 'Invalid Invite'}</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <Link to="/finance/taxes" className="inline-block px-6 py-2 rounded-full bg-white text-black font-bold text-sm">
            Go to Finance
          </Link>
        </div>
      </div>
    );
  }

  // success
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white p-6">
      <div className="max-w-lg w-full p-8 rounded-2xl border border-white/10 bg-black shadow-2xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            SECURE CPA ACCESS
          </div>
          <h1 className="text-2xl font-bold">Welcome to CloudBaud Finance</h1>
          <p className="text-sm text-slate-400 mt-2">You've been granted external CPA access by Jishnu Nath</p>
        </div>

        <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/5 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-mono text-white">{invite?.email}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">{invite?.role}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Access</span><span className="font-mono text-xs">{invite?.path_allowlist?.join(', ')}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Expires</span><span className="text-xs">{invite?.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : '14 days'}</span></div>
          {invite?.isTest && <div className="mt-2 px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs text-center">TEST MODE - reusable</div>}
        </div>

        <button
          onClick={handleContinue}
          className="w-full mt-6 py-3 rounded-full bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition"
        >
          Continue to Taxes — 2022 →
        </button>

        <p className="text-[11px] text-slate-500 mt-4 text-center">
          By continuing you agree to view-only access to authorized finance modules. Activity is logged.
        </p>
      </div>
    </div>
  );
}
