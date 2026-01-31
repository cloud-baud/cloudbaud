import { Client } from "@microsoft/microsoft-graph-client";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalInstance as defaultInstance, loginRequest } from "../lib/authConfig";

/**
 * Service class for interacting with Microsoft Graph API
 */
class GraphService {
    constructor() {
        this.graphClient = null;
        this.msalInstance = defaultInstance;
    }

    setMsalInstance(instance) {
        this.msalInstance = instance;
        this.graphClient = null; // Reset client to force re-initialization with new instance
    }

    /**
     * Initializes the Graph Client with an auth provider that acquires tokens via MSAL
     */
    ensureClient() {
        if (this.graphClient) return this.graphClient;

        this.graphClient = Client.init({
            authProvider: async (done) => {
                try {
                    const account = this.msalInstance.getActiveAccount() || this.msalInstance.getAllAccounts()[0];

                    if (!account) {
                        // If no account is active, we can't silently acquire token easily.
                        // The UI should enforce login first.
                        throw new Error("No active Microsoft account found. Please sign in.");
                    }

                    const response = await this.msalInstance.acquireTokenSilent({
                        ...loginRequest,
                        account: account,
                    });

                    done(null, response.accessToken);
                } catch (error) {
                    if (error instanceof InteractionRequiredAuthError) {
                        // If silent acquisition fails, we might need to prompt usage
                        // Ideally this is handled by the component, but we can return error to callback
                        done(error, null);
                    } else {
                        console.error("Graph Auth Provider Error:", error);
                        done(error, null);
                    }
                }
            },
        });

        return this.graphClient;
    }

    /**
     * Get the current user's profile
     */
    async getProfile() {
        const client = this.ensureClient();
        return await client.api("/me").get();
    }

    /**
     * Get recent files
     */
    async getRecentFiles() {
        const client = this.ensureClient();
        return await client.api("/me/drive/recent").get();
    }

    /**
     * Get people relevant to the user
     */
    async getPeople() {
        const client = this.ensureClient();
        return await client.api("/me/people").get();
    }
}

export const graphService = new GraphService();
