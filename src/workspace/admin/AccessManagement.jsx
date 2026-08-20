import React, { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Trash2, UserPlus, Check, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';

const AccessManagement = () => {
    const { user } = useAuth();
    const [accessList, setAccessList] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Only allow specific admin to view this (client-side check, improved by RLS)
    const isAdmin = user?.email?.toLowerCase() === 'jish.nath@cloudbaud.com';

    useEffect(() => {
        if (isAdmin) {
            fetchAccessList();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAccessList = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('allowed_access')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAccessList(data || []);
        } catch (err) {
            console.error('Error fetching access list:', err);
            setError('Failed to load access list.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccess = async (e) => {
        e.preventDefault();
        if (!newEmail) return;

        try {
            const { error } = await supabase
                .from('allowed_access')
                .insert([
                    { email_pattern: newEmail, description: description || 'Manually added' }
                ]);

            if (error) throw error;

            setNewEmail('');
            setDescription('');
            fetchAccessList();
        } catch (err) {
            console.error('Error adding access:', err);
            setError('Failed to add access rule.');
        }
    };

    const handleDeleteAccess = async (id) => {
        try {
            const { error } = await supabase
                .from('allowed_access')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchAccessList();
        } catch (err) {
            console.error('Error deleting access:', err);
            setError('Failed to delete access rule.');
        }
    };

    if (!isAdmin) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <Alert variant="destructive" className="max-w-md">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
            <div>
                <h1 className="text-xl font-bold text-white mb-0.5 tracking-tight">Access Management</h1>
                <p className="text-xs text-slate-400">Manage who can log in to the CloudBaud portal.</p>
            </div>

            {/* Add New Rule */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-brand-blue" />
                        Grant Access
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddAccess} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email or Domain</label>
                            <Input
                                placeholder="e.g. user@gmail.com or @partner.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Description</label>
                            <Input
                                placeholder="e.g. External Auditor"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-white"
                            />
                        </div>
                        <Button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold">
                            <Check className="mr-2 h-4 w-4" />
                            Add Rule
                        </Button>
                    </form>
                    {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                </CardContent>
            </Card>

            {/* List Rules */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Active Access Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-slate-400">Loading rules...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 text-sm uppercase">
                                        <th className="py-3 px-4">Pattern</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {accessList.map((rule) => (
                                        <tr key={rule.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-brand-blue">
                                                {rule.email_pattern}
                                            </td>
                                            <td className="py-3 px-4">
                                                {rule.description}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteAccess(rule.id)}
                                                    className="text-slate-500 hover:text-red-400 hover:bg-red-900/10"
                                                    disabled={rule.email_pattern === '@cloudbaud.com'} // Prevent deleting master rule
                                                    title={rule.email_pattern === '@cloudbaud.com' ? "Cannot delete primary domain" : "Revoke Access"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {accessList.length === 0 && (
                                        <tr>
                                            <td colspan="3" className="py-8 text-center text-slate-500">
                                                No specific access rules found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AccessManagement;

