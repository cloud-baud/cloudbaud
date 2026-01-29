import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ["User.Read", "Mail.Read", "Calendars.Read"]
};

// Initialize the MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);
