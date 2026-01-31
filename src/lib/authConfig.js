import { PublicClientApplication } from "@azure/msal-browser";

export const createMsalConfig = (customClientId) => ({
    auth: {
        clientId: customClientId || localStorage.getItem('azure_client_id') || import.meta.env.VITE_AZURE_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin + "/portal/settings",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
});

export const createMsalInstance = (customClientId) => {
    return new PublicClientApplication(createMsalConfig(customClientId));
};

export const msalConfig = createMsalConfig();

export const loginRequest = {
    scopes: ["User.Read", "Mail.Read", "Calendars.Read"]
};

// Initialize the default MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);
