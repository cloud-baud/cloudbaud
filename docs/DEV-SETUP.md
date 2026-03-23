# CloudBaud Development Environment

## Quick Start

### Option 1: Double-Click (Easiest)
Simply double-click `scripts/start-dev.bat`.

### Option 2: PowerShell
```powershell
.\scripts\start-dev.ps1
```

### Option 3: Manual
```bash
npm run dev
```

## What the Startup Script Does

1. **Clears Port 17117** - Stops any existing processes using the dev server port
2. **Cleans Up Orphaned Processes** - Removes any stuck Node processes from previous sessions
3. **Verifies Dependencies** - Checks if `node_modules` exists, runs `npm install` if needed
4. **Checks Ollama** - Verifies if the AI service is running (optional, for document extraction)
5. **Starts Dev Server** - Launches Vite on port 17117

## Environment Details

- **Dev Server**: http://localhost:17117
- **HMR Port**: Auto-assigned (usually 17118+)
- **Supabase**: Configured via `.env` (TEST and PROD environments)
- **Ollama AI**: Optional, runs on http://localhost:11434

## Troubleshooting

### Port Already in Use
The startup script automatically handles this. If you see port conflicts, just run the script again.

### Ollama Not Running
AI document extraction requires Ollama. To start it:
```bash
ollama serve
```

Then verify it's running:
```bash
ollama list
```

### Multiple Dev Servers
The script automatically kills duplicate processes. Always use the startup script to ensure a clean environment.

## Services Status Page

Visit http://localhost:17117/collaboration/system-status to check the health of all dependencies:
- Supabase Database
- Ollama AI
- PDF.js Worker
- Browser Storage
- Hosting Platform

## Development Workflow

1. **Start**: Run `scripts/start-dev.bat` or `.\scripts\start-dev.ps1`
2. **Develop**: Make changes, Vite will hot-reload automatically
3. **Test**: Use the System Status page to verify all services
4. **Stop**: Press `Ctrl+C` in the terminal

## Key Features

- **Tax Dashboard**: `/collaboration/finance/taxes`
- **AI Agent**: Built-in document extraction with Ollama
- **System Status**: `/collaboration/system-status`
- **Settings**: `/collaboration/settings`

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `VITE_SUPABASE_URL_TEST` - Test database URL
- `VITE_SUPABASE_ANON_KEY_TEST` - Test database key
- `VITE_SUPABASE_URL_PROD` - Production database URL
- `VITE_SUPABASE_ANON_KEY_PROD` - Production database key

## Support

For issues, check:
1. System Status page for service health
2. Browser console (F12) for errors
3. Terminal output for build errors
