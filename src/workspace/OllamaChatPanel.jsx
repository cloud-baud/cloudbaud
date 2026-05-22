import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, Bot, User, Sparkles, RefreshCw, AlertCircle, Settings, ChevronDown, Plus, Paperclip, FileIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import AiControlPlane from './AiControlPlane';
import { createContact } from './crm/contactsService';

const OLLAMA_BASE = 'http://localhost:11434';
const BRIDGE_ENDPOINT = 'http://localhost:4001';

function buildSystemPrompt(contextData) {
    const hasInboxContext = Boolean(contextData?.inbox?.available && Array.isArray(contextData?.inbox?.messages));

    return {
        role: 'system',
        content: `You are a helpful AI assistant embedded in CloudBaud, a professional workspace application.

WHAT YOU CAN DO:
- Answer questions about code, business, finance, and general topics.
- Review, analyze, and answer questions about documents (e.g. tax returns, W-2 forms, PDFs, or spreadsheet data) when the text/context of these documents is provided directly to you in the prompt or conversation history. You are fully capable of doing this because the application extracts the text and passes it to you!
- Help extract structured data from text (e.g. contact info from a business card).
- Explain concepts and provide guidance.
- Answer inbox/email questions ONLY when inbox context is explicitly provided in the prompt.

CRITICAL RULES - WHAT YOU CANNOT DO:
- You CANNOT see the user's screen, UI, or active panels in real time (though you CAN read any document text or layout data that has been extracted and passed to you in the conversation).
- You CANNOT read from or query any database directly in real time (though you CAN reference any ledger rows, draft figures, or spreadsheet context passed to you).
- You CANNOT verify whether data was saved or exists in the live database.
- You CANNOT check, browse, or inspect the live CRM, contact list, or dashboard in real time.
- You CANNOT perform any action in the application — you can only generate text responses.
- NEVER claim to have accessed the live database or live CRM directly; clarify that you are looking at the provided context or extracted text.
- NEVER fabricate or simulate UI interactions, database lookups, or status checks.
- If the user asks you to verify something was saved, tell them to check the CRM Contacts tab or the Tax ledger, but you can confirm what numbers you extracted or have in your context.

${hasInboxContext ? `INBOX CONTEXT RULES:
- You have been provided a local inbox snapshot in the user message context.
- You MAY summarize, filter, and answer questions based on that provided inbox snapshot only.
- If details are missing from snapshot (e.g., full body text), say that clearly.` : `INBOX CONTEXT RULES:
- If no inbox snapshot is provided, clearly say you cannot access inbox content automatically.`}

When the user provides contact details and asks you to save/enter/add them, the application will handle saving automatically. Just acknowledge the request naturally — do NOT pretend to perform the save yourself.

Be concise, honest, and helpful. If you don't know something, say so.`
    };
}

function buildInboxContextBlock(contextData) {
    const inbox = contextData?.inbox;
    if (!inbox?.available || !Array.isArray(inbox.messages) || inbox.messages.length === 0) return '';

    const lines = inbox.messages.slice(0, 25).map((m, idx) => {
        const toList = Array.isArray(m.to) ? m.to.join(', ') : '';
        const ccList = Array.isArray(m.cc) ? m.cc.join(', ') : '';
        return `${idx + 1}. id=${m.id}; from=${m.from}; to=${toList}; cc=${ccList}; subject=${m.subject}; createdAt=${m.createdAt}; attachments=${m.attachmentCount}`;
    });

    return `INBOX CONTEXT (local snapshot):\n- total=${inbox.total || inbox.messages.length}\n- fetchedAt=${inbox.fetchedAt || 'unknown'}\n${lines.join('\n')}`;
}

