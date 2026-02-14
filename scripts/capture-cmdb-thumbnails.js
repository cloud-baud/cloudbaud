
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITES = [
    { name: 'cloudbaud', url: 'https://cloudbaud.com', file: 'cloudbaud-thumb.png' },
    { name: 'systemsdesign', url: 'https://systemsdesign.pro', file: 'systemsdesign-thumb.png' },
    { name: 'jishnunath', url: 'https://jishnunath.com', file: 'jishnunath-thumb.png' },
    { name: 'kampuz', url: 'https://kampuz.online', file: 'kampuz-thumb.png' }
];

const OUTPUT_DIR = path.resolve(__dirname, '../public/cmdb-thumbnails');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
    console.log('Launching browser not headless new...');
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // helpful in some environments
    });

    for (const site of SITES) {
        console.log(`Navigating to ${site.url}...`);
        const page = await browser.newPage();
        
        // Set viewport to a standard desktop size for consistency
        await page.setViewport({ width: 1280, height: 720 });

        try {
            await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            const outputPath = path.join(OUTPUT_DIR, site.file);
            await page.screenshot({ path: outputPath, type: 'png' });
            console.log(`Captured screenshot for ${site.name} at ${outputPath}`);
        } catch (error) {
            console.error(`Failed to capture ${site.name} (${site.url}):`, error.message);
            // Create a placeholder error image or just skip? 
            // We'll let the frontend handle missing images or use a default error image if I wanted to implement one.
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('Done.');
})();
