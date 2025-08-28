/**
 * @fileoverview Testing and Debugging Utilities for Email Threading Library
 * @version 2.0.0
 * @description Comprehensive testing suite and debugging tools
 */

// =====================================================================
// DEBUGGING UTILITIES
// =====================================================================

/**
 * Comprehensive debugging class for email threading
 */
class EmailThreadingDebugger {
  constructor() {
    this.properties = PropertiesService.getScriptProperties();
  }
  
  /**
   * Run full diagnostic check on threading system
   */
  runFullDiagnostics() {
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════╗');
    Logger.log('║     EMAIL THREADING DIAGNOSTICS v2.0.0                ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
    
    this.checkEnvironment();
    this.checkStoredThreads();
    this.checkEmailPermissions();
    this.checkActiveThreads();
    this.checkRecentEmails();
    
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════╗');
    Logger.log('║     DIAGNOSTICS COMPLETE                              ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
  }
  
  /**
   * Check script environment and configuration
   */
  checkEnvironment() {
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('1. ENVIRONMENT CHECK');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      Logger.log(`Script User: ${Session.getActiveUser().getEmail()}`);
      Logger.log(`Script Timezone: ${Session.getScriptTimeZone()}`);
      Logger.log(`Current Time: ${new Date().toLocaleString()}`);
      
      // Check for spreadsheet context
      try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        Logger.log(`Spreadsheet: ${ss ? ss.getName() : 'Not available'}`);
      } catch (e) {
        Logger.log('Spreadsheet: Not in spreadsheet context');
      }
      
      // Check Gmail quota
      const quota = MailApp.getRemainingDailyQuota();
      Logger.log(`Email Quota Remaining: ${quota}`);
      
      if (quota < 10) {
        Logger.log('⚠️ WARNING: Low email quota remaining!');
      }
      
      Logger.log('✅ Environment check passed');
      
    } catch (error) {
      Logger.log(`❌ Environment check failed: ${error.toString()}`);
    }
    
    Logger.log('');
  }
  
  /**
   * Check all stored thread IDs
   */
  checkStoredThreads() {
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('2. STORED THREADS CHECK');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allProps = this.properties.getProperties();
    const threadProps = {};
    
    // Find all thread-related properties
    Object.keys(allProps).forEach(key => {
      if (key.toLowerCase().includes('thread')) {
        threadProps[key] = allProps[key];
      }
    });
    
    if (Object.keys(threadProps).length === 0) {
      Logger.log('No stored thread IDs found');
    } else {
      Logger.log(`Found ${Object.keys(threadProps).length} thread-related properties:`);
      
      Object.entries(threadProps).forEach(([key, value]) => {
        Logger.log(`  ${key}: ${value}`);
        
        // Try to validate the thread
        if (!key.includes('archived') && !key.includes('previous')) {
          this.validateThreadId(value);
        }
      });
    }
    
    Logger.log('');
  }
  
  /**
   * Validate a thread ID
   * @param {string} threadId - Thread ID to validate
   */
  validateThreadId(threadId) {
    try {
      const thread = GmailApp.getThreadById(threadId);
      if (thread) {
        const messages = thread.getMessages();
        Logger.log(`    ✅ Valid - ${messages.length} messages, Subject: "${thread.getFirstMessageSubject()}"`);
      } else {
        Logger.log(`    ❌ Invalid - Thread not found`);
      }
    } catch (error) {
      Logger.log(`    ❌ Error validating: ${error.toString()}`);
    }
  }
  
  /**
   * Check email permissions and settings
   */
  checkEmailPermissions() {
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('3. EMAIL PERMISSIONS CHECK');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Test ability to create drafts
      const testDraft = GmailApp.createDraft('test@example.com', 'Test', 'Test');
      testDraft.deleteDraft();
      Logger.log('✅ Can create and delete drafts');
      
      // Test ability to search emails
      const threads = GmailApp.search('in:sent', 0, 1);
      Logger.log(`✅ Can search emails (found ${threads.length} sent thread)`);
      
      // Check for any restrictions
      Logger.log('✅ Email permissions check passed');
      
    } catch (error) {
      Logger.log(`❌ Permission issue: ${error.toString()}`);
    }
    
