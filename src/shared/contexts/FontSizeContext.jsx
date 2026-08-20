import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext(null);

export const FONT_SIZE_OPTIONS = [
    {
        id: 'compact',
        label: 'Compact',
        sublabel: 'Tax Panel Standard (High Density)',
        scale: '87.5%',
        icon: '⚡',
        badge: 'Recommended'
    },
    {
        id: 'default',
        label: 'Balanced',
        sublabel: 'Standard Web Sizing',
        scale: '100%',
        icon: '🔹',
    },
    {
        id: 'large',
        label: 'Comfortable',
        sublabel: 'Enlarged Text & Spacing',
        scale: '115%',
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
        return 'compact'; // Default to compact to match tax panels
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

    const setFontSize = (size) => {
        if (!['compact', 'default', 'large'].includes(size)) return;
        setFontSizeState(size);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, size);
            window.dispatchEvent(new CustomEvent('cloudbaud-font-size-change', { detail: { fontSize: size } }));
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
