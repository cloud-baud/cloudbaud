import React, { useEffect, useState } from 'react';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance as defaultInstance, createMsalInstance } from "../../lib/authConfig";
import { graphService } from "../../services/graphService";

// Event name for when the auth config changes
export const AUTH_CONFIG_CHANGE_EVENT = 'auth-config-change';

const DynamicMsalProvider = ({ children }) => {
    const [instance, setInstance] = useState(defaultInstance);

    useEffect(() => {
        const handleConfigChange = () => {
            console.log("Re-initializing MSAL with new configuration...");
            const newInstance = createMsalInstance();
            setInstance(newInstance);

            // Important: Update the service singleton too
            graphService.setMsalInstance(newInstance);
        };

        window.addEventListener(AUTH_CONFIG_CHANGE_EVENT, handleConfigChange);

        return () => {
            window.removeEventListener(AUTH_CONFIG_CHANGE_EVENT, handleConfigChange);
        };
    }, []);

    return (
        <MsalProvider instance={instance}>
            {children}
        </MsalProvider>
    );
};

export default DynamicMsalProvider;