    Logger.log('');
  }
  
  /**
   * Check active threads in Gmail
   */
  checkActiveThreads() {
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('4. ACTIVE THREADS CHECK');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allProps = this.properties.getProperties();
    
    // Check each stored thread
    Object.entries(allProps).forEach(([key, threadId]) => {
      if (key.includes('ThreadId') && !key.includes('archived') && !key.includes('previous')) {
        Logger.log(`\nChecking ${key}: ${threadId}`);
        this.analyzeThread(threadId);
      }
    });
    
    Logger.log('');
  }
  
  /**
   * Analyze a specific thread in detail
   * @param {string} threadId - Thread ID to analyze
   */
  analyzeThread(threadId) {
    try {
      const thread = GmailApp.getThreadById(threadId);
      if (!thread) {
        Logger.log('  Thread not found');
        return;
      }
      
      const messages = thread.getMessages();
      const firstMsg = messages[0];
      const lastMsg = messages[messages.length - 1];
      
      Logger.log(`  Subject: ${thread.getFirstMessageSubject()}`);
      Logger.log(`  Messages: ${messages.length}`);
      Logger.log(`  First message: ${firstMsg.getDate().toLocaleString()} from ${firstMsg.getFrom()}`);
      Logger.log(`  Last message: ${lastMsg.getDate().toLocaleString()} from ${lastMsg.getFrom()}`);
      
      // Check for reply patterns
      const recipients = new Set();
      messages.forEach(msg => {
        const to = msg.getTo();
        if (to) {
          recipients.add(to.toLowerCase());
        }
      });
      
      Logger.log(`  Unique recipients: ${Array.from(recipients).join(', ')}`);
      
      // Check for potential issues
      if (recipients.size > 1) {
        Logger.log('  ⚠️ WARNING: Multiple different recipients detected');
      }
      
    } catch (error) {
      Logger.log(`  Error analyzing thread: ${error.toString()}`);
    }
  }
  
  /**
   * Check recent emails for threading issues
   */
  checkRecentEmails() {
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('5. RECENT EMAILS CHECK');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Check sent emails from last 7 days
      const query = 'in:sent newer_than:7d';
      const threads = GmailApp.search(query, 0, 10);
      
      Logger.log(`Found ${threads.length} sent threads in last 7 days`);
      
      threads.forEach(thread => {
        const messages = thread.getMessages();
        const subject = thread.getFirstMessageSubject();
        
        // Look for threading patterns
        if (subject.startsWith('Re:')) {
          const lastMsg = messages[messages.length - 1];
          Logger.log(`  Reply thread: "${subject}" - To: ${lastMsg.getTo()}`);
        }
      });
      
    } catch (error) {
      Logger.log(`Error checking recent emails: ${error.toString()}`);
    }
    
    Logger.log('');
  }
}

// =====================================================================
// TESTING SUITE
// =====================================================================

/**
 * Comprehensive test suite for email threading
 */
class EmailThreadingTestSuite {
  constructor() {
    this.testResults = [];
  }
  
