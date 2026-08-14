// sidebar.js - Chrome Extension Sidebar Controller

// Environment configuration registries
const CONFIGS = {
  TEST: {
    url: "https://knhrygguhgfpimaogfkw.supabase.co",
    anonKey: "sb_publishable_zjHt6-DhIUIANPhxKvFOtQ_RZPISwhU",
    origin: "http://localhost:5173",
    storagePrefix: "sb-knhrygguhgfpimaogfkw-auth-token"
  },
  PROD: {
    url: "https://mvyavzjzdinelcufpzek.supabase.co",
    anonKey: "sb_publishable_tfO8Ot3_ajhvz-KUuX-rtw_wIH9CTcr",
    origin: "https://cloudbaud.com",
    storagePrefix: "sb-mvyavzjzdinelcufpzek-auth-token"
  }
};

// Global App State
let activeEnv = "TEST";
let activeSession = null;
let activeThread = null;
let userDeals = [];

// DOM Elements cache
const els = {
  statusDot: document.getElementById("status-dot"),
  statusText: document.getElementById("status-text"),
  envTest: document.getElementById("env-test"),
  envProd: document.getElementById("env-prod"),
  btnUnauthOpen: document.getElementById("btn-open-portal"),
  authUnauth: document.getElementById("auth-unauthenticated"),
  authAuth: document.getElementById("auth-authenticated"),
  userName: document.getElementById("user-name"),
  userEmail: document.getElementById("user-email"),
  userAvatar: document.getElementById("user-avatar"),
  btnRefreshSession: document.getElementById("btn-refresh-session"),
  btnRescrape: document.getElementById("btn-rescrape"),
  threadEmpty: document.getElementById("thread-empty"),
  threadLoaded: document.getElementById("thread-loaded"),
  liContactName: document.getElementById("li-contact-name"),
  liThreadId: document.getElementById("li-thread-id"),
  liBubbleSender: document.getElementById("li-bubble-sender"),
  liBubbleText: document.getElementById("li-bubble-text"),
  crmPanel: document.getElementById("crm-panel"),
  crmLoading: document.getElementById("crm-loading"),
  crmActions: document.getElementById("crm-actions"),
  contactSyncStatus: document.getElementById("contact-sync-status"),
  contactStatusIcon: document.getElementById("contact-status-icon"),
  contactStatusText: document.getElementById("contact-status-text"),
  btnCreateContact: document.getElementById("btn-create-contact"),
  dealSelector: document.getElementById("deal-selector"),
  dealAccordionTrigger: document.getElementById("deal-accordion-trigger"),
  dealAccordionContent: document.getElementById("deal-accordion-content"),
  newDealName: document.getElementById("new-deal-name"),
  newDealValue: document.getElementById("new-deal-value"),
  btnCreateDeal: document.getElementById("btn-create-deal"),
  btnSyncNow: document.getElementById("btn-sync-now"),
  syncSpinner: document.getElementById("sync-spinner"),
  staticIcon: document.querySelector(".static-icon"),
  footerPortalLink: document.getElementById("footer-portal-link")
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadSavedEnvironment();
  syncAuthSession();
});

function setupEventListeners() {
  // Environment selector tabs
  els.envTest.addEventListener("click", () => setEnvironment("TEST"));
  els.envProd.addEventListener("click", () => setEnvironment("PROD"));

  // Auth portal redirects
  els.btnUnauthOpen.addEventListener("click", openPortal);
  els.footerPortalLink.addEventListener("click", (e) => {
    e.preventDefault();
    openPortal();
  });

  // Session & Scraping controls
  els.btnRefreshSession.addEventListener("click", syncAuthSession);
  els.btnRescrape.addEventListener("click", scrapeLinkedInActiveTab);

  // Sync / Push Action
  els.btnSyncNow.addEventListener("click", syncActiveChatLog);

  // Create Contact Quick Action
  els.btnCreateContact.addEventListener("click", createNewContactInCRM);

  // New Deal Accordion Toggle
  els.dealAccordionTrigger.addEventListener("click", () => {
    els.dealAccordionTrigger.classList.toggle("active");
    els.dealAccordionContent.classList.toggle("hidden");
  });

  // Quick Deal Creation Action
  els.btnCreateDeal.addEventListener("click", createQuickDeal);

  // Enable/Disable push sync button based on deal dropdown changes
  els.dealSelector.addEventListener("change", (e) => {
    els.btnSyncNow.disabled = !e.target.value;
  });

  // Listen to background service worker events
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "LINKEDIN_URL_CHANGED") {
      console.log("[Sidebar] Message thread change detected.");
      // Automatically trigger a scrape when the user moves to a new thread
      setTimeout(scrapeLinkedInActiveTab, 1000);
    }
  });
}

