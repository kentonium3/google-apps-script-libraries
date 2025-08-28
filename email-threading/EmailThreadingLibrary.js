/**
 * @fileoverview Email Threading Library for Google Apps Script
 * @version 2.0.0
 * @description Robust email threading management that maintains proper group distribution
 * 
 * Key Features:
 * - Maintains email threads across conversations
 * - Forces emails to group addresses (prevents reply hijacking)
 * - Handles thread ID persistence and validation
 * - Provides comprehensive error handling and logging
 * - Modular design for reuse across projects
 * 
 * CHANGELOG:
 * v2.0.0 - Fixed reply() method issue that ignored recipient override
 *        - Now uses sendEmail() with manual threading headers
 *        - Ensures group emails always go to all members
 * v1.x.x - Original implementation using reply() method
 */

/**
 * Main Email Threading Manager Class
 */
class EmailThreadingManager {
  /**
   * @param {Object} config Configuration object
   * @param {string} config.threadIdProperty - Property name for storing thread ID
   * @param {string} config.recipientEmail - Primary recipient (individual or group)
   * @param {string} config.emailSubject - Subject line for new threads
   * @param {boolean} [config.enableLogging=true] - Enable detailed logging
   * @param {string} [config.scriptVersion='2.0.0'] - Version for tracking
   */
  constructor(config) {
    this.config = {
      threadIdProperty: config.threadIdProperty || 'emailThreadId',
      recipientEmail: config.recipientEmail,
      emailSubject: config.emailSubject,
      enableLogging: config.enableLogging !== false,
      scriptVersion: config.scriptVersion || '2.0.0'
    };
    
    this.properties = PropertiesService.getScriptProperties();
  }
  
  /**
   * Send a threaded email (main public method)
   * @param {string} htmlBody - HTML content of the email
   * @param {Object} [options] - Additional options
   * @param {string} [options.plainBody] - Plain text version
   * @param {Array} [options.attachments] - File attachments
   * @param {string} [options.cc] - CC recipients
   * @param {string} [options.bcc] - BCC recipients
   * @return {boolean} Success status
   */
  sendThreadedEmail(htmlBody, options = {}) {
    this.log('Starting threaded email send...');
    
    const storedThreadId = this.properties.getProperty(this.config.threadIdProperty);
    this.log(`Stored thread ID: ${storedThreadId || 'None'}`);
    
    try {
      if (storedThreadId) {
        // Try to reply to existing thread
        const replySuccess = this.replyToExistingThread(storedThreadId, htmlBody, options);
        if (replySuccess) {
          this.log('✅ Successfully replied to existing thread');
          return true;
        } else {
          this.log('Reply failed, creating new thread instead');
        }
      } else {
        this.log('No stored thread found, creating new thread');
      }
      
      // Create new thread if none exists or reply failed
      const newThreadSuccess = this.createNewThread(htmlBody, options);
      if (newThreadSuccess) {
        this.log('✅ Successfully created new thread');
        return true;
      } else {
        this.log('❌ Failed to create new thread');
        return false;
      }
      
    } catch (error) {
      this.log(`❌ Error in sendThreadedEmail: ${error.toString()}`);
      this.log(`Stack trace: ${error.stack || 'No stack trace available'}`);
      return false;
    }
  }
  
