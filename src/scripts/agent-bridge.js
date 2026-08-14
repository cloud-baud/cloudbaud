import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../'); // Adjust based on where script is located

const app = express();
const PORT = 3001;

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// REPOSITORY CONTEXT
// Restrict access only to this project folder for safety
const SAFE_ROOT = path.resolve(ROOT_DIR);

const validatePath = (targetPath) => {
    const resolvedPath = path.resolve(SAFE_ROOT, targetPath);
    if (!resolvedPath.startsWith(SAFE_ROOT)) {
        throw new Error("Access Denied: Path outside repository.");
    }
    return resolvedPath;
};

// 1. READ FILE
app.post('/api/read', (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) return res.status(400).json({ error: "Missing filePath" });

        const fullPath = validatePath(filePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: "File not found" });
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ content });
    } catch (err) {
        console.error("Read Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. WRITE FILE
app.post('/api/write', (req, res) => {
    try {
        const { filePath, content } = req.body;
        if (!filePath || content === undefined) return res.status(400).json({ error: "Missing parameters" });

        const fullPath = validatePath(filePath);

        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`[Bridge] Updated: ${filePath}`);
        res.json({ success: true, path: filePath });
    } catch (err) {
        console.error("Write Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. LIST FILES (Context for Agent)
app.post('/api/list', (req, res) => {
    try {
        const { dirPath = './src' } = req.body; // Default to src
        const fullPath = validatePath(dirPath);

        const files = [];
        const scan = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                if (item === 'node_modules' || item === '.git') continue;
                const p = path.join(dir, item);
                const stat = fs.statSync(p);
                if (stat.isDirectory()) {
                    scan(p);
                } else {
                    // Return relative path
                    files.push(path.relative(SAFE_ROOT, p).replace(/\\/g, '/'));
                }
            }
        };
        scan(fullPath);
        res.json({ files: files.slice(0, 50) }); // Limit for mental sanity check
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`
    🚀 Agent Bridge Running on http://localhost:${PORT}
    -----------------------------------------------
    This bridge allows your Chat Agent to READ and WRITE files locally.
    Root: ${SAFE_ROOT}
    `);
});
