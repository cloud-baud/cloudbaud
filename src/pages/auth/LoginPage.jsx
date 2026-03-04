import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Mail, Lock, Loader2, Wand2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const { signInWithOtp, impersonateUser } = useAuth();
    const navigate = useNavigate();
    const isDev = import.meta.env.DEV;

    // Cooldown timer effect
    React.useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cooldown > 0) return;

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');

        if (!email) {
            toast.error("Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            await signInWithOtp(email);
            toast.success('Magic link sent! Check your email to log in.');
            setCooldown(60); // 60 second cooldown to prevent spam/link invalidation
        } catch (error) {
            console.error("Login Error:", error);
            // Handle Supabase 500 error specifically for email rate limits
            if (error.status === 500 || error.message?.includes("500")) {
                const devHint = isDev ? " (Use the Bypass button below instead!)" : "";
                toast.error(`Service Error: Sending failed. You may have hit the email rate limit (3/hour on free tier).${devHint} Please wait or check Supabase logs.`, {
                    duration: 10000,
                });
            } else {
                toast.error(error.message || 'Failed to send magic link');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-600 dark:text-slate-400">Sign in to your CloudBaud account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading || cooldown > 0} 
                        className={`w-full font-bold py-2 rounded-lg transition-all ${cooldown > 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : cooldown > 0 ? (
                            <span className="flex items-center justify-center">
                                <span className="mr-2">Resend in {cooldown}s</span>
                            </span>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4 mr-2" /> Send Magic Link
                            </>
                        )}
                    </Button>

                    {isDev && (
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-dashed border-slate-300 dark:border-slate-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                                    Dev Only
                                </span>
                            </div>
                        </div>
                    )}

                    {isDev && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                impersonateUser({ 
                                    id: 'dev-bypass', 
                                    name: 'Dev User', 
                                    email: 'dev@example.com', 
                                    role: 'tenant-admin' 
                                });
                                navigate('/workspace');
                                toast.success("Bypassed Login (Dev Mode)");
                            }}
                            className="w-full border-dashed border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 dark:text-amber-500"
                        >
                            ⚡ Bypass Login (Rate Limit Fix)
                        </Button>
                    )}
                </form>

                <div className="mt-6">
                    <SocialAuthButtons />
                </div>

                <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account? <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">Sign up</Link>
                </div>
            </div>

            <div className="mt-8 text-center text-slate-500 text-xs">
                &copy; {new Date().getFullYear()} CloudBaud, LLC. All rights reserved.
            </div>
        </div>
    );
};

export default LoginPage;