  /**
   * Reply to an existing email thread with proper group distribution
   * @private
   * @param {string} threadId - The Gmail thread ID
   * @param {string} htmlBody - HTML content
   * @param {Object} options - Additional email options
   * @return {boolean} Success status
   */
  replyToExistingThread(threadId, htmlBody, options = {}) {
    this.log(`Attempting to reply to thread: ${threadId}`);
    
    try {
      // Get the thread
      const thread = this.getThread(threadId);
      
      if (!thread) {
        this.log('❌ Thread not found');
        return false;
      }
      
      const messages = thread.getMessages();
      this.log(`Found thread with ${messages.length} messages`);
      this.log(`Thread subject: "${thread.getFirstMessageSubject()}"`);
      
      // Extract threading information
      const threadingInfo = this.extractThreadingHeaders(messages[0]);
      
      if (!threadingInfo.messageId) {
        this.log('⚠️ Could not extract Message-ID, attempting fallback method');
        // Try to get from raw content differently
        threadingInfo.messageId = this.extractMessageIdAlternative(messages[0]);
        
        if (!threadingInfo.messageId) {
          this.log('❌ Cannot maintain threading without Message-ID');
          return false;
        }
      }
      
      this.log(`First message ID: ${threadingInfo.messageId}`);
      
      // Build the References header chain
      const references = this.buildReferencesHeader(threadingInfo, messages);
      
      // Prepare email options with threading headers
      const emailOptions = {
        ...options,
        htmlBody: htmlBody,
        headers: {
          'In-Reply-To': `<${threadingInfo.messageId}>`,
          'References': references
        }
      };
      
      // Add plain text if not provided
      if (!emailOptions.plainBody && htmlBody) {
        emailOptions.plainBody = this.htmlToPlainText(htmlBody);
      }
      
      // CRITICAL FIX: Use sendEmail to force group recipient
      // This ensures emails always go to the group, not just the last replier
      GmailApp.sendEmail(
        this.config.recipientEmail,  // Always goes to configured recipient
        this.formatReplySubject(thread.getFirstMessageSubject()),
        emailOptions.plainBody || '',
        emailOptions
      );
      
      this.log('✅ Reply sent with proper threading headers');
      this.log(`Email sent to: ${this.config.recipientEmail} (recipient enforced)`);
      
      return true;
      
    } catch (error) {
      this.log(`❌ Error replying to thread ${threadId}: ${error.toString()}`);
      return false;
    }
  }
  
  /**
   * Create a new email thread
   * @private
   * @param {string} htmlBody - HTML content
   * @param {Object} options - Additional email options
   * @return {boolean} Success status
   */
  createNewThread(htmlBody, options = {}) {
    this.log('Creating new thread...');
    
    try {
      // Store old thread ID for debugging if it exists
      const oldThreadId = this.properties.getProperty(this.config.threadIdProperty);
      if (oldThreadId) {
        this.properties.setProperty('previousThreadId_' + this.config.threadIdProperty, oldThreadId);
        this.log(`Previous thread ID (${oldThreadId}) stored for debugging`);
      }
      
      // Prepare email options
      const emailOptions = {
        ...options,
        htmlBody: htmlBody
      };
      
      // Add plain text if not provided
      if (!emailOptions.plainBody && htmlBody) {
        emailOptions.plainBody = this.htmlToPlainText(htmlBody);
      }
      
      // Create draft and send to get thread ID reliably
      const draft = GmailApp.createDraft(
        this.config.recipientEmail,
        this.config.emailSubject,
        emailOptions.plainBody || '',
        emailOptions
      );
      
      this.log('Draft created, sending...');
      const sentMessage = draft.send();
      const newThread = sentMessage.getThread();
      const newThreadId = newThread.getId();
      
      // Store the new thread ID
      this.properties.setProperty(this.config.threadIdProperty, newThreadId);
      
      this.log(`✅ Created new thread with ID: ${newThreadId}`);
      this.log(`Thread subject: "${newThread.getFirstMessageSubject()}"`);
      
      return true;
      
    } catch (error) {
      this.log(`❌ Error creating new thread: ${error.toString()}`);
      return false;
    }
  }
  
  /**
   * Get a Gmail thread by ID with fallback methods
   * @private
   * @param {string} threadId - The thread ID
   * @return {GmailThread|null} The thread or null if not found
   */
  getThread(threadId) {
    let thread = null;
    
    // Method 1: Direct lookup
    try {
      thread = GmailApp.getThreadById(threadId);
      if (thread) {
        this.log('Thread found via direct lookup');
        return thread;
      }
    } catch (directError) {
      this.log(`Direct thread lookup failed: ${directError.toString()}`);
    }
    
    // Method 2: Search method
    try {
      this.log('Trying search method...');
      const threads = GmailApp.search('thread:' + threadId);
      if (threads.length > 0) {
        thread = threads[0];
        this.log('Thread found via search method');
        return thread;
      }
    } catch (searchError) {
      this.log(`Search method failed: ${searchError.toString()}`);
    }
    
    return null;
  }
  
  /**
   * Extract Message-ID and References from email headers
   * @private
   * @param {GmailMessage} message - The Gmail message
   * @return {Object} Object with messageId and references
   */
  extractThreadingHeaders(message) {
    try {
      const rawContent = message.getRawContent();
      
      // Extract Message-ID
      const messageIdMatch = rawContent.match(/Message-ID:\s*<([^>]+)>/i);
      const messageId = messageIdMatch ? messageIdMatch[1] : null;
      
      // Extract References
      const referencesMatch = rawContent.match(/References:\s*([^\r\n]+)/i);
      const references = referencesMatch ? referencesMatch[1].trim() : null;
      
      return { messageId, references };
      
    } catch (error) {
      this.log(`Error extracting headers: ${error.toString()}`);
      return { messageId: null, references: null };
    }
  }
  
