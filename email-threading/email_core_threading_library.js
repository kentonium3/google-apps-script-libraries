/**
 * @fileoverview Core Email Threading Library
 * 
 * Proven email threading functions for Google Apps Script applications.
 * Developed through extensive debugging of the Rise Tracker application.
 * 
 * KEY INSIGHT: Use Gmail's native reply method instead of manual Message-ID extraction
 * 
 * Version: 1.0-LIBRARY
 */

// =====================================================================
// CORE THREADING FUNCTIONS
// =====================================================================

/**
 * Sends email with proper threading using Gmail's native capabilities
 * 
 * @param {string} htmlBody - The HTML content to send
 * @param {Object} config - Configuration object
 * @param {string} config.threadIdProperty - Property key for storing thread ID
 * @param {string} config.emailSubject - Email subject line
 * @param {string|Array} config.recipientEmail - Recipient(s) - can be individual or group
 * @param {string} [config.scriptVersion] - Script version for logging
 * @return {boolean} True if successful
 */
function sendThreadedEmail(htmlBody, config) {
  Logger.log(`Starting threaded email send (${config.scriptVersion || 'Unknown'})`);
  
  const properties = PropertiesService.getScriptProperties();
  const storedThreadId = properties.getProperty(config.threadIdProperty);
  
  Logger.log(`Stored thread ID: ${storedThreadId || 'None'}`);
  
  try {
    if (storedThreadId) {
      // Try to reply to existing thread
      const replySuccess = replyToExistingThread(storedThreadId, htmlBody, config);
      if (replySuccess) {
        Logger.log("✅ Successfully replied to existing thread");
        return true;
      } else {
        Logger.log("Reply failed, creating new thread instead");
      }
    }
    
    // Create new thread if none exists or reply failed
    const newThreadSuccess = createNewThread(htmlBody, config, properties);
    if (newThreadSuccess) {
      Logger.log("✅ Successfully created new thread");
      return true;
    } else {
      Logger.log("❌ Failed to create new thread");
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ Error in sendThreadedEmail: ${error.toString()}`);
    return false;
  }
}

/**
 * Replies to existing thread using Gmail's native reply method
 * 
 * @param {string} threadId - The stored thread ID
 * @param {string} htmlBody - The email content
 * @param {Object} config - Configuration object
 * @return {boolean} True if successful
 */
function replyToExistingThread(threadId, htmlBody, config) {
  Logger.log(`Attempting to reply to thread: ${threadId}`);
  
  try {
    // Try to get the thread with fallback search methods
    const thread = findThreadById(threadId);
    
    if (!thread) {
      Logger.log("❌ Thread not found by any method");
      return false;
    }
    
    const messages = thread.getMessages();
    Logger.log(`Found thread with ${messages.length} messages`);
    Logger.log(`Thread subject: "${thread.getFirstMessageSubject()}"`);
    
    // Get the last message and use Gmail's NATIVE REPLY method
    const lastMessage = messages[messages.length - 1];
    Logger.log(`Last message from: ${lastMessage.getFrom()}`);
    
    // Determine if we're sending to a group or individual
    const recipientEmail = Array.isArray(config.recipientEmail) 
      ? config.recipientEmail.join(', ')
      : config.recipientEmail;
    
    // THE KEY FIX: Use Gmail's native reply method
    // For groups: force the 'to' field to ensure group delivery
    // For individuals: let Gmail handle it naturally
    const replyOptions = { htmlBody: htmlBody };
    
    // If recipient looks like a group (contains 'group' or multiple recipients), force delivery
    if (recipientEmail.includes('group') || recipientEmail.includes('@googlegroups.com') || Array.isArray(config.recipientEmail)) {
      replyOptions.to = recipientEmail;
      Logger.log("Forcing group delivery");
    }
    
    lastMessage.reply("", replyOptions);
    
    Logger.log("✅ Native reply sent successfully");
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error replying to thread ${threadId}: ${error.toString()}`);
    return false;
  }
}

/**
 * Creates a new thread and stores the ID
 * 
 * @param {string} htmlBody - The email content
 * @param {Object} config - Configuration object
 * @param {PropertiesService.Properties} properties - Properties service instance
 * @return {boolean} True if successful
 */