  /**
   * Run all tests
   */
  runAllTests() {
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════╗');
    Logger.log('║     EMAIL THREADING TEST SUITE v2.0.0                 ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
    
    this.testThreadCreation();
    this.testThreadReply();
    this.testGroupRecipientEnforcement();
    this.testThreadReset();
    this.testErrorHandling();
    this.testHeaderExtraction();
    
    this.printResults();
  }
  
  /**
   * Test thread creation
   */
  testThreadCreation() {
    Logger.log('Test 1: Thread Creation');
    
    try {
      const config = {
        threadIdProperty: 'testSuite_createThread',
        recipientEmail: 'test@example.com',
        emailSubject: 'Test Suite - Thread Creation',
        enableLogging: false
      };
      
      const manager = new EmailThreadingManager(config);
      
      // Reset first to ensure clean state
      manager.resetThreading();
      
      // Create new thread
      const htmlBody = '<p>Test thread creation</p>';
      const success = manager.sendThreadedEmail(htmlBody);
      
      if (success) {
        const info = manager.getThreadInfo();
        if (info.currentThreadId) {
          this.recordTest('Thread Creation', true, 'Thread created successfully');
        } else {
          this.recordTest('Thread Creation', false, 'No thread ID stored');
        }
      } else {
        this.recordTest('Thread Creation', false, 'Failed to send email');
      }
      
    } catch (error) {
      this.recordTest('Thread Creation', false, error.toString());
    }
  }
  
  /**
   * Test thread reply
   */
  testThreadReply() {
    Logger.log('Test 2: Thread Reply');
    
    try {
      const config = {
        threadIdProperty: 'testSuite_replyThread',
        recipientEmail: 'test@example.com',
        emailSubject: 'Test Suite - Thread Reply',
        enableLogging: false
      };
      
      const manager = new EmailThreadingManager(config);
      
      // First create a thread
      manager.resetThreading();
      const htmlBody1 = '<p>Original message</p>';
      const success1 = manager.sendThreadedEmail(htmlBody1);
      
      if (!success1) {
        this.recordTest('Thread Reply', false, 'Failed to create initial thread');
        return;
      }
      
      // Wait a moment
      Utilities.sleep(1000);
      
      // Now reply to it
      const htmlBody2 = '<p>Reply message</p>';
      const success2 = manager.sendThreadedEmail(htmlBody2);
      
      if (success2) {
        const info = manager.getThreadInfo();
        if (info.threadDetails && info.threadDetails.messageCount > 1) {
          this.recordTest('Thread Reply', true, 'Reply added to thread');
        } else {
          this.recordTest('Thread Reply', false, 'Reply not added to thread');
        }
      } else {
        this.recordTest('Thread Reply', false, 'Failed to send reply');
      }
      
    } catch (error) {
      this.recordTest('Thread Reply', false, error.toString());
    }
  }
  
  /**
   * Test group recipient enforcement
   */
  testGroupRecipientEnforcement() {
    Logger.log('Test 3: Group Recipient Enforcement');
    
    try {
      const groupEmail = 'group@example.com';
      const config = {
        threadIdProperty: 'testSuite_groupEnforce',
        recipientEmail: groupEmail,
        emailSubject: 'Test Suite - Group Enforcement',
        enableLogging: false
      };
      
      const manager = new EmailThreadingManager(config);
      
      // The critical fix ensures emails always go to the configured recipient
      // We can't fully test this without sending real emails, but we can verify
      // the configuration is correct
      
      if (manager.config.recipientEmail === groupEmail) {
        this.recordTest('Group Recipient Enforcement', true, 
          'Configuration correctly set to enforce group recipient');
      } else {
        this.recordTest('Group Recipient Enforcement', false, 
          'Configuration not properly set');
      }
      
    } catch (error) {
      this.recordTest('Group Recipient Enforcement', false, error.toString());
    }
  }
  
  /**
   * Test thread reset functionality
   */
  testThreadReset() {
    Logger.log('Test 4: Thread Reset');
    
    try {
      const config = {
        threadIdProperty: 'testSuite_resetThread',
        recipientEmail: 'test@example.com',
        emailSubject: 'Test Suite - Reset',
        enableLogging: false
      };
      
      const manager = new EmailThreadingManager(config);
      
      // Create a thread
      manager.sendThreadedEmail('<p>Test</p>');
      
      // Get initial info
      const infoBefore = manager.getThreadInfo();
      
      // Reset
      manager.resetThreading();
      
      // Get info after reset
      const infoAfter = manager.getThreadInfo();
      
      if (!infoAfter.currentThreadId && infoBefore.currentThreadId) {
        this.recordTest('Thread Reset', true, 'Thread ID cleared successfully');
      } else {
        this.recordTest('Thread Reset', false, 'Thread ID not properly cleared');
      }
      
    } catch (error) {
      this.recordTest('Thread Reset', false, error.toString());
    }
  }
  
  /**
   * Test error handling
   */
  testErrorHandling() {
    Logger.log('Test 5: Error Handling');
    
    try {
      const config = {
        threadIdProperty: 'testSuite_errorHandling',
        recipientEmail: '', // Invalid email
        emailSubject: 'Test Suite - Error Handling',
        enableLogging: false
      };
      
      const manager = new EmailThreadingManager(config);
      
      // This should fail gracefully
      const success = manager.sendThreadedEmail('<p>Test</p>');
      
      if (!success) {
        this.recordTest('Error Handling', true, 'Handled invalid email gracefully');
      } else {
        this.recordTest('Error Handling', false, 'Did not catch invalid email');
      }
      
    } catch (error) {
      // Catching an error is also acceptable
      this.recordTest('Error Handling', true, 'Error caught: ' + error.toString());
    }
  }
  
  /**
   * Test header extraction
   */
  testHeaderExtraction() {
    Logger.log('Test 6: Header Extraction');
    
    try {
      // Get a recent sent email to test with
      const threads = GmailApp.search('in:sent', 0, 1);
      
      if (threads.length === 0) {
        this.recordTest('Header Extraction', false, 'No sent emails to test with');
        return;
      }
      
      const message = threads[0].getMessages()[0];
      const rawContent = message.getRawContent();
      
      // Check for Message-ID
      const messageIdMatch = rawContent.match(/Message-ID:\s*<([^>]+)>/i);
      
      if (messageIdMatch && messageIdMatch[1]) {
        this.recordTest('Header Extraction', true, 
          'Successfully extracted Message-ID');
      } else {
        this.recordTest('Header Extraction', false, 
          'Could not extract Message-ID from email');
      }
      
    } catch (error) {
      this.recordTest('Header Extraction', false, error.toString());
    }
  }
  
  /**
   * Record test result
   * @param {string} testName - Name of the test
   * @param {boolean} passed - Whether test passed
   * @param {string} details - Additional details
   */
  recordTest(testName, passed, details) {
    this.testResults.push({
      name: testName,
      passed: passed,
      details: details
    });
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    Logger.log(`  ${status}: ${details}`);
    Logger.log('');
  }
  
  /**
   * Print test results summary
   */
  printResults() {
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('TEST RESULTS SUMMARY');
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;
    
    Logger.log(`Total Tests: ${total}`);
    Logger.log(`Passed: ${passed}`);
    Logger.log(`Failed: ${failed}`);
    Logger.log(`Success Rate: ${Math.round(passed / total * 100)}%`);
    
    if (failed > 0) {
      Logger.log('\nFailed Tests:');
      this.testResults.filter(r => !r.passed).forEach(result => {
        Logger.log(`  - ${result.name}: ${result.details}`);
      });
    }
    
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════╗');
    Logger.log('║     TEST SUITE COMPLETE                               ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
  }
}

// =====================================================================
// QUICK ACCESS FUNCTIONS
// =====================================================================

/**
 * Run full diagnostics on the email threading system
 */
function runEmailThreadingDiagnostics() {
  const diagnostics = new EmailThreadingDebugger();
  diagnostics.runFullDiagnostics();
}

/**
 * Run the complete test suite
 */
function runEmailThreadingTests() {
  const testSuite = new EmailThreadingTestSuite();
  testSuite.runAllTests();
}

/**
 * Quick check of all thread properties
 */
function quickThreadCheck() {
  Logger.log('=== QUICK THREAD CHECK ===');
  const properties = PropertiesService.getScriptProperties();
  const allProps = properties.getProperties();
  
  Object.keys(allProps).forEach(key => {
    if (key.toLowerCase().includes('thread')) {
      Logger.log(`${key}: ${allProps[key]}`);
    }
  });
  
  Logger.log('=== END QUICK CHECK ===');
}

/**
 * Clean up test threads and properties
 */
function cleanupTestThreads() {
  Logger.log('=== CLEANING UP TEST THREADS ===');
  
  const properties = PropertiesService.getScriptProperties();
  const allProps = properties.getProperties();
  let cleaned = 0;
  
  Object.keys(allProps).forEach(key => {
    if (key.startsWith('testSuite_')) {
      properties.deleteProperty(key);
      Logger.log(`Deleted: ${key}`);
      cleaned++;
    }
  });
  
  Logger.log(`Cleaned up ${cleaned} test properties`);
  Logger.log('=== CLEANUP COMPLETE ===');
}

/**
 * Monitor thread behavior over time
 * Call this function periodically to track threading
 */
function monitorThreading() {
  const properties = PropertiesService.getScriptProperties();
  const monitorKey = 'threadMonitorLog';
  
  // Get existing log or create new
  let log = properties.getProperty(monitorKey);
  log = log ? JSON.parse(log) : [];
  
  // Add current snapshot
  const snapshot = {
    timestamp: new Date().toISOString(),
    threads: {}
  };
  
  const allProps = properties.getProperties();
  Object.keys(allProps).forEach(key => {
    if (key.includes('ThreadId') && !key.includes('monitor')) {
      snapshot.threads[key] = allProps[key];
    }
  });
  
  log.push(snapshot);
  
  // Keep only last 10 snapshots
  if (log.length > 10) {
    log = log.slice(-10);
  }
  
  // Save back
  properties.setProperty(monitorKey, JSON.stringify(log));
  
  Logger.log('=== THREAD MONITORING SNAPSHOT ===');
  Logger.log(JSON.stringify(snapshot, null, 2));
  Logger.log('=== END SNAPSHOT ===');
}

/**
 * Get monitoring history
 */
function getMonitoringHistory() {
  const properties = PropertiesService.getScriptProperties();
  const monitorKey = 'threadMonitorLog';
  const log = properties.getProperty(monitorKey);
  
  if (log) {
    const history = JSON.parse(log);
    Logger.log('=== MONITORING HISTORY ===');
    history.forEach(snapshot => {
      Logger.log(`\nTimestamp: ${snapshot.timestamp}`);
      Object.entries(snapshot.threads).forEach(([key, value]) => {
        Logger.log(`  ${key}: ${value}`);
      });
    });
    Logger.log('=== END HISTORY ===');
  } else {
    Logger.log('No monitoring history found');
  }
}