import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { SYSTEM_ROLES, SYSTEM_MODULES } from '../services/teamsAuthService';
import { UserPlus, Mail, Shield, Building, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

export const InviteMemberModal = ({ isOpen, onClose, onInviteSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [department, setDepartment] = useState('Engineering');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error('Please provide a valid email address');
            return;
        }

        setLoading(true);
        try {
            await onInviteSuccess({
                name: name.trim(),
                email: email.trim(),
                role,
                department: department.trim() || 'General'
            });
            setName('');
            setEmail('');
            setRole('member');
            setDepartment('Engineering');
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const selectedRoleObj = SYSTEM_ROLES.find(r => r.id === role) || SYSTEM_ROLES[2];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-card border-border text-foreground">
                <DialogHeader>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                            <UserPlus className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold">Invite Team Member</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Grant workspace access with fine-grained authorization and role assignments.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground/90">Full Name</Label>
                        <Input
                            placeholder="e.g. Elena Rostova"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-secondary/40 border-border text-sm"
                        />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground/90">Email Address *</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                type="email"
                                required
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-secondary/40 border-border pl-9 text-sm"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground/90 flex items-center justify-between">
                            <span>Assigned Role *</span>
                            <span className="text-[10px] text-brand-blue font-medium">RBAC Level {selectedRoleObj.level}</span>
                        </Label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {SYSTEM_ROLES.filter(r => r.id !== 'owner').map((r) => (
                                <option key={r.id} value={r.id} className="bg-card text-foreground">
                                    {r.name} — ({r.description.slice(0, 50)}...)
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-muted-foreground mt-1 bg-secondary/30 p-2 rounded border border-border/50">
                            <span className="font-semibold text-foreground">{selectedRoleObj.name}:</span> {selectedRoleObj.description}
                        </p>
                    </div>

                    {/* Department / Org Unit */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground/90">Department / Unit</Label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="e.g. Engineering, Tax Advisory, Legal Compliance"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="bg-secondary/40 border-border pl-9 text-sm"
                            />
                        </div>
                    </div>

                    {/* Notice Box */}
                    <div className="p-3 bg-brand-blue/5 border border-brand-blue/20 rounded-lg text-xs flex items-start gap-2.5">
                        <Sparkles className="size-4 text-brand-blue shrink-0 mt-0.5" />
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                            An invitation token link will be created. You can share the link directly or the invitee can log in if their domain matches trusted allowlist rules.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-brand-blue hover:bg-brand-blue/90 text-white text-xs gap-1.5">
                            {loading ? 'Sending...' : (
                                <>
                                    <Check className="size-4" />
                                    Send Invitation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InviteMemberModal;