function loadSavedEnvironment() {
  chrome.storage.local.get(["activeEnv"], (result) => {
    if (result.activeEnv) {
      setEnvironment(result.activeEnv);
    } else {
      setEnvironment("TEST");
    }
  });
}

function setEnvironment(env) {
  activeEnv = env;
  chrome.storage.local.set({ activeEnv: env });

  if (env === "TEST") {
    els.envTest.classList.add("active");
    els.envProd.classList.remove("active");
  } else {
    els.envProd.classList.add("active");
    els.envTest.classList.remove("active");
  }

  // Update UI and pull new auth state
  syncAuthSession();
}

function openPortal() {
  const config = CONFIGS[activeEnv];
  chrome.tabs.create({ url: `${config.origin}/workspace` });
}

// --- AUTHENTICATION SYNCRONIZATION ---
async function syncAuthSession() {
  updateStatus("Connecting", "warning");
  els.crmActions.classList.add("hidden");
  els.crmLoading.classList.remove("hidden");

  const config = CONFIGS[activeEnv];
  
  try {
    // 1. Query for open tab matching the active env origin
    const tabs = await chrome.tabs.query({ url: `${config.origin}/*` });
    
    if (tabs.length === 0) {
      // No active workspace portal tab open
      setUnauthenticatedState();
      return;
    }

    const tabId = tabs[0].id;
    
    // 2. Inject scripting logic to fetch local storage Supabase session securely
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Dynamically find any matching Supabase local auth key
        const authKey = Object.keys(localStorage).find(
          k => k.startsWith('sb-') && k.endsWith('-auth-token')
        );
        return authKey ? localStorage.getItem(authKey) : null;
      }
    });

    if (results && results[0] && results[0].result) {
      const parsedSession = JSON.parse(results[0].result);
      if (parsedSession && parsedSession.access_token) {
        setAuthenticatedState(parsedSession);
        return;
      }
    }

    setUnauthenticatedState();

  } catch (err) {
    console.error("[Sidebar] Auth sync failed:", err);
    setUnauthenticatedState();
  }
}

function setAuthenticatedState(session) {
  activeSession = session;
  const user = session.user;
  
  els.userName.textContent = user.user_metadata?.full_name || user.email.split("@")[0];
  els.userEmail.textContent = user.email;
  els.userAvatar.textContent = (user.user_metadata?.full_name || user.email)[0].toUpperCase();
  
  els.authUnauth.classList.add("hidden");
  els.authAuth.classList.remove("hidden");
  
  updateStatus("Connected", "active");

  // Load active thread & CRM details
  scrapeLinkedInActiveTab();
  fetchCRMDealsAndContacts();
}

function setUnauthenticatedState() {
  activeSession = null;
  els.authAuth.classList.add("hidden");
  els.authUnauth.classList.remove("hidden");
  
  els.crmLoading.classList.add("hidden");
  els.crmActions.classList.add("hidden");
  
  updateStatus("Disconnected", "error");
}

function updateStatus(text, type) {
  els.statusText.textContent = text;
  
  // Clear classes
  els.statusDot.className = "pulse-dot";
  if (type) {
    els.statusDot.classList.add(type);
  }
}

// --- LINKEDIN DOM SCRAPING CONNECTIONS ---
async function scrapeLinkedInActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) return;

  const tab = tabs[0];
  if (!tab.url || !tab.url.includes("linkedin.com")) {
    setThreadEmptyState("Open a thread on LinkedIn to scrape.");
    return;
  }

  updateStatus("Scraping", "warning");

  try {
    // Send SCRAPE_THREAD request message to content script
    const response = await chrome.tabs.sendMessage(tab.id, { type: "SCRAPE_THREAD" });
    
    if (response && response.success && response.data && response.data.threadId) {
      setThreadLoadedState(response.data);
    } else {
      setThreadEmptyState("Active direct messaging thread not found. Please click into a chat.");
    }
  } catch (err) {
    console.warn("[Sidebar] Scraping connection failed:", err);
    setThreadEmptyState("Reload LinkedIn messaging page to activate scraper.");
  } finally {
    if (activeSession) {
      updateStatus("Connected", "active");
    }
  }
}

