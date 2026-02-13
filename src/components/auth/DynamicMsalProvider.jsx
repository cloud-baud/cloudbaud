import React, { useEffect, useState } from 'react';
// import { MsalProvider } from "@azure/msal-react"; // Temporarily disabled
import { msalInstance as defaultInstance } from "../../lib/authConfig";

export const AUTH_CONFIG_CHANGE_EVENT = 'auth-config-change';

const DynamicMsalProvider = ({ children }) => {
    // Just render children for now to unblock the UI
    console.log("DynamicMsalProvider: Rendering children directly (Bypass Mode)");
    return (
        <div data-msal-bypass="true">
            {children}
        </div>
    );
};

export default DynamicMsalProvider;
