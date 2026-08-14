// content.js - LinkedIn Message Scraper

console.log("[CloudBaud] LinkedIn message scraper active.");

// Listener for scrape requests from the extension sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SCRAPE_THREAD") {
    try {
      const threadData = scrapeActiveThread();
      sendResponse({ success: true, data: threadData });
    } catch (error) {
      console.error("[CloudBaud] Scrape error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep message channel open for async response
});

/**
 * Extracts active thread details from the LinkedIn DOM with high resilience.
 */
function scrapeActiveThread() {
  const url = window.location.href;
  
  // 1. Extract Thread ID from URL
  // Matches: https://www.linkedin.com/messaging/thread/2-OWQ1.../
  let threadId = "";
  const match = url.match(/messaging\/thread\/([^/]+)/);
  if (match && match[1]) {
    threadId = match[1];
  } else {
    // If we're on /messaging but no thread is in the URL, grab the active list item thread ID
    const activeThreadItem = document.querySelector(".msg-conversation-listitem--active, [aria-current='true']");
    if (activeThreadItem) {
      const threadHref = activeThreadItem.querySelector("a")?.getAttribute("href") || "";
      const innerMatch = threadHref.match(/thread\/([^/]+)/);
      if (innerMatch && innerMatch[1]) {
        threadId = innerMatch[1];
      }
    }
  }

  // 2. Extract Contact Name from Thread Header
  let contactName = "";
  
  // Selector fallback chain for LinkedIn Header Title
  const titleSelectors = [
    ".msg-entity-lockup__entity-title",
    "h2.msg-entity-lockup__entity-title",
    ".msg-thread__linkup-profile-name",
    ".msg-conversation-card__participant-names",
    "[class*='msg-entity-lockup'] [class*='title']",
    "header [class*='title']",
    ".msg-title-bar__title"
  ];

  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      contactName = el.textContent.trim();
      if (contactName) break;
    }
  }

  // Cleanup name if it has commas, newlines, or extra text
  if (contactName) {
    contactName = contactName.split("\n")[0].trim().replace(/\s+/g, " ");
  }

  // 3. Extract Message History
  const messages = [];
  
  // Select all individual message event listitems in the current active pane
  // LinkedIn groups messages by user/time in list elements
  const messageGroups = document.querySelectorAll(".msg-s-message-list__thread-bundle, .msg-s-message-group, [class*='message-group']");

  messageGroups.forEach(group => {
    // Get sender name in group
    let sender = "";
    const senderSelectors = [
      ".msg-s-message-group__profile-link",
      "span.msg-s-message-group__name",
      "[class*='profile-link']",
      "[class*='name']"
    ];
    for (const sel of senderSelectors) {
      const el = group.querySelector(sel);
      if (el) {
        sender = el.textContent.trim();
        if (sender) break;
      }
    }
    
    // Find all message body rows in this group
    const messageBodies = group.querySelectorAll(".msg-s-event-listitem__body, .msg-s-message-bubble__content, [class*='message-bubble'] [class*='body']");
    const timeEl = group.querySelector("time, .msg-s-message-group__timestamp, [class*='timestamp']");
    const timeStr = timeEl ? timeEl.textContent.trim() : new Date().toLocaleTimeString();

    messageBodies.forEach(body => {
      const text = body.textContent.trim().replace(/\s+/g, " ");
      if (text && sender) {
        messages.push({
          sender: sender,
          text: text,
          time: timeStr
        });
      }
    });
  });

  // If no message groups are matched, fallback to scraping raw event items directly
  if (messages.length === 0) {
    const rawEvents = document.querySelectorAll(".msg-s-event-listitem, [class*='event-listitem']");
    rawEvents.forEach(item => {
      const senderEl = item.querySelector(".msg-s-event-listitem__link, [class*='link']");
      const bodyEl = item.querySelector(".msg-s-event-listitem__body, [class*='body']");
      const timeEl = item.querySelector("time, [class*='time']");
      
      const sender = senderEl ? senderEl.textContent.trim() : "Participant";
      const text = bodyEl ? bodyEl.textContent.trim().replace(/\s+/g, " ") : "";
      const time = timeEl ? timeEl.textContent.trim() : "";

      if (text) {
        messages.push({ sender, text, time });
      }
    });
  }

  // Slice to the last 15 messages to prevent overloading notes with infinite scroll logs
  const truncatedMessages = messages.slice(-15);

  return {
    threadId: threadId,
    contactName: contactName || "Unknown Contact",
    messages: truncatedMessages,
    scrapedAt: new Date().toISOString(),
    url: url
  };
}
