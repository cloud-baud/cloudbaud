import React, { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext();

export const useContent = () => {
    return useContext(ContentContext);
};

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(() => {
        const defaultState = {
            aiShowcase: {
                enabled: true,
                title: "Agentic AI in Action",
                description: "Experience the power of autonomous agents managing complex workflows.",
                highlight: "Live Demo"
            },
            taxActivities: {
                showLog: true
            }
        };

        try {
            const saved = localStorage.getItem('cloudbaud_content_v1');
            if (!saved) return defaultState;

            const parsed = JSON.parse(saved);
            // Deep merge logic (simplified) to ensure all keys exist
            return {
                aiShowcase: { ...defaultState.aiShowcase, ...parsed.aiShowcase },
                taxActivities: { ...defaultState.taxActivities, ...parsed.taxActivities }
            };
        } catch (e) {
            console.warn("Failed to parse content state, resetting to defaults", e);
            return defaultState;
        }
    });

    useEffect(() => {
        localStorage.setItem('cloudbaud_content_v1', JSON.stringify(content));
    }, [content]);

    const updateContent = (section, key, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    return (
        <ContentContext.Provider value={{ content, updateContent }}>
            {children}
        </ContentContext.Provider>
    );
};