function setThreadEmptyState(customMessage) {
  activeThread = null;
  els.threadLoaded.classList.add("hidden");
  els.threadEmpty.classList.remove("hidden");
  
  if (customMessage) {
    els.threadEmpty.querySelector(".empty-text").textContent = customMessage;
  }

  els.btnSyncNow.disabled = true;
}

function setThreadLoadedState(data) {
  activeThread = data;
  els.liContactName.textContent = data.contactName;
  els.liThreadId.textContent = data.threadId.substring(0, 15) + "...";
  els.liThreadId.title = data.threadId;

  if (data.messages && data.messages.length > 0) {
    const lastMsg = data.messages[data.messages.length - 1];
    els.liBubbleSender.textContent = lastMsg.sender;
    els.liBubbleText.textContent = lastMsg.text;
  } else {
    els.liBubbleSender.textContent = "No messages";
    els.liBubbleText.textContent = "Messages have not finished loading.";
  }

  els.threadEmpty.classList.add("hidden");
  els.threadLoaded.classList.remove("hidden");

  // Search if this contact name or thread exists
  searchCRMContactMatch();
}

// --- SUPABASE REST OPERATIONS ---
async function fetchCRMDealsAndContacts() {
  if (!activeSession) return;
  
  const config = CONFIGS[activeEnv];
  const url = `${config.url}/rest/v1/deals?select=id,name,company,custom_fields&status=eq.open`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": config.anonKey,
        "Authorization": `Bearer ${activeSession.access_token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      userDeals = await response.json();
      populateDealsSelector();
    }
  } catch (err) {
    console.error("[Sidebar] Fetch deals error:", err);
  } finally {
    els.crmLoading.classList.add("hidden");
    els.crmActions.classList.remove("hidden");
  }
}

function populateDealsSelector() {
  // Clear option list, keep fallback
  els.dealSelector.innerHTML = '<option value="">-- Choose an Open Deal --</option>';

  userDeals.forEach(deal => {
    const option = document.createElement("option");
    option.value = deal.id;
    
    // Check if this deal is already associated with our current thread ID
    const customFields = deal.custom_fields || {};
    const isLinked = customFields.linkedin_thread_id === activeThread?.threadId;

    option.textContent = `${deal.name} (${deal.company || 'No Company'})${isLinked ? ' 🔗 [Linked]' : ''}`;
    els.dealSelector.appendChild(option);

    if (isLinked) {
      els.dealSelector.value = deal.id;
      els.btnSyncNow.disabled = false;
    }
  });
}

async function searchCRMContactMatch() {
  if (!activeSession || !activeThread) return;

  const config = CONFIGS[activeEnv];
  // Simple check: match contact by name
  const nameQuery = encodeURIComponent(activeThread.contactName);
  const url = `${config.url}/rest/v1/contacts?name=eq.${nameQuery}&select=id,name`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": config.anonKey,
        "Authorization": `Bearer ${activeSession.access_token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const contacts = await response.json();
      if (contacts && contacts.length > 0) {
        setContactMatchState(true, `Matched: ${contacts[0].name}`);
      } else {
        setContactMatchState(false, "No matching CRM contact found.");
      }
    }
  } catch (err) {
    console.warn("Contact search error:", err);
  }
}

function setContactMatchState(isMatched, text) {
  if (isMatched) {
    els.contactStatusIcon.className = "status-badge green";
    els.contactStatusIcon.textContent = "Mapped";
    els.contactStatusText.textContent = text;
    els.btnCreateContact.classList.add("hidden");
  } else {
    els.contactStatusIcon.className = "status-badge red";
    els.contactStatusIcon.textContent = "Unmapped";
    els.contactStatusText.textContent = text;
    els.btnCreateContact.classList.remove("hidden");
  }
}