  /**
   * Alternative method to extract Message-ID
   * @private
   * @param {GmailMessage} message - The Gmail message
   * @return {string|null} The message ID or null
   */
  extractMessageIdAlternative(message) {
    try {
      // Try getting from the message directly
      const id = message.getId();
      if (id) {
        // Gmail message IDs need to be formatted for headers
        return id + '@mail.gmail.com';
      }
    } catch (error) {
      this.log(`Alternative ID extraction failed: ${error.toString()}`);
    }
    return null;
  }
  
  /**
   * Build the References header for threading
   * @private
   * @param {Object} threadingInfo - Info from first message
   * @param {Array} messages - All messages in thread
   * @return {string} The References header value
   */
  buildReferencesHeader(threadingInfo, messages) {
    let references = '';
    
    // Start with existing references if any
    if (threadingInfo.references) {
      references = threadingInfo.references;
    }
    
    // Add the first message ID
    if (threadingInfo.messageId) {
      if (references) {
        references += ' ';
      }
      references += `<${threadingInfo.messageId}>`;
    }
    
    // Could add more message IDs from the thread if needed
    // But usually the first message ID is sufficient
    
    return references;
  }
  
  /**
   * Format subject for replies
   * @private
   * @param {string} subject - Original subject
   * @return {string} Formatted reply subject
   */
  formatReplySubject(subject) {
    // Remove existing Re: prefixes to avoid "Re: Re: Re:" chains
    subject = subject.replace(/^(Re:\s*)+/i, '');
    return 'Re: ' + subject;
  }
  
  /**
   * Simple HTML to plain text conversion
   * @private
   * @param {string} html - HTML content
   * @return {string} Plain text
   */
  htmlToPlainText(html) {
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, ' ');
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }
  
  /**
   * Reset threading - clears stored thread ID
   */
  resetThreading() {
    const oldThreadId = this.properties.getProperty(this.config.threadIdProperty);
    
    if (oldThreadId) {
      // Archive old thread ID
      this.properties.setProperty('archived_' + this.config.threadIdProperty, oldThreadId);
      this.properties.setProperty('archived_date_' + this.config.threadIdProperty, new Date().toISOString());
    }
    
    this.properties.deleteProperty(this.config.threadIdProperty);
    
    this.log('✅ Threading reset completed');
    this.log(`Previous thread ID: ${oldThreadId || 'None'}`);
    this.log('Next email will start a new thread');
  }
  
  /**
   * Get current thread information for debugging
   * @return {Object} Thread information
   */
  getThreadInfo() {
    const threadId = this.properties.getProperty(this.config.threadIdProperty);
    const previousThreadId = this.properties.getProperty('previousThreadId_' + this.config.threadIdProperty);
    const archivedThreadId = this.properties.getProperty('archived_' + this.config.threadIdProperty);
    
    const info = {
      currentThreadId: threadId || null,
      previousThreadId: previousThreadId || null,
      archivedThreadId: archivedThreadId || null,
      threadDetails: null
    };
    
    if (threadId) {
      try {
        const thread = this.getThread(threadId);
        if (thread) {
          const messages = thread.getMessages();
          info.threadDetails = {
            subject: thread.getFirstMessageSubject(),
            messageCount: messages.length,
            firstMessageDate: messages[0].getDate(),
            lastMessageDate: messages[messages.length - 1].getDate(),
            labels: thread.getLabels().map(l => l.getName())
          };
        }
      } catch (error) {
        info.threadDetails = { error: error.toString() };
      }
    }
    
    return info;
  }
  
  /**
   * Logging utility
   * @private
   * @param {string} message - Log message
   */
  log(message) {
    if (this.config.enableLogging) {
      Logger.log(`[EmailThreading v${this.config.scriptVersion}] ${message}`);
    }
  }
}

/**
 * Factory function for creating EmailThreadingManager instances
 * @param {Object} config - Configuration object
 * @return {EmailThreadingManager} New instance
 */
function createEmailThreadingManager(config) {
  return new EmailThreadingManager(config);
}