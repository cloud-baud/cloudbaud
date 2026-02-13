import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/shared/ui/button';
import { Building2, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

const SocialAuthButtons = () => {
    const { signInWithOAuth, signInWithSSO } = useAuth();
    const [loading, setLoading] = useState(false);
    const [ssoDomain, setSsoDomain] = useState('');
    const [showSSOInput, setShowSSOInput] = useState(false);

    const handleOAuthLogin = async (provider) => {
        try {
            setLoading(true);
            await signInWithOAuth(provider);
        } catch (error) {
            console.error("OAuth Error:", error);
            if (error.status === 400 || error.message?.includes("400")) {
                 toast.error(`Config Error: ${provider} is not enabled in Supabase OR 'http://localhost:17117' is not in Redirect URLs.`);
            } else {
                 toast.error(error.message || `Failed to login with ${provider}`);
            }
            setLoading(false);
        }
    };

    const handleSSOLogin = async (e) => {
        e.preventDefault();
        if (!ssoDomain) return;
        try {
            setLoading(true);
            await signInWithSSO(ssoDomain);
        } catch (error) {
            console.error(error);
            toast.error('Failed to initiate SSO login');
            setLoading(false);
        }
    };

    // Microsoft Icon (SVG)
    const MicrosoftIcon = ({ className }) => (
        <svg viewBox="0 0 23 23" className={className}>
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
    );

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300 dark:border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600"
                onClick={() => handleOAuthLogin('azure')}
            >
                <MicrosoftIcon className="mr-2 h-4 w-4" />
                Microsoft
            </Button>

            <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="w-full bg-[#0077b5] hover:bg-[#006097] text-white border-transparent"
                onClick={() => handleOAuthLogin('linkedin_oidc')}
            >
                <Linkedin className="mr-2 h-4 w-4 fill-current" />
                LinkedIn
            </Button>

            {!showSSOInput ? (
                <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setShowSSOInput(true)}
                >
                    <Building2 className="mr-2 h-4 w-4" />
                    Single Sign-On (SSO)
                </Button>
            ) : (
                <form onSubmit={handleSSOLogin} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="company.com"
                        value={ssoDomain}
                        onChange={(e) => setSsoDomain(e.target.value)}
                        className="flex-1 min-w-0 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        required
                    />
                    <Button type="submit" disabled={loading} size="sm" className="bg-slate-900 text-white">
                        Login
                    </Button>
                </form>
            )}
        </div>
    );
};

export default SocialAuthButtons;
