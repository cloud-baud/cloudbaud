import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown'; // Assuming react-markdown is available, if not fallback to plain text

const BRIDGE_ENDPOINT = 'http://localhost:3001/api'; // Our new bridge

const OllamaChatPanel = ({ isOpen = true, onClose, variant = 'embedded', trigger, onProcessComplete, onStatusChange }) => {
    // Read config from Settings
    const [config, setConfig] = useState({
        endpoint: localStorage.getItem('ai_endpoint') || 'http://localhost:11434/api/chat',
        model: localStorage.getItem('ai_model') || 'llama3.1:8b',
        provider: localStorage.getItem('ai_provider') || 'ollama'
    });

    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hello! I am using **${config.model}** via **${config.provider}**. \n\n**Try this:**\n\`/edit src/components/portal/PortalDashboard.jsx Change the rocket icon to a star\`` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Ready'); // For granular status updates
    const [error, setError] = useState(null); // Added missing state
    const [suggestedAction, setSuggestedAction] = useState(null); // { type: 'apply_data', data: {...} }
    const scrollRef = useRef(null);

    // --- TRIGGER EFFECT ---
    useEffect(() => {
        if (trigger && trigger.type === 'extract') {
            handleTriggeredExtraction(trigger);
        }
    }, [trigger]);

    const handleTriggeredExtraction = async (trigger) => {
        // 1. User/System Prompt
        const prompt = "Please analyze the currently open document and extract tax-related fields.";
        setMessages(prev => [...prev, { role: 'user', content: prompt }]);
        setIsLoading(true);
        setStatus('Analyzing Document...');

        // 2. Simulate AI Processing Delay
        setTimeout(() => {
            // Mock Response based on typical W2 data
            const extractedData = {
                "W2 Wages": 142500.00,
                "Taxes Withheld": 38450.25,
                "401k Contribution": 19500.00
            };

            const responseText = `I have analyzed the document on your local machine (${config.model}).\n\n` +
                `**W2 Wages**: $142,500.00\n` +
                `**Taxes Withheld**: $38,450.25\n` +
                `**401k Contribution**: $19,500.00\n\n` +
                `The following values have been extracted for your review.`;

            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
            setIsLoading(false);
            setStatus('Local Ready');

            // Set prompt for user action instead of auto-applying
            setSuggestedAction({
                type: 'apply_data',
                title: 'Apply Extracted Data',
                description: 'Update the current column with these values?',
                data: extractedData
            });

        }, 1500);
    };

    const handleApplyAction = () => {
        if (suggestedAction && suggestedAction.type === 'apply_data') {
            onProcessComplete && onProcessComplete(suggestedAction.data);
            setMessages(prev => [...prev, { role: 'assistant', content: '✅ **Updates Applied.** The spreadsheet has been updated.' }]);
            setSuggestedAction(null);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const originalInput = input;
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStatus('Thinking...');
        setError(null);

        try {
            // --- AGENTIC LOGIC ---
            // 1. Check for /edit command
            if (originalInput.startsWith('/edit')) {
                const parts = originalInput.split(' ');
                const targetFile = parts[1];
                const instruction = parts.slice(2).join(' ');

                if (!targetFile || !instruction) {
                    throw new Error("Usage: /edit <path/to/file> <instruction>");
                }

                // A. READ FILE
                setStatus(`Reading ${targetFile}...`);
                const readRes = await fetch(`${BRIDGE_ENDPOINT}/read`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePath: targetFile })
                });

                if (!readRes.ok) throw new Error("Could not read file. Check path.");
                const { content: currentCode } = await readRes.json();

                // B. PROMPT ENGINEERING
                const prompt = `
                You are an expert React Developer.
                TASK: ${instruction}
                
                FILE: ${targetFile}
                CURRENT CODE:
                \`\`\`javascript
                ${currentCode}
                \`\`\`
                
                OUTPUT: Return ONLY the full updated code for this file. No conversational text. No markdown fences if possible, or standard \`\`\`jsx blocks.
                `;

                // C. SEND TO OLLAMA (Non-streaming for safety in this v1)
                setStatus("Generating code (this may take a moment)...");
                // Note: We use a separate "system" prompt context for the edit
                const aiRes = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: config.model,
                        messages: [{ role: 'user', content: prompt }],
                        stream: false
                    })
                });

                const aiJson = await aiRes.json();
                let newCode = aiJson.message.content;

                // Cleanup Markdown fences if present
                newCode = newCode.replace(/```(javascript|jsx|js)?/g, '').replace(/```/g, '').trim();

                // D. WRITE FILE
                setStatus(`Writing changes to ${targetFile}...`);
                const writeRes = await fetch(`${BRIDGE_ENDPOINT}/write`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePath: targetFile, content: newCode })
                });

                if (!writeRes.ok) throw new Error("Failed to write to file system.");

                setMessages(prev => [...prev, { role: 'assistant', content: `✅ Successfully updated **${targetFile}**. Vite should hot-reload now.` }]);
                setIsLoading(false);
                setStatus('Ready');
                return;
            }

            // --- STANDARD CHAT FALLBACK ---
            // Create a placeholder for the bot's response
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: config.model,
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                    stream: true
                })
            });

            if (!response.ok) {
                let errorMsg = 'Failed to connect to Ollama. Make sure it is running!';
                try {
                    const errorText = await response.text();
                    // Try to parse JSON error if possible
                    const errorJson = JSON.parse(errorText);
                    errorMsg = errorJson.error || errorText;
                } catch (e) {
                    errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Parse typical NDJSON from Ollama
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) {
                            accumulatedResponse += json.message.content;

                            // Update the last message (assistant) with new content
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                newMsgs[newMsgs.length - 1].content = accumulatedResponse;
                                return newMsgs;
                            });
                        }
                        if (json.done) {
                            setIsLoading(false);
                        }
                    } catch (e) {
                        console.error("Error parsing chunk", e);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
            // Remove the empty loading message if we failed completely
            setMessages(prev => {
                if (prev[prev.length - 1].content === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
            setStatus('Ready');
        }
    };

    // --- STATUS REPORTING TO PARENT ---
    useEffect(() => {
        if (onStatusChange) {
            onStatusChange({ status, error, isLoading });
        }
    }, [status, error, isLoading, onStatusChange]);

    if (!isOpen) return null;

    const containerClasses = variant === 'overlay'
        ? "fixed top-16 right-0 bottom-0 w-[400px] bg-background border-l border-border shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300"
        : "h-full flex flex-col bg-background";

    return (
        <div className={containerClasses}>
            {/* Header (Only for Overlay) */}
            {variant === 'overlay' && (
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md transition-colors", error ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600")}>
                            <Sparkles className="size-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">AI Agent</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={cn("size-2 rounded-full", error ? "bg-destructive" : (isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'))} />
                                <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                    {error ? 'Offline' : status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                        <X className="size-4" />
                    </Button>
                </div>
            )}

            {/* Status Bar removed for embedded variant as requested - status now handled by parent header */}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                        <div className={cn(
                            "size-8 rounded-full flex items-center justify-center shrink-0 border",
                            msg.role === 'user' ? "bg-primary text-primary-foreground border-transparent" : "bg-card border-border"
                        )}>
                            {msg.role === 'user' ? <User className="size-4" /> : <Bot className="size-4 text-brand-blue" />}
                        </div>
                        <div className={cn(
                            "rounded-lg p-3 text-sm max-w-[85%] shadow-sm",
                            msg.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-card-foreground"
                        )}>
                            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {suggestedAction && (
                    <div className="p-4 rounded-lg bg-brand-blue/5 border border-brand-blue/20 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 mx-4 mb-4">
                        <div className="space-y-1">
                            <h4 className="font-semibold text-sm text-brand-blue flex items-center gap-2">
                                <Sparkles className="size-4" />
                                {suggestedAction.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">{suggestedAction.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleApplyAction} className="h-7 text-xs bg-brand-blue hover:bg-brand-blue/90 text-white">
                                Apply Updates
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSuggestedAction(null)} className="h-7 text-xs">
                                Dismiss
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle className="size-4 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="font-semibold">Connection Error</p>
                            <p className="opacity-90">{error}</p>
                            <p className="text-xs opacity-75 mt-1">Run: <code className="bg-black/10 px-1 rounded">OLLAMA_ORIGINS="*" ollama serve</code></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="pr-12 shadow-sm"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-1 top-1 h-8 w-8 rounded-md"
                    >
                        {isLoading ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </Button>
                </form>
                {/* Footer info removed as requested */}
            </div>
        </div>
    );
};

export default OllamaChatPanel;
