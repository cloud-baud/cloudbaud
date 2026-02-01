import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown'; // Assuming react-markdown is available, if not fallback to plain text

const BRIDGE_ENDPOINT = 'http://localhost:3001/api'; // Our new bridge

const OllamaChatPanel = ({ isOpen, onClose }) => {
    // Read config from Settings
    const [config, setConfig] = useState({
        endpoint: localStorage.getItem('ai_endpoint') || 'http://localhost:11434/api/chat',
        model: localStorage.getItem('ai_model') || 'llama3',
        provider: localStorage.getItem('ai_provider') || 'ollama'
    });

    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hello! I am using **${config.model}** via **${config.provider}**. \n\n**Try this:**\n\`/edit src/components/portal/PortalDashboard.jsx Change the rocket icon to a star\`` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Ready'); // For granular status updates
    const scrollRef = useRef(null);

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

            if (!response.ok) throw new Error('Failed to connect to Ollama. Make sure it is running!');

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

    if (!isOpen) return null;

    return (
        <div className="fixed top-16 right-0 bottom-0 w-[400px] bg-background border-l border-border shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-blue/10 rounded-md">
                        <Sparkles className="size-4 text-brand-blue" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Agent</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                {status}
                            </span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                    <X className="size-4" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20" ref={scrollRef}>
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
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
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
                <div className="text-[10px] text-center text-muted-foreground mt-2">
                    Running locally on {config.model}
                </div>
            </div>
        </div>
    );
};

export default OllamaChatPanel;
