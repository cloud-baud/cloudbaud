import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Lock, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * MfaChallengeScreen
 * 
 * A premium, full-screen glassmorphic challenge interceptor.
 * Blocks unverified sessions (aal1 with nextLevel: aal2) and prompts for a 6-digit code.
 */
const MfaChallengeScreen = () => {
    const { verifyMfa, signOut, user } = useAuth();
    
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [factorId, setFactorId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingFactor, setLoadingFactor] = useState(true);
    const [error, setError] = useState('');
    
    const inputRefs = useRef([]);

    // 1. Fetch active verified TOTP factor on mount
    useEffect(() => {
        async function fetchFactors() {
            try {
                const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
                if (factorsError) throw factorsError;
                
                // Find verified TOTP factor
                const verifiedTotp = data?.all?.find(f => f.status === 'verified' && f.factorType === 'totp');
                if (verifiedTotp) {
                    setFactorId(verifiedTotp.id);
                } else {
                    setError('No active 2FA device found. Please contact support.');
                    toast.error('No active Multi-Factor factor registered.');
                }
            } catch (err) {
                console.error('[MFA Challenge] Failed to list factors:', err);
                setError('Failed to query security posture. Please try again.');
            } finally {
                setLoadingFactor(false);
            }
        }
        fetchFactors();
    }, []);

    // 2. Auto-focus the first empty slot
    useEffect(() => {
        if (!loadingFactor && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [loadingFactor]);

    // 3. Digit slot change handler
    const handleDigitChange = (idx, value) => {
        const cleanValue = value.replace(/[^0-9]/g, '');
        if (!cleanValue) {
            const newDigits = [...digits];
            newDigits[idx] = '';
            setDigits(newDigits);
            return;
        }

        // Handle copy paste case (if someone pastes a 6 digit code)
        if (cleanValue.length > 1) {
            const pastedDigits = cleanValue.slice(0, 6).split('');
            const newDigits = [...digits];
            for (let i = 0; i < 6; i++) {
                if (pastedDigits[i]) {
                    newDigits[i] = pastedDigits[i];
                }
            }
            setDigits(newDigits);
            
            // Focus on the last filled input or submit if fully filled
            const targetIdx = Math.min(cleanValue.length - 1, 5);
            inputRefs.current[targetIdx]?.focus();
            
            if (cleanValue.length >= 6) {
                handleSubmit(newDigits.join(''));
            }
            return;
        }

        const newDigits = [...digits];
        newDigits[idx] = cleanValue;
        setDigits(newDigits);
        setError('');

        // Move focus forward
        if (idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }

        // If it's the last slot and we now have a complete code, submit automatically
        const finalCode = [...newDigits];
        finalCode[idx] = cleanValue;
        if (finalCode.every(d => d !== '')) {
            handleSubmit(finalCode.join(''));
        }
    };

    // 4. Backspace and navigation key handler
    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace') {
            if (!digits[idx] && idx > 0) {
                // Focus previous slot and clear it
                const newDigits = [...digits];
                newDigits[idx - 1] = '';
                setDigits(newDigits);
                inputRefs.current[idx - 1]?.focus();
            } else {
                const newDigits = [...digits];
                newDigits[idx] = '';
                setDigits(newDigits);
            }
            setError('');
        } else if (e.key === 'ArrowLeft' && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        } else if (e.key === 'ArrowRight' && idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    // 5. Code verification submission
    const handleSubmit = async (codeToSubmit) => {
        const code = codeToSubmit || digits.join('');
        if (code.length < 6 || !factorId) return;

        setLoading(true);
        setError('');

        try {
            await verifyMfa(factorId, code);
            toast.success('Security identity verified successfully.');
        } catch (err) {
            console.error('[MFA Challenge] Verification failed:', err);
            setError(err.message || 'Invalid 6-digit verification code. Please try again.');
            toast.error('Verification failed. Incorrect code.');
            // Clear inputs and reset focus to the first slot
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
            {/* Ambient visual glowing shapes */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-full max-w-md p-8 mx-4 relative overflow-hidden bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md text-slate-200">
                {/* Decorative border glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Glowing Locked Lock Shield Icon */}
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border border-blue-500/20 group">
                        {/* Outer pulsing ring */}
                        <div className="absolute inset-0 rounded-2xl border border-blue-500/30 animate-pulse" />
                        <div className="absolute -inset-1 rounded-3xl border border-indigo-500/10 animate-ping duration-1500 pointer-events-none" />
                        <Lock className="w-10 h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold tracking-tight text-white">
                            Security Verification
                        </h2>
                        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                            To secure the <strong>CloudBaud</strong> ecosystem, enter the 6-digit authentication code generated by your app.
                        </p>
                    </div>

                    {loadingFactor ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="text-xs text-slate-500">Querying active security factor...</span>
                        </div>
                    ) : (
                        <div className="w-full space-y-6">
                            {/* 6-Digit Slots Container */}
                            <div className="flex justify-center gap-2.5">
                                {digits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => (inputRefs.current[idx] = el)}
                                        id={`challenge-digit-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className="w-12 h-14 text-center text-xl font-extrabold text-white bg-slate-950/80 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-inner transition-all duration-200"
                                        disabled={loading}
                                        autoComplete="one-time-code"
                                    />
                                ))}
                            </div>

                            {/* Error indicator */}
                            {error && (
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-950/20 border border-red-900/30 p-3.5 rounded-2xl animate-shake">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                                    <span className="text-left">{error}</span>
                                </div>
                            )}

                            {/* Verification Button */}
                            <button
                                disabled={loading || digits.join('').length < 6 || !factorId}
                                onClick={() => handleSubmit()}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Elevating Session...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Confirm Verification</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Sign-out Bypass Link */}
                    <div className="pt-4 w-full border-t border-slate-800/60">
                        <button
                            onClick={signOut}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign out and exit</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MfaChallengeScreen;
