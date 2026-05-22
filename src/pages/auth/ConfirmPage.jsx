import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Loader2, ShieldCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const ConfirmPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') || 'magiclink';

    const handleConfirm = async () => {
        if (!tokenHash) {
            toast.error("Missing verification token.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            console.log('[ConfirmPage] Verifying OTP with token_hash...', { type });
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: type,
            });

            if (error) {
                console.error('[ConfirmPage] Verification failed:', error);
                throw error;
            }

            console.log('[ConfirmPage] Verification successful!', data);
            toast.success("Login successful! Welcome back.");
            navigate('/workspace', { replace: true });
        } catch (err) {
            const friendlyMsg = err.message || "The sign-in link is invalid or has expired.";
            setErrorMsg(friendlyMsg);
            toast.error("Verification failed", {
                description: friendlyMsg
            });
        } finally {
            setLoading(false);
        }
    };

    // Auto-focus the button or trigger it
    useEffect(() => {
        // If we want it to be manual click (to defeat bots completely), we just wait for the user to click.
        // This is Option B's core defense: bots won't click this button, but a human will!
        console.log('[ConfirmPage] Mounted with params:', { hasToken: !!tokenHash, type });
    }, [tokenHash, type]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/60 p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Visual Glassmorphic Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                {!tokenHash ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            Invalid Verification Link
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            No verification token was found in the link. Please make sure the link was copied correctly or request a new login link.
                        </p>
                        <Link to="/login">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                Return to Login <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                ) : errorMsg ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            Verification Failed
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            {errorMsg}
                        </p>
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 mb-8 text-sm text-slate-600 dark:text-slate-400 text-left">
                            <span className="font-semibold text-amber-700 dark:text-amber-500 block mb-1">Why did this happen?</span>
                            This link was already consumed or is expired. Link pre-scanners in your email app (e.g. Outlook SafeLinks) often click links in the background and invalidate them.
                        </div>
                        <Link to="/login">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                Request a New Link <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        {/* Glowing Logo / Check Icon */}
                        <div className="relative w-20 h-20 mx-auto mb-8">
                            <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-full animate-ping pointer-events-none" />
                            <div className="relative w-20 h-20 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                            Secure Sign-In
                        </h1>
                        
                        <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100/60 dark:border-blue-900/20 rounded-full text-xs text-blue-700 dark:text-blue-400 font-medium w-fit mx-auto mb-6">
                            <Sparkles className="w-3.5 h-3.5" /> Human Verification Required
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            To protect your session from background email scanners and security tools, please click the button below to confirm your login to CloudBaud.
                        </p>

                        <Button 
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Confirm Secure Sign-In <ArrowRight className="w-5 h-5 ml-2" />
                                </span>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmPage;
