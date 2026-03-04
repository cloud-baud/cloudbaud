import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Users, User, Briefcase, Calculator, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils'; // Assuming you have a utils file

const DevPersonaSwitcher = () => {
    // 1. Only render in Development
    const isDev = import.meta.env.DEV;
    const { user, impersonateUser, revertImpersonation } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!isDev) return null;

    // 2. Define Personas
    const personas = [
        { id: 'client', name: 'Client (CTO)', icon: Briefcase, role: 'client-admin', email: 'client@example.com' },
        { id: 'recruiter', name: 'Recruiter', icon: Users, role: 'recruiter', email: 'recruiter@example.com' },
        { id: 'cpa', name: 'CPA/Finance', icon: Calculator, role: 'cpa', email: 'cpa@example.com' },
        { id: 'spouse', name: 'Spouse/Family', icon: Heart, role: 'family', email: 'spouse@example.com' }
    ];

    const handleImpersonate = (persona) => {
        impersonateUserRequest(persona);
        setIsOpen(false);
    };

    // Helper to interact with Context (needs update in AuthContext)
    const impersonateUserRequest = (persona) => {
        if (impersonateUser) {
            impersonateUser(persona);
        } else {
            console.warn("impersonateUser not implemented in AuthContext");
            // Fallback mock update if context not ready
            // alert(`Impersonating: ${persona.name}`);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-[9999]">
            {isOpen ? (
                <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4 w-64 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dev Persona Switcher</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-2">
                        {personas.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleImpersonate(p)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                                    user?.role === p.role
                                        ? "bg-brand-blue text-white"
                                        : "hover:bg-slate-800 text-slate-300"
                                )}
                            >
                                <p.icon className="w-4 h-4" />
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {user?.isImpersonating && (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs h-8 border-red-500/50 text-red-500 hover:bg-red-950"
                                onClick={() => revertImpersonation && revertImpersonation()}
                            >
                                Revert to Real User
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-12 h-12 bg-brand-blue hover:bg-brand-blue shadow-lg border-2 border-brand-aqua flex items-center justify-center p-0"
                    title="Switch Persona (Dev Only)"
                >
                    <User className="w-6 h-6 text-white" />
                </Button>
            )}
        </div>
    );
};

export default DevPersonaSwitcher;
