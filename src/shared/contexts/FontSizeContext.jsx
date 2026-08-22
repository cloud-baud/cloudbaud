import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext(null);

export const FONT_SIZE_OPTIONS = [
    {
        id: 'compact',
        label: 'Compact',
        sublabel: 'Crisp Standard Density',
        scale: '100%',
        icon: '⚡',
        badge: 'Standard'
    },
    {
        id: 'default',
        label: 'Balanced (Medium)',
        sublabel: 'Enhanced Readability',
        scale: '112.5%',
        icon: '🔹',
        badge: 'Recommended'
    },
    {
        id: 'large',
        label: 'Large (Comfortable)',
        sublabel: 'Enlarged Text & Spacing',
        scale: '125%',
        icon: '🔍',
    }
];

const STORAGE_KEY = 'cloudbaud_font_size';

export const FontSizeProvider = ({ children }) => {
    const [fontSize, setFontSizeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && ['compact', 'default', 'large'].includes(saved)) {
                return saved;
            }
        }
        return 'default'; // Default to balanced/medium for clear visibility
    });

    const applyFontSize = (size) => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.setAttribute('data-font-size', size);
            root.classList.remove('font-size-compact', 'font-size-default', 'font-size-large');
            root.classList.add(`font-size-${size}`);
        }
    };

    useEffect(() => {
        applyFontSize(fontSize);
    }, [fontSize]);

    // Cross-window and iframe synchronization listeners
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'FONT_SIZE_CHANGE' && event.data.fontSize) {
                const nextSize = event.data.fontSize;
                if (['compact', 'default', 'large'].includes(nextSize)) {
                    setFontSizeState(nextSize);
                    applyFontSize(nextSize);
                }
            }
        };

        const handleStorage = (event) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                if (['compact', 'default', 'large'].includes(event.newValue)) {
                    setFontSizeState(event.newValue);
                    applyFontSize(event.newValue);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const setFontSize = (size) => {
        if (!['compact', 'default', 'large'].includes(size)) return;
        setFontSizeState(size);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, size);
            window.dispatchEvent(new CustomEvent('cloudbaud-font-size-change', { detail: { fontSize: size } }));
            
            // Broadcast to parent if inside iframe
            if (window.parent && window.parent !== window) {
                try {
                    window.parent.postMessage({ type: 'FONT_SIZE_CHANGE', fontSize: size }, '*');
                } catch (e) {
                    console.debug('Failed to postMessage to parent:', e);
                }
            }

            // Broadcast to all child iframes
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    iframe.contentWindow?.postMessage({ type: 'FONT_SIZE_CHANGE', fontSize: size }, '*');
                } catch (e) {
                    console.debug('Failed to postMessage to iframe:', e);
                }
            });
        }
        applyFontSize(size);
    };

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize, options: FONT_SIZE_OPTIONS }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (!context) {
        // Fallback if used outside provider
        return {
            fontSize: 'compact',
            setFontSize: () => {},
            options: FONT_SIZE_OPTIONS
        };
    }
    return context;
};

export default FontSizeContext;
