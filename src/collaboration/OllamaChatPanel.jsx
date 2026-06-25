import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, RefreshCw, AlertCircle, Settings, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown'; // Assuming react-markdown is available, if not fallback to plain text
import { CLOUDBOT_SYSTEM_PROMPT } from './CloudBotPrompt';

const BRIDGE_ENDPOINT = 'http://localhost:3001/api'; // Our new bridge

const OllamaChatPanel = ({ 
    isOpen = true, 
    onClose, 
    variant = 'embedded', 
    trigger, 
    contextData, 
    onProcessComplete, 
    onStatusChange,
    isCollapsed = false,
    onToggleCollapse
}) => {
    // Read config from Settings with auto-migration from Llama
    const [config, setConfig] = useState(() => {
        const endpoint = localStorage.getItem('ai_endpoint') || 'http://localhost:11434/api/chat';
        let model = localStorage.getItem('ai_model') || 'qwen2.5:7b';
        if (model.toLowerCase().includes('llama')) {
            model = 'qwen2.5:7b';
            localStorage.setItem('ai_model', 'qwen2.5:7b');
        }
        const provider = localStorage.getItem('ai_provider') || 'ollama';
        return { endpoint, model, provider };
    });

    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hello! I am **CloudBot**, using **${config.model}** via **${config.provider}**. \n\n**Try this:**\n\`/edit src/components/portal/PortalDashboard.jsx Change the rocket icon to a star\`` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Ready'); // For granular status updates
    const [error, setError] = useState(null); // Added missing state
    const [suggestedAction, setSuggestedAction] = useState(null); // { type: 'apply_data', data: {...} }
    const [availableModels, setAvailableModels] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const scrollRef = useRef(null);

    // --- FETCH MODELS ---
    useEffect(() => {
        const fetchModels = async () => {
             try {
                 const res = await fetch('http://localhost:11434/api/tags');
                 if (res.ok) {
                     const data = await res.json();
                     setAvailableModels(data.models || []);
                 }
             } catch (e) {
                 console.warn("Could not fetch local models", e);
             }
        };
        fetchModels();
    }, []);

    const handleModelChange = (newModel) => {
        setConfig(prev => ({ ...prev, model: newModel }));
        localStorage.setItem('ai_model', newModel);
        setShowSettings(false);
        setMessages(prev => [...prev, { role: 'assistant', content: `Switched processing to **${newModel}**.` }]);
    };

    // --- TRIGGER EFFECT ---
    useEffect(() => {
        if (trigger && trigger.type === 'extract') {
            handleTriggeredExtraction(trigger);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]); // Note: handleTriggeredExtraction is defined below, should be stable or ref'd

    const handleTriggeredExtraction = async (trigger) => {
        // unpack context
        const documentText = (typeof trigger.data === 'string') 
            ? trigger.data 
            : (contextData?.text || trigger.data?.text || '');

        let availableRows = [];
        let sheetContext = null;

        if (contextData?.calculator) {
            sheetContext = contextData.calculator();
            availableRows = sheetContext.availableRows || [];
            // Also grab codes if available
            var availableCodes = sheetContext.availableCodes || [];
        } else {
            availableRows = contextData?.rows || [];
        }

        // 1. User/System Prompt
        const prompt = documentText 
            ? "Analyzing document content..." 
            : "Attempting to extract text from the document...";
        
        setMessages(prev => [...prev, { role: 'user', content: prompt }]);
        setIsLoading(true);
        setStatus('Analyzing Document...');

        // Check if we have document text
        if (!documentText || documentText.trim().length === 0) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `⚠️ **PDF Text Extraction Failed**\n\nI could not extract text from the PDF. This can happen when:\n- The PDF is scanned/image-based (not searchable text)\n- The PDF has complex formatting\n- Browser security restrictions\n\n**Manual Entry Required:**\nPlease manually enter the W2 values from the PDF into the excel grid:\n- Box 1: W2 Wages\n- Box 2: Federal Tax Withheld\n- Box 12: Retirement contributions\n\nOr use the Python extraction script: \`python scripts/extract_w2_plumber.py\`` 
            }]);
            setIsLoading(false);
            setStatus('Extraction Failed');
            return;
        }

        // REAL AI PROCESSING (If text is available)
        try {
            // Construct context-aware prompt
            let systemPrompt = `
            You are a sophisticated document extraction AI. 
            Extract data from the provided W2 tax document text.
            `;

            if (availableCodes && availableCodes.length > 0) {
                 systemPrompt += `\n
                **CRITICAL TASK:**
                Map the extracted values to the following UNIQUE CODES from the user's spreadsheet.
                YOU MUST RETURN A JSON OBJECT WHERE THE KEYS ARE THESE EXACT CODES.
                
                AVAILABLE TARGET CODES (Code -> Description):
                ${JSON.stringify(availableCodes, null, 2)}
                
                Prioritize finding valid numbers for these concepts:
                - Code "w2_wages" (Box 1 or Wages)
                - Code "w2_withheld" (Box 2 or Federal Tax)
                - Code "w2_401k" (Box 12 D/DD Contributions)
                
                Return a strictly valid JSON object where keys are the CODES (e.g., "w2_wages"), and values are numbers.
                DO NOT USE LARGER DESCRIPTIONS AS KEYS. USE ONLY THE CODES.
                `;
            } else if (availableRows.length > 0) {
                systemPrompt += `\n
                **CRITICAL TASK:**
                Map the extracted values to the following EXACT ROW LABELS from the user's spreadsheet.
                If you find a value for a concept, using the EXACT string from this list as the JSON key.
                
                AVAILABLE TARGET ROWS:
                ${JSON.stringify(availableRows.slice(0, 50))}... (and others)
                
                Prioritize finding valid numbers for these concepts:
                - "W2 Wages" (or similar wage income)
                - "Taxes Withheld" (Federal income tax)
                - "401k Contributions" (Box 12 D/DD)
                
                Return a strictly valid JSON object where keys are the EXACT ROW LABELS found above, and values are numbers.
                `;
            } else {
                systemPrompt += `
                Extract:
                - "W2 Wages" (Box 1)
                - "Taxes Withheld" (Box 2)
                - "401k Contribution" (Box 12)
                
                Return strictly valid JSON keys: "W2 Wages", "Taxes Withheld", "401k Contribution".
                `;
            }

            systemPrompt += `\n
            DOCUMENT TEXT:
            ${documentText.substring(0, 3000)} 
            `;

            setStatus('Sending to AI...');
            
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: systemPrompt }],
                    stream: false,
                    format: "json" 
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }
            
            const json = await response.json();
            const content = json.message.content;
            
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const extractedJson = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

            // Dynamic Response Generation based on keys found
            let summaryLines = Object.entries(extractedJson).map(([k, v]) => {
                let cellInfo = '';
                if (sheetContext) {
                    // Try to find row number by Code first, then Label
                    if (sheetContext.codeRowMap && sheetContext.codeRowMap[k]) {
                         const rowNum = sheetContext.codeRowMap[k];
                         const colLetter = sheetContext.colLetter || '?';
                         cellInfo = ` (Cell **${colLetter}${rowNum}**)`;
                    } else if (sheetContext.rowMap && sheetContext.rowMap[k]) {
                        const rowNum = sheetContext.rowMap[k];
                        const colLetter = sheetContext.colLetter || '?';
                        cellInfo = ` (Cell **${colLetter}${rowNum}**)`;
                    }
                }
                return `**${k}**${cellInfo}: $${Number(v).toLocaleString()}`;
            }).join('\n');

            const responseText = `I have analyzed the document and mapped it to your spreadsheet rows:\n\n` +
                summaryLines + 
                `\n\nShall I apply these updates?`;

            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
            setSuggestedAction({
                type: 'apply_data',
                title: 'Apply Extracted Data',
                description: 'Update the spreadsheet with these values?',
                data: extractedJson
            });

        } catch (err) {
            console.error("AI Analysis Failed", err);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `⚠️ **AI Analysis Failed**\n\n${err.message}\n\n**Troubleshooting:**\n- Ensure Ollama is running\n- Check model availability` 
            }]);
        } finally {
            setIsLoading(false);
            setStatus('Ready');
        }
    };

    const handleApplyAction = () => {
        console.log("Applying suggested action:", suggestedAction);
        if (suggestedAction && suggestedAction.type === 'apply_data') {
            if (onProcessComplete) {
                console.log("Invoking onProcessComplete with:", suggestedAction.data);
                onProcessComplete(suggestedAction.data);
                setMessages(prev => [...prev, { role: 'assistant', content: '✅ **Updates Applied.** The spreadsheet has been updated.' }]);
                setSuggestedAction(null);
            } else {
                console.error("onProcessComplete prop is missing!");
                setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ **Error:** Cannot apply updates. Application interface is disconnected.' }]);
            }
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
                
                // ... (existing edit logic) ...
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

            // 2. Check for Extraction/Analysis keywords (Interception)
            if (originalInput.toLowerCase().match(/(extract|analyze).*(tax|w2|document|values)/i)) {
                 // If we have real context data (from props), use it!
                 if (contextData) {
                     handleTriggeredExtraction({ data: contextData });
                 } else {
                     // No document available
                     setMessages(prev => [...prev, { 
                         role: 'assistant', 
                         content: `⚠️ **No Document Available**\n\nPlease upload a document first using the "Open Return" or "Link Doc" buttons, then click the "Extract" button.\n\nOr manually enter the values from your tax documents.` 
                     }]);
                     setIsLoading(false);
                     setStatus('Ready');
                 }
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
                    messages: [
                        { role: 'system', content: CLOUDBOT_SYSTEM_PROMPT },
                        ...messages,
                        userMessage
                    ].map(m => ({ role: m.role, content: m.content })),
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
                    console.error("Error parsing response error", e);
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

    if (isCollapsed) {
        return (
            <div className="h-full flex flex-col items-center py-6 justify-between bg-card select-none">
                {/* Top Slot: Expand button */}
                <div className="flex flex-col items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all shadow-sm"
                        onClick={onToggleCollapse}
                        title="Expand CloudBot"
                    >
                        <Bot className="size-5" />
                    </Button>
                </div>

                {/* Middle Slot: Quick Actions */}
                <div className="flex flex-col items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                        onClick={() => {
                            setMessages([{ role: 'assistant', content: `Hello! I am **CloudBot**, using **${config.model}** via **${config.provider}**. \n\n**Try this:**\n\`/edit src/components/portal/PortalDashboard.jsx Change the rocket icon to a star\`` }]);
                            setSuggestedAction(null);
                            setError(null);
                        }}
                        title="New Conversation"
                    >
                        <Plus className="size-4" />
                    </Button>
                    
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-foreground"
                        onClick={() => {
                            onToggleCollapse();
                            setShowSettings(true);
                        }}
                        title="Configure Model"
                    >
                        <Settings className="size-4" />
                    </Button>
                </div>

                {/* Bottom Slot: Mini Status */}
                <div className="flex flex-col items-center gap-2">
                    <div 
                        className={cn(
                            "size-2 rounded-full", 
                            error ? "bg-destructive animate-pulse" : (isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")
                        )} 
                        title={error ? "Offline" : (isLoading ? "Thinking..." : "Ready")}
                    />
                </div>
            </div>
        );
    }

    const containerClasses = variant === 'overlay'
        ? "fixed top-16 right-0 bottom-0 w-[400px] bg-background border-l border-border shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300"
        : "h-full flex flex-col bg-background";

    return (
        <div className={containerClasses}>
            {/* Header (For Overlay and Docked variants) */}
            {(variant === 'overlay' || variant === 'docked') && (
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md transition-colors", error ? "bg-destructive/10 text-destructive" : "bg-purple-500/10 text-purple-600")}>
                            <Sparkles className="size-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">CloudBot</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={cn("size-2 rounded-full", error ? "bg-destructive" : (isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'))} />
                                <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                    {error ? 'Offline' : status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={variant === 'docked' ? onToggleCollapse : onClose} 
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        title={variant === 'docked' ? "Collapse CloudBot" : "Close"}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            )}

            {/* Status Bar removed for embedded variant as requested - status now handled by parent header */}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" ref={scrollRef}>
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

            {/* Settings Overlay */}
            {showSettings && (
                <div className="absolute inset-0 bg-background/95 z-50 flex flex-col p-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Settings className="size-5" />
                            AI Configuration
                        </h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                            <X className="size-5" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Local Model</label>
                            <div className="grid grid-cols-1 gap-2">
                                {availableModels.length > 0 ? (
                                    availableModels.map(m => (
                                        <button
                                            key={m.name}
                                            onClick={() => handleModelChange(m.name)}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all",
                                                config.model === m.name 
                                                    ? "bg-brand-blue/10 border-brand-blue text-brand-blue font-medium" 
                                                    : "bg-card hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <span className="truncate">{m.name}</span>
                                            {config.model === m.name && <div className="size-2 rounded-full bg-brand-blue" />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 rounded-lg bg-amber-50 text-amber-800 text-sm border border-amber-200">
                                        No models found or Ollama is not running. 
                                        <br/>
                                        Ensure <code>ollama serve</code> is running.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        className="pr-20 shadow-sm"
                        disabled={isLoading}
                    />
                    <div className="absolute right-1 top-1 flex items-center gap-1">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
                            onClick={() => {
                                setMessages([{ role: 'assistant', content: `Hello! I am using **${config.model}** via **${config.provider}**. \n\n**Try this:**\n\`/edit src/components/portal/PortalDashboard.jsx Change the rocket icon to a star\`` }]);
                                setSuggestedAction(null);
                                setError(null);
                            }}
                            title="New Conversation"
                        >
                            <Plus className="size-4" />
                        </Button>
                         <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowSettings(!showSettings)}
                            title="Configure Model"
                        >
                            <Settings className="size-4" />
                        </Button>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="h-8 w-8 rounded-md"
                        >
                            {isLoading ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
                        </Button>
                    </div>
                </form>
                {/* Footer info removed as requested */}
            </div>
        </div>
    );
};

export default OllamaChatPanel;
