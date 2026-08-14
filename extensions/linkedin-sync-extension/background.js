// background.js - CloudBaud LinkedIn Sync Service Worker

// Configure the side panel to open when clicking the extension action icon
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting panel behavior:", error));
  
  console.log("CloudBaud LinkedIn Sync Extension Installed successfully.");
});

// Watch for tab updates to see if the user enters a LinkedIn messaging URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  if (tab.url.includes("linkedin.com/messaging/thread/") || tab.url.includes("linkedin.com/messaging/")) {
    // We can show the extension as active
    chrome.action.enable(tabId);
    
    // If the URL changed to a thread, broadcast a message so the sidebar knows to rescrape
    if (changeInfo.url) {
      chrome.runtime.sendMessage({
        type: "LINKEDIN_URL_CHANGED",
        url: changeInfo.url
      }).catch(() => {
        // Sidebar might not be open yet, ignore this error safely
      });
    }
  }
});