function createNewThread(htmlBody, config, properties) {
  Logger.log("Creating new thread...");
  
  try {
    // Store old thread ID for debugging if it exists
    const oldThreadId = properties.getProperty(config.threadIdProperty);
    if (oldThreadId) {
      properties.setProperty(`last_${config.threadIdProperty}`, oldThreadId);
      Logger.log(`Previous thread ID (${oldThreadId}) stored for debugging`);
    }
    
    const recipientEmail = Array.isArray(config.recipientEmail) 
      ? config.recipientEmail.join(', ')
      : config.recipientEmail;
    
    // Use createDraft and send() to reliably get the thread ID
    const draft = GmailApp.createDraft(
      recipientEmail,
      config.emailSubject,
      "",
      { htmlBody: htmlBody }
    );
    
    Logger.log("Draft created, sending...");
    const newThread = draft.send().getThread();
    const newThreadId = newThread.getId();
    
    // Store the new thread ID
    properties.setProperty(config.threadIdProperty, newThreadId);
    
    Logger.log(`✅ Created new thread with ID: ${newThreadId}`);
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error creating new thread: ${error.toString()}`);
    return false;
  }
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Finds thread by ID using multiple methods
 * 
 * @param {string} threadId - Thread ID to find
 * @return {GmailApp.GmailThread|null} Thread if found, null otherwise
 */
function findThreadById(threadId) {
  try {
    // Method 1: Direct thread lookup by ID
    Logger.log("Trying direct thread lookup...");
    const thread = GmailApp.getThreadById(threadId);
    if (thread) {
      Logger.log("✅ Thread found directly by ID");
      return thread;
    }
  } catch (directError) {
    Logger.log(`Direct thread lookup failed: ${directError.toString()}`);
  }
  
  try {
    // Method 2: Search method as fallback
    Logger.log("Trying search method...");
    const threads = GmailApp.search("thread:" + threadId);
    if (threads.length > 0) {
      Logger.log("✅ Thread found via search method");
      return threads[0];
    }
  } catch (searchError) {
    Logger.log(`Search method failed: ${searchError.toString()}`);
  }
  
  return null;
}

/**
 * Resets threading by clearing stored thread ID
 * 
 * @param {string} threadIdProperty - Property key to clear
 */
function resetThreading(threadIdProperty) {
  const properties = PropertiesService.getScriptProperties();
  const oldThreadId = properties.getProperty(threadIdProperty);
  
  properties.deleteProperty(threadIdProperty);
  
  Logger.log("✅ Threading reset completed");
  Logger.log(`Previous thread ID: ${oldThreadId || 'None'}`);
  Logger.log("Next email will start a new thread");
}

/**
 * Gets thread information for debugging
 * 
 * @param {string} threadIdProperty - Property key to check
 * @return {Object|null} Thread info object or null if not found
 */
function getThreadInfo(threadIdProperty) {
  Logger.log("--- Thread Information ---");
  
  const properties = PropertiesService.getScriptProperties();
  const threadId = properties.getProperty(threadIdProperty);
  const lastKnownThreadId = properties.getProperty(`last_${threadIdProperty}`);
  
  Logger.log(`Current thread ID: ${threadId || 'None'}`);
  Logger.log(`Last known thread ID: ${lastKnownThreadId || 'None'}`);
  
  if (!threadId) {
    return null;
  }
  
  try {
    const thread = findThreadById(threadId);
    if (!thread) {
      Logger.log(`❌ Thread ${threadId} not found`);
      return null;
    }
    
    const messages = thread.getMessages();
    const threadInfo = {
      threadId: threadId,
      subject: thread.getFirstMessageSubject(),
      messageCount: messages.length,
      firstMessageDate: messages[0].getDate(),
      lastMessageDate: messages[messages.length - 1].getDate(),
      labels: thread.getLabels().map(l => l.getName())
    };
    
    Logger.log(`Subject: ${threadInfo.subject}`);
    Logger.log(`Message count: ${threadInfo.messageCount}`);
    Logger.log(`First message: ${threadInfo.firstMessageDate}`);
    Logger.log(`Last message: ${threadInfo.lastMessageDate}`);
    Logger.log(`Labels: ${threadInfo.labels.join(', ')}`);
    
    return threadInfo;
    
  } catch (error) {
    Logger.log(`❌ Error getting thread info: ${error.toString()}`);
    return null;
  }
}

// =====================================================================
// CONFIGURATION HELPERS
// =====================================================================

/**
 * Creates a standard configuration object for threading
 * 
 * @param {Object} params - Configuration parameters
 * @param {string} params.threadIdProperty - Property key for storing thread ID
 * @param {string} params.emailSubject - Email subject line  
 * @param {string|Array} params.recipientEmail - Recipient(s)
 * @param {string} [params.scriptVersion] - Script version for logging
 * @return {Object} Configuration object
 */
function createThreadingConfig(params) {
  return {
    threadIdProperty: params.threadIdProperty,
    emailSubject: params.emailSubject,
    recipientEmail: params.recipientEmail,
    scriptVersion: params.scriptVersion || 'Unknown'
  };
}