const OllamaChatPanel = ({ isOpen = true, onClose, variant = 'embedded', trigger, contextData, onProcessComplete, onStatusChange }) => {
    // Read config from Settings
    const [config, setConfig] = useState({
        endpoint: localStorage.getItem('ai_endpoint') || `${OLLAMA_BASE}/api/chat`,
        model: localStorage.getItem('ai_model') || 'llama3.1:8b',
        provider: localStorage.getItem('ai_provider') || 'ollama'
    });

    const defaultGreeting = `Hello! I am using **${config.model}** via **${config.provider}**.\n\nType \`/help\` to see all available slash commands.`;
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('ai_chat_messages');
            if (saved) return JSON.parse(saved);
        } catch {}
        return [{ role: 'assistant', content: defaultGreeting }];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Ready'); // For granular status updates
    const [error, setError] = useState(null); // Added missing state
    const [suggestedAction, setSuggestedAction] = useState(null); // { type: 'apply_data', data: {...} }
    const [availableModels, setAvailableModels] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const [attachedFile, setAttachedFile] = useState(null); // { name, type, content, size }
    const [activePdfText, setActivePdfText] = useState('');
    const [activePdfName, setActivePdfName] = useState('');
    const runtimeSystemPrompt = useMemo(() => buildSystemPrompt(contextData), [contextData]);

    // Persist messages to localStorage
    useEffect(() => {
        try { localStorage.setItem('ai_chat_messages', JSON.stringify(messages)); } catch {}
    }, [messages]);

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
        if (trigger) {
            if (trigger.type === 'extract') {
                handleTriggeredExtraction(trigger);
            } else if (trigger.type === 'audit') {
                handleTriggeredAudit(trigger);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]); // Note: handleTriggeredExtraction is defined below, should be stable or ref'd

    const handleTriggeredExtraction = async (trigger) => {
        // unpack context
        const documentText = (typeof trigger.data === 'string') 
            ? trigger.data 
            : (contextData?.text || trigger.data?.text || '');

        // Set active PDF text for follow-up questions
        if (documentText) {
            setActivePdfText(documentText);
            setActivePdfName(trigger.data?.name || activePdfName || 'Extracted Tax Document');
        }

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

    const handleTriggeredAudit = async (trigger) => {
        const text = trigger.data?.text || '';
        const name = trigger.data?.name || 'CPA Tax Return';

        setActivePdfText(text);
        setActivePdfName(name);

        setMessages(prev => [...prev, { role: 'user', content: `Auditing and analyzing CPA tax return: **${name}**...` }]);
        setIsLoading(true);
        setStatus('Auditing Return...');

        if (!text || text.trim().length === 0) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ **Audit Failed: Extracted PDF text is empty.**\n\nI could not extract text from the PDF. Please check if the file is scanned or encrypted.`
            }]);
            setIsLoading(false);
            setStatus('Audit Failed');
            return;
        }

        try {
            // Format draft data for the prompt
            let draftSummary = '';
            if (contextData?.draftData) {
                draftSummary = contextData.draftData.map(s => {
                    const itemLines = s.items.map(i => {
                        let lines = `- ${i.label} (${i.formLine || 'Line Info N/A'}): $${(i.amount !== null ? i.amount.toLocaleString() : 'N/A')}`;
                        if (i.children && i.children.length > 0) {
                            const childLines = i.children.map(c => `  * ${c.label}: $${(c.amount !== null ? c.amount.toLocaleString() : 'N/A')}`).join('\n');
                            lines += '\n' + childLines;
                        }
                        return lines;
                    }).join('\n');
                    return `### ${s.title}\n${itemLines}`;
                }).join('\n\n');
            }

            const prompt = `
You are an expert IRS Tax Auditor and CPA reviewing David Rumsey CPA's finalized tax return prepared for Deepika and Jishnu.
You have the raw, draft spreadsheet calculations from the taxpayer, and the extracted text from the finalized CPA Tax Return PDF.

Your task is to:
1. Cross-examine the finalized CPA tax return text against the raw draft spreadsheet numbers.
2. Identify all matches and any discrepancies.
3. Pay close attention to major figures like:
   - Wages (Salary: $63,132.46)
   - CloudBaud Consulting gross business income ($335,686.00) vs Net Profit ($334,565.42)
   - Robertos gross or net losses (-$44,581.92)
   - Deductions (Schedule A Mortgage, Real Estate taxes)
   - SEP IRA or other adjustments
   - Amount due or refunds ($49,394 due)
4. Highlight why David's CPA software calculations might differ from the taxpayer's draft (e.g. self-employment tax, QBI deduction, Schedule A limitations, SEP contributions).
5. Output a highly professional, beautifully formatted, easy-to-read audit and discrepancy report using Markdown tables, lists, and bold headings. Avoid vague statements. Be extremely specific using the actual numbers.

RAW DRAFT SPREADSHEET NUMBERS:
${draftSummary || 'None provided.'}

EXTRACTED TEXT FROM CPA TAX RETURN PDF (${name}):
${text.substring(0, 10000)}

Output the audit report now:
`;

            setStatus('Running Audit...');
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }

            const json = await response.json();
            const auditReport = json.message.content;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `### 📊 CPA Return Audit & Discrepancy Analysis\n\nI have successfully parsed **${name}** and cross-examined the numbers against your active draft spreadsheet values.\n\n${auditReport}\n\n*Note: This analysis is preserved. You can now ask any follow-up questions about this PDF directly in the chat!*`
            }]);

        } catch (err) {
            console.error("AI Audit Failed", err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ **AI Audit & Analysis Failed**\n\n${err.message}\n\n**Troubleshooting:**\n- Ensure Ollama is running at ${OLLAMA_BASE}\n- Verify your model is loaded`
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
                console.log("onProcessComplete prop is missing, dispatching custom window event 'ollama-process-complete'");
                
                // Dispatch custom window event as a robust fallback
                const event = new CustomEvent('ollama-process-complete', {
                    detail: {
                        data: suggestedAction.data,
                        action: suggestedAction
                    }
                });
                window.dispatchEvent(event);
                
                setMessages(prev => [...prev, { role: 'assistant', content: '✅ **Updates Applied.** The spreadsheet has been updated.' }]);
                setSuggestedAction(null);
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

        // If a file is attached, prepend its content to the message
        let fullInput = originalInput;
        if (attachedFile) {
            const fileContext = attachedFile.content.length > 8000
                ? attachedFile.content.substring(0, 8000) + '\n... [truncated]'
                : attachedFile.content;
            fullInput = `[Attached file: ${attachedFile.name}]\n\n${fileContext}\n\nUser message: ${originalInput}`;
            setAttachedFile(null); // Clear after use
        }

        try {
            // --- SLASH COMMAND REGISTRY ---
            const SLASH_COMMANDS = [
                { cmd: '/help', args: '', desc: 'Show this command reference' },
                { cmd: '/audit', args: '', desc: 'Re-run the audit on the currently loaded PDF' },
                { cmd: '/edit', args: '<file> <instruction>', desc: 'Edit a source file via AI' },
                { cmd: '/contact', args: '<business card text>', desc: 'Extract & save a contact to CRM' },
            ];

            // --- AGENTIC LOGIC ---
            // 0. Check for /help command
            if (originalInput.trim() === '/help' || originalInput.trim() === '/?') {
                const helpTable = SLASH_COMMANDS.map(c => 
                    `| \`${c.cmd}\` | ${c.args ? `\`${c.args}\`` : ''} | ${c.desc} |`
                ).join('\n');
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: `**📖 Slash Commands**\n\n| Command | Arguments | Description |\n|---------|-----------|-------------|\n${helpTable}\n\n**Examples:**\n\`\`\`\n/contact David Rumsey CPA, david@email.com, 360-651-8640\n/edit src/App.jsx Change the title to "My App"\n\`\`\`\n\n_You can also type naturally — e.g. "enter this contact for me: ..."_`
                }]);
                setIsLoading(false);
                setStatus('Ready');
                return;
            }

            // 0.5. Check for /audit command
            if (originalInput.trim() === '/audit') {
                if (!activePdfText) {
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: `⚠️ **No CPA tax return PDF currently loaded.**\n\nPlease open the CPA PDF in the Document Viewer and click **"Run AI Audit & Analysis"** to start.` 
                    }]);
                    setIsLoading(false);
                    setStatus('Ready');
                    return;
                }
                handleTriggeredAudit({ data: { text: activePdfText, name: activePdfName } });
                return;
            }

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

            // 3. Check for contact entry request
            // Approach: /contact command OR broad keyword match OR data heuristic
            const lower = originalInput.toLowerCase();
            const isContactCommand = originalInput.startsWith('/contact');
            const hasContactKeyword = lower.includes('contact') || lower.includes('business card') || lower.includes('add to crm');
            const hasContactAction = /(enter|add|create|save|import|scan|put|store|record|register)/i.test(lower);
            const hasContactData = /[\w.-]+@[\w.-]+|(\d{3}[\s.-]?\d{3}[\s.-]?\d{4})/i.test(originalInput);
            const contactMatch = isContactCommand || (hasContactKeyword && hasContactAction) || (hasContactKeyword && hasContactData) || (hasContactAction && hasContactData);

            if (contactMatch) {
                // Strip the /contact prefix if present
                const contactText = isContactCommand ? originalInput.replace(/^\/contact\s*/i, '') : originalInput;

                if (!contactText.trim()) {
                    setMessages(prev => [...prev, { role: 'assistant', content: '**Usage:** `/contact David Rumsey CPA, david@example.com, 555-123-4567`\n\nPaste any business card text after `/contact` and I\'ll extract and save it to your CRM.' }]);
                    setIsLoading(false);
                    setStatus('Ready');
                    return;
                }

                setStatus('Extracting contact info...');
                const extractPrompt = `Extract the contact information from the following text. Return ONLY a valid JSON object with these exact keys: name, company, title, email, phone, address, website, category, notes.
For category, choose from: "business", "tax-prep", "career", "personal". Default to "business".
For address, include full street address, city, state, zip.
For website, include any URL or web address.
For notes, include any remaining info not captured by other fields.
If a field is not found, use "".

Text:
---
${contactText}
---

Return ONLY the JSON object, no markdown, no explanation.`;

                const extractRes = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: config.model,
                        messages: [runtimeSystemPrompt, { role: 'user', content: extractPrompt }],
                        stream: false,
                    }),
                });

                if (!extractRes.ok) throw new Error('Ollama error during contact extraction');
                const extractData = await extractRes.json();
                let content = extractData.message?.content || '';
                content = content.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();

                try {
                    const parsed = JSON.parse(content);
                    const contactData = {
                        name: parsed.name || '',
                        company: parsed.company || '',
                        title: parsed.title || '',
                        email: parsed.email || '',
                        phone: parsed.phone || '',
                        address: parsed.address || '',
                        website: parsed.website || '',
                        category: ['business', 'tax-prep', 'career', 'personal'].includes(parsed.category) ? parsed.category : 'business',
                        tags: [],
                        notes: parsed.notes || '',
                    };

                    if (!contactData.name) {
                        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ **Could not extract a name** from the text. Please include the contact\'s name and try again.' }]);
                        setIsLoading(false);
                        setStatus('Ready');
                        return;
                    }

                    // Actually save to Supabase
                    setStatus('Saving to CRM...');
                    const saved = await createContact(contactData);

                    const contactCard = `✅ **Contact Saved to CRM!**\n\n| Field | Value |\n|-------|-------|\n| **Name** | ${saved.name || '-'} |\n| **Company** | ${saved.company || '-'} |\n| **Title** | ${saved.title || '-'} |\n| **Email** | ${saved.email || '-'} |\n| **Phone** | ${saved.phone || '-'} |\n| **Address** | ${saved.address || '-'} |\n| **Website** | ${saved.website || '-'} |\n| **Category** | ${saved.category || '-'} |\n\n_Contact has been saved. Click the 🔄 Refresh button in CRM to see it._`;
                    setMessages(prev => [...prev, { role: 'assistant', content: contactCard }]);
                } catch (parseErr) {
                    setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Could not save contact:** ${parseErr.message}\n\nTry the **Scan Card** button in CRM → New instead.` }]);
                }
                setIsLoading(false);
                setStatus('Ready');
                return;
            }

            // --- STANDARD CHAT FALLBACK ---
            const inboxContextBlock = buildInboxContextBlock(contextData);
            const likelyEmailQuery = /\b(email|emails|inbox|message|messages|subject|from|to|attachment|attachments|unread|mail)\b/i.test(originalInput);
            if (activePdfText) {
                const pdfContextBlock = `[Context: Extracted text from active document "${activePdfName}"]\n${activePdfText.substring(0, 12000)}\n[End of Document Context]\n\n`;
                fullInput = `${pdfContextBlock}User Question: ${fullInput}`;
            } else if (inboxContextBlock && likelyEmailQuery) {
                fullInput = `${inboxContextBlock}\n\nUser question:\n${fullInput}`;
            }

            // Create a placeholder for the bot's response
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: config.model,
                    messages: [runtimeSystemPrompt, ...messages, { role: 'user', content: fullInput }].map(m => ({ role: m.role, content: m.content })),
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

    // If settings is open, show full control plane
    if (showSettings) {
        return (
            <div className={variant === 'overlay'
                ? "fixed top-16 right-0 bottom-0 w-[400px] bg-background border-l border-border shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300"
                : "h-full flex flex-col bg-background"
            }>
                <AiControlPlane
                    activeModel={config.model}
                    onModelChange={(newModel) => {
                        handleModelChange(newModel);
                        setShowSettings(false);
                    }}
                    onClose={() => setShowSettings(false)}
                />
            </div>
        );
    }

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

            {/* Settings overlay replaced by AiControlPlane rendered above */}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
                {/* Attached File Chip */}
                {attachedFile && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="flex items-center gap-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-2.5 py-1.5 text-xs max-w-full">
                            <FileIcon className="size-3.5 text-brand-blue shrink-0" />
                            <span className="truncate text-brand-blue font-medium">{attachedFile.name}</span>
                            <span className="text-muted-foreground shrink-0">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                            <button onClick={() => setAttachedFile(null)} className="ml-1 text-muted-foreground hover:text-destructive shrink-0">
                                <X className="size-3" />
                            </button>
                        </div>
                    </div>
                )}
                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.py,.sql,.html,.css,.xml,.yaml,.yml,.log,.pdf"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            setAttachedFile({
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                content: ev.target.result,
                            });
                        };
                        reader.readAsText(file);
                        e.target.value = ''; // Reset so same file can be re-selected
                    }}
                />
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
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach File"
                        >
                            <Paperclip className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
                            onClick={() => {
                                const greeting = [{ role: 'assistant', content: defaultGreeting }];
                                setMessages(greeting);
                                setSuggestedAction(null);
                                setError(null);
                                setAttachedFile(null);
                                localStorage.setItem('ai_chat_messages', JSON.stringify(greeting));
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
                            data-ai-settings="true"
                        >
                            <Settings className="size-4" />
                        </Button>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || (!input.trim() && !attachedFile)}
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
