import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Send, Users, MoreHorizontal, Phone, Video, UserPlus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
    getWorkspaceMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    getWorkspaceMembers,
    resolveWorkspaceFromRoute,
} from './services/workspaceService';
import { supabase } from '@/shared/lib/supabase';

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const WorkspaceChat = ({ className, workspaceId: propWorkspaceId }) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [resolvedWs, setResolvedWs] = useState(null); // { id, name, type }
    const scrollRef = useRef(null);
    const channelRef = useRef(null);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setCurrentUserId(data.user.id);
        });
    }, []);

    // Resolve workspace UUID from route if not a UUID already
    useEffect(() => {
        async function resolve() {
            if (!propWorkspaceId) return;

            // Check if it's already a UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(propWorkspaceId)) {
                setResolvedWs({ id: propWorkspaceId, name: propWorkspaceId });
                return;
            }

            // Try to resolve from route path
            const routePath = `/workspace/${propWorkspaceId}`;
            const ws = await resolveWorkspaceFromRoute(routePath);
            if (ws) {
                setResolvedWs(ws);
            } else {
                // Fallback: try to find by slug
                const { data } = await supabase
                    .from('workspaces')
                    .select('id, name, type, slug')
                    .eq('slug', propWorkspaceId)
                    .single();
                if (data) setResolvedWs(data);
            }
        }
        resolve();
    }, [propWorkspaceId]);

    // Load messages and members once workspace is resolved
    const loadData = useCallback(async () => {
        if (!resolvedWs?.id) return;
        try {
            setLoading(true);
            const [msgs, mems] = await Promise.all([
                getWorkspaceMessages(resolvedWs.id),
                getWorkspaceMembers(resolvedWs.id),
            ]);
            setMessages(msgs);
            setMembers(mems);
        } catch (err) {
            console.error('Error loading workspace data:', err);
        } finally {
            setLoading(false);
        }
    }, [resolvedWs?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Subscribe to real-time messages
    useEffect(() => {
        if (!resolvedWs?.id) return;

        const channel = subscribeToMessages(resolvedWs.id, (newMessage) => {
            setMessages(prev => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
            });
        });
        channelRef.current = channel;

        return () => {
            unsubscribeFromMessages(channelRef.current);
        };
    }, [resolvedWs?.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !resolvedWs?.id) return;

        const content = inputValue;
        setInputValue('');

        try {
            await sendMessage(resolvedWs.id, content);
        } catch (err) {
            console.error('Error sending message:', err);
            setInputValue(content);
        }
    };

    const getSenderName = (senderId) => {
        if (senderId === currentUserId) return 'Me';
        const member = members.find(m => m.user_id === senderId);
        if (member?.contact?.name) return member.contact.name;
        return 'Team member';
    };

    const activeMembers = members.filter(m => m.status === 'active');
    const wsName = resolvedWs?.name || propWorkspaceId || 'Workspace';

    return (
        <div className={cn("flex flex-col h-full bg-white dark:bg-[#1a1a1a]", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Users className="size-4 text-brand-blue" />
                        {activeMembers.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 leading-none">
                            {wsName} Chat
                        </h3>
                        <p className="text-[10px] text-slate-500">
                            {members.length} member{members.length !== 1 ? 's' : ''}
                            {activeMembers.length > 0 && ` · ${activeMembers.length} active`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Invite member">
                        <UserPlus className="size-3.5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Phone className="size-3.5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Video className="size-3.5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="size-3.5 text-slate-500" />
                    </Button>
                </div>
            </div>

            {/* Members Bar */}
            {members.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1a1a]">
                    {members.slice(0, 6).map((member) => (
                        <Avatar key={member.id} className="h-6 w-6" title={member.contact?.name || 'Member'}>
                            <AvatarFallback className={cn(
                                "text-[9px] font-medium",
                                member.status === 'active'
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            )}>
                                {getInitials(member.contact?.name)}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                    {members.length > 6 && (
                        <span className="text-[10px] text-slate-400 ml-1">+{members.length - 6}</span>
                    )}
                </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-xs text-slate-400 py-8">Loading messages...</div>
                    ) : !resolvedWs ? (
                        <div className="text-center text-xs text-slate-400 py-8">
                            Resolving workspace...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId;
                            const isSystem = msg.message_type === 'system';
                            const senderName = getSenderName(msg.sender_id);

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-2 max-w-[90%]",
                                        isMe ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    {!isMe && !isSystem && (
                                        <Avatar className="h-6 w-6 mt-1">
                                            <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-slate-700">
                                                {getInitials(senderName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={cn(
                                        "flex flex-col",
                                        isMe ? "items-end" : "items-start",
                                        isSystem ? "w-full items-center" : ""
                                    )}>
                                        {isSystem ? (
                                            <div className="flex items-center gap-2 my-2 w-full">
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                                <span className="text-[10px] text-slate-400 font-mono px-2 uppercase tracking-wide">
                                                    {msg.content}
                                                </span>
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                            </div>
                                        ) : (
                                            <>
                                                {!isMe && (
                                                    <span className="text-[10px] text-slate-400 ml-1 mb-0.5">
                                                        {senderName}
                                                    </span>
                                                )}
                                                <div
                                                    className={cn(
                                                        "px-3 py-2 rounded-2xl text-xs",
                                                        isMe
                                                            ? "bg-brand-blue text-white rounded-br-none"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none"
                                                    )}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className="text-[9px] text-slate-300 mt-0.5 px-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-brand-blue"
                        disabled={!resolvedWs}
                    />
                    <Button type="submit" size="icon" className="h-9 w-9 bg-brand-blue hover:bg-brand-blue/90 shrink-0" disabled={!resolvedWs}>
                        <Send className="size-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default WorkspaceChat;