async function createNewContactInCRM() {
  if (!activeSession || !activeThread) return;

  els.btnCreateContact.disabled = true;
  els.btnCreateContact.textContent = "Saving...";

  const config = CONFIGS[activeEnv];
  const url = `${config.url}/rest/v1/contacts`;

  const payload = {
    user_id: activeSession.user.id,
    name: activeThread.contactName,
    category: "business",
    tags: ["linkedin"],
    notes: `Contact captured via LinkedIn sync helper. Thread URL: ${activeThread.url}`
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": config.anonKey,
        "Authorization": `Bearer ${activeSession.access_token}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      searchCRMContactMatch(); // Refresh check
    } else {
      throw new Error("Failed saving contact.");
    }
  } catch (err) {
    alert("Error creating contact: " + err.message);
    els.btnCreateContact.disabled = false;
    els.btnCreateContact.textContent = "Create New Contact";
  }
}

async function createQuickDeal() {
  if (!activeSession || !activeThread) return;

  const dealName = els.newDealName.value.trim();
  const dealValue = parseFloat(els.newDealValue.value) || 0;

  if (!dealName) {
    alert("Please enter a deal name.");
    return;
  }

  els.btnCreateDeal.disabled = true;
  els.btnCreateDeal.textContent = "Creating...";

  const config = CONFIGS[activeEnv];
  const url = `${config.url}/rest/v1/deals`;

  const payload = {
    user_id: activeSession.user.id,
    name: dealName,
    value: dealValue,
    company: activeThread.contactName + " Org",
    contact_name: activeThread.contactName,
    custom_fields: {
      linkedin_thread_id: activeThread.threadId
    },
    notes: `Deal automatically created via Chrome Extension Sync.`
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": config.anonKey,
        "Authorization": `Bearer ${activeSession.access_token}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // Clear inputs
      els.newDealName.value = "";
      els.newDealValue.value = "";
      
      // Close accordion
      els.dealAccordionTrigger.classList.remove("active");
      els.dealAccordionContent.classList.add("hidden");

      // Refresh list
      await fetchCRMDealsAndContacts();
    } else {
      throw new Error("Create deal POST returned error.");
    }
  } catch (err) {
    alert("Error creating deal: " + err.message);
  } finally {
    els.btnCreateDeal.disabled = false;
    els.btnCreateDeal.textContent = "Save New Deal";
  }
}

// --- SYNC / LOG ACTIVITY ACTION ---
async function syncActiveChatLog() {
  const dealId = els.dealSelector.value;
  if (!dealId || !activeSession || !activeThread) return;

  // Toggle Loading State
  els.btnSyncNow.disabled = true;
  els.syncSpinner.classList.remove("hidden");
  els.staticIcon.classList.add("hidden");
  els.btnSyncNow.querySelector("span").textContent = "Syncing Thread...";

  const config = CONFIGS[activeEnv];

  // 1. Build formatted chat transcript text
  let formattedNotes = `LinkedIn Message Transcript (Synced ${new Date().toLocaleString()}):\n`;
  formattedNotes += `Thread URL: ${activeThread.url}\n`;
  formattedNotes += `==========================================\n\n`;

  activeThread.messages.forEach(msg => {
    formattedNotes += `[${msg.time}] ${msg.sender}:\n${msg.text}\n\n`;
  });

  const activityPayload = {
    deal_id: dealId,
    user_id: activeSession.user.id,
    activity_type: "note",
    title: "LinkedIn Message Sync",
    notes: formattedNotes,
    is_completed: true
  };

  try {
    // 2. Link this thread ID to the selected deal (in case it wasn't already mapped)
    const selectedDeal = userDeals.find(d => d.id === dealId);
    if (selectedDeal) {
      const customFields = selectedDeal.custom_fields || {};
      if (customFields.linkedin_thread_id !== activeThread.threadId) {
        customFields.linkedin_thread_id = activeThread.threadId;
        
        await fetch(`${config.url}/rest/v1/deals?id=eq.${dealId}`, {
          method: "PATCH",
          headers: {
            "apikey": config.anonKey,
            "Authorization": `Bearer ${activeSession.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ custom_fields: customFields })
        });
      }
    }

    // 3. Post activity to Supabase
    const response = await fetch(`${config.url}/rest/v1/deal_activities`, {
      method: "POST",
      headers: {
        "apikey": config.anonKey,
        "Authorization": `Bearer ${activeSession.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(activityPayload)
    });

    if (response.ok) {
      // Show Synced success check
      els.btnSyncNow.querySelector("span").textContent = "Synced Successfully!";
      els.syncSpinner.classList.add("hidden");
      
      // Momentary success state
      setTimeout(() => {
        els.btnSyncNow.querySelector("span").textContent = "Sync Active Chat Log";
        els.staticIcon.classList.remove("hidden");
        els.btnSyncNow.disabled = false;
        
        // Refresh mapping dropdown to show 🔗 Linked tags
        fetchCRMDealsAndContacts();
      }, 2000);
    } else {
      throw new Error("Failed to insert deal activity.");
    }

  } catch (err) {
    alert("Failed syncing log: " + err.message);
    els.btnSyncNow.disabled = false;
    els.syncSpinner.classList.add("hidden");
    els.staticIcon.classList.remove("hidden");
    els.btnSyncNow.querySelector("span").textContent = "Sync Active Chat Log";
  }
}
