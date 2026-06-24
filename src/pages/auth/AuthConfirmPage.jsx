import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AuthConfirmPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your sign-in link...');
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenHash = params.get('token_hash');
        const type = params.get('type') || 'magiclink';

        if (!tokenHash) {
          throw new Error('Missing token_hash in callback URL.');
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (verifyError) {
          throw verifyError;
        }

        setStatus('Success! Redirecting...');
        navigate('/collaboration', { replace: true });
      } catch (e) {
        console.error('Auth confirm error:', e);
        setError(e?.message || 'Unable to verify sign-in link.');
        setStatus('Sign-in link verification failed.');
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 text-center">
        {!error && <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-blue-600" />}
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{status}</h1>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {error && (
          <Link to="/login" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-500">
            Back to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuthConfirmPage;
