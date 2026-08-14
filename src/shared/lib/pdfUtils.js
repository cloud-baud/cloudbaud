
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

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
            let pageText = textContent.items
                .map(item => {
                    // Add space after each item for better word separation
                    return item.str + ' ';
                })
                .join('');
            
            console.log(`[PDF Extraction] Page ${i} text length:`, pageText.length);
            
            if (pageText.trim().length < 10) {
                console.log(`[PDF Extraction] Page ${i} appears to be a scanned document (extracted text length: ${pageText.trim().length}). Initializing Tesseract OCR...`);
                
                try {
                    // Render page to high-DPI in-memory canvas
                    const scale = 2.0;
                    const viewport = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    console.log(`[PDF Extraction] Rendering page ${i} to canvas (${viewport.width}x${viewport.height}) at scale ${scale}...`);
                    
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    await page.render(renderContext).promise;
                    console.log(`[PDF Extraction] Render complete. Running Tesseract OCR on page ${i}...`);
                    
                    const { data: { text: ocrText } } = await Tesseract.recognize(
                        canvas,
                        'eng',
                        {
                            logger: m => {
                                if (m && typeof m === 'object' && m.status === 'recognizing') {
                                    const pct = Math.round(m.progress * 100);
                                    console.log(`[OCR Page ${i}] progress: status = ${m.status}, progress = ${m.progress} (${pct}%)`);
                                } else if (m && typeof m === 'object') {
                                    console.log(`[OCR Page ${i}] status: ${m.status}`);
                                }
                            }
                        }
                    );
                    
                    console.log(`[PDF Extraction] OCR success! Extracted ${ocrText.length} characters.`);
                    pageText = ocrText;
                    
                    fullText += `--- Page ${i} (OCR Extracted) ---\n${pageText}\n\n`;
                } catch (ocrError) {
                    console.error(`[PDF Extraction] OCR failed on page ${i}:`, ocrError);
                    // Fallback to original sparse page text if OCR fails
                    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
                }
            } else {
                console.log(`[PDF Extraction] Page ${i} preview:`, pageText.substring(0, 200));
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }
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

