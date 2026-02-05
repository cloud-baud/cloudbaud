import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Mail, Lock, Loader2, Wand2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

import SocialAuthButtons from '../components/auth/SocialAuthButtons';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { signInWithOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const email = e.target[0].value;

        try {
            await signInWithOtp(email);
            toast.success('Magic link sent! Check your email to log in.');
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to login');
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
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                            <>
                                <Wand2 className="w-4 h-4 mr-2" /> Send Magic Link
                            </>
                        )}
                    </Button>
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
