import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabaseAuth } from '@/shared/lib/supabase';

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
        const code = params.get('code');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasAccessToken = hashParams.has('access_token');

        // Flow 1: PKCE?code=
        if (code) {
          const { error } = await supabaseAuth.auth.exchangeCodeForSession(code);
          if (error) throw error;
          navigate('/collaboration', { replace: true });
          return;
        }

        // Flow 2: Implicit - hash has #access_token (what you have now)
        if (hasAccessToken) {
          // detectSessionInUrl already parsed the hash, just wait for session
          const { data: { session } } = await supabaseAuth.auth.getSession();
          if (session) {
            navigate('/collaboration', { replace: true });
            return;
          }
          // fallback - give it a second
          setTimeout(async () => {
            const { data } = await supabaseAuth.auth.getSession();
            if (data.session) navigate('/collaboration', { replace: true });
          }, 500);
          return;
        }

        // Flow 3: token_hash manual verify
        if (tokenHash) {
          const { error: verifyError } = await supabaseAuth.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (verifyError) throw verifyError;
          navigate('/collaboration', { replace: true });
          return;
        }

        throw new Error('No auth params found in URL');
      } catch (e) {
        console.error('Auth confirm error:', e);
        setError(e?.message || 'Unable to verify sign-in link.');
        setStatus('Sign-in link verification failed.');
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 text-center">
        {!error && <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-white" />}
        <h1 className="text-lg font-semibold text-white">{status}</h1>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {error && (
          <Link to="/login" className="inline-block mt-4 text-sm text-white/60 hover:text-white">
            Back to Login (localhost:17117)
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuthConfirmPage;