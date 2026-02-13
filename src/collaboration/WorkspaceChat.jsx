import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Send, Users, MoreHorizontal, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_MESSAGES = [
    {
        id: 1,
        sender: { name: 'Sarah Chen', initials: 'SC', avatar: null },
        content: 'Hey, I updated the Q3 projections based on the new tax rates.',
        timestamp: '10:30 AM',
        isMe: false
    },
    {
        id: 2,
        sender: { name: 'Mike Ross', initials: 'MR', avatar: null },
        content: 'Thanks Sarah. @Jishnu, can you review the deduction limits?',
        timestamp: '10:32 AM',
        isMe: false
    },
    {
        id: 3,
        sender: { name: 'Me', initials: 'ME', avatar: null },
        content: 'Sure, taking a look now. The W2 wages need adjustment.',
        timestamp: '10:45 AM',
        isMe: true
    },
    {
        id: 4,
        sender: { name: 'System', initials: 'SYS', system: true },
        content: 'Updated 2024 W2 Wages for CloudBaud LLC.',
        timestamp: '10:46 AM',
        isMe: false
    }
];

const WorkspaceChat = ({ className }) => {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            sender: { name: 'Me', initials: 'ME' },
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages([...messages, newMessage]);
        setInputValue('');
    };

    return (
        <div className={cn("flex flex-col h-full bg-white dark:bg-[#1a1a1a]", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Users className="size-4 text-brand-blue" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 leading-none">
                            Workspace Chat
                        </h3>
                        <p className="text-[10px] text-slate-500">3 active members</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
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

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-2 max-w-[90%]",
                                msg.isMe ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            {!msg.isMe && !msg.sender.system && (
                                <Avatar className="h-6 w-6 mt-1">
                                    <AvatarImage src={msg.sender.avatar} />
                                    <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-slate-700">
                                        {msg.sender.initials}
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div className={cn(
                                "flex flex-col",
                                msg.isMe ? "items-end" : "items-start",
                                msg.sender.system ? "w-full items-center" : ""
                            )}>
                                {msg.sender.system ? (
                                    <div className="flex items-center gap-2 my-2 w-full">
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                        <span className="text-[10px] text-slate-400 font-mono px-2 uppercase tracking-wide">
                                            {msg.content}
                                        </span>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                    </div>
                                ) : (
                                    <>
                                        {!msg.isMe && (
                                            <span className="text-[10px] text-slate-400 ml-1 mb-0.5">
                                                {msg.sender.name}
                                            </span>
                                        )}
                                        <div
                                            className={cn(
                                                "px-3 py-2 rounded-2xl text-xs",
                                                msg.isMe
                                                    ? "bg-brand-blue text-white rounded-br-none"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none"
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                        <span className="text-[9px] text-slate-300 mt-0.5 px-1">
                                            {msg.timestamp}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
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
                    />
                    <Button type="submit" size="icon" className="h-9 w-9 bg-brand-blue hover:bg-brand-blue/90 shrink-0">
                        <Send className="size-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default WorkspaceChat;
