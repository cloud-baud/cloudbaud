
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker with HTTPS and stable version
// Configure worker with local version to avoid version mismatch errors
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromPdf = async (file) => {
    console.log('[PDF Extraction] Starting extraction...', { 
        fileType: file.type, 
        fileSize: file.size,
        fileName: file.name || 'blob'
    });
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        console.log('[PDF Extraction] ArrayBuffer created, size:', arrayBuffer.byteLength);
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log('[PDF Extraction] PDF loaded, pages:', pdf.numPages);
        
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`[PDF Extraction] Processing page ${i}/${pdf.numPages}`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            console.log(`[PDF Extraction] Page ${i} items:`, textContent.items.length);
            
            // Extract text with better spacing
            const pageText = textContent.items
                .map(item => {
                    // Add space after each item for better word separation
                    return item.str + ' ';
                })
                .join('');
            
            console.log(`[PDF Extraction] Page ${i} text length:`, pageText.length);
            console.log(`[PDF Extraction] Page ${i} preview:`, pageText.substring(0, 200));
            
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        console.log('[PDF Extraction] SUCCESS! Total text length:', fullText.length);
        console.log('[PDF Extraction] Full text preview:', fullText.substring(0, 500));
        
        if (fullText.trim().length === 0) {
            throw new Error('PDF appears to be empty or contains only images (scanned document)');
        }

        return fullText;
    } catch (error) {
        console.error('[PDF Extraction] FAILED:', error);
        console.error('[PDF Extraction] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error(`Could not extract text from PDF: ${error.message}`);
    }
};
