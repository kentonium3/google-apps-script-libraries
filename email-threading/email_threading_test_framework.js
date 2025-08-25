/**
 * @fileoverview Email Threading Test Framework
 * 
 * Comprehensive test suite for validating email threading behavior.
 * Based on successful debugging of the Rise Tracker application.
 * 
 * Version: 1.0-TEST-FRAMEWORK
 */

// =====================================================================
// TEST CONFIGURATION
// =====================================================================
const TEST_CONFIG = {
  // Test recipients (update these to your test email addresses)
  testRecipients: ["test1@example.com", "test2@example.com"],
  
  // Test subjects for different scenarios
  basicThreadingSubject: "Basic Threading Test",
  groupThreadingSubject: "Group Threading Test", 
  edgeCaseSubject: "Edge Case Threading Test",
  
  // Script version
  scriptVersion: "v1.0-TEST-FRAMEWORK",
  
  // Property keys for different tests
  basicTestThreadId: 'basicTestThreadId',
  groupTestThreadId: 'groupTestThreadId',
  folderTestThreadId: 'folderTestThreadId',
  externalReplyTestThreadId: 'externalReplyTestThreadId'
};

// =====================================================================
// BASIC THREADING TESTS
// =====================================================================

/**
 * Test 1: Basic threading with individual recipients
 * Run this multiple times to verify threading works consistently
 */
function testBasicThreading() {
  Logger.log(`--- Basic Threading Test (${TEST_CONFIG.scriptVersion}) ---`);
  
  const config = createThreadingConfig({
    threadIdProperty: TEST_CONFIG.basicTestThreadId,
    emailSubject: TEST_CONFIG.basicThreadingSubject,
    recipientEmail: TEST_CONFIG.testRecipients,
    scriptVersion: TEST_CONFIG.scriptVersion
  });
  
  const htmlBody = createTestEmailBody("Basic Threading Test", 
    "Testing basic email threading with individual recipients. " +
    "Multiple runs should create a single threaded conversation.");
  
  const success = sendThreadedEmail(htmlBody, config);
  
  Logger.log(success ? "✅ Basic threading test completed" : "❌ Basic threading test failed");
  Logger.log("--- Basic Threading Test Complete ---");
}

/**
 * Test 2: Group threading test
 * Tests threading behavior with Google Groups or multiple recipients
 */
function testGroupThreading() {
  Logger.log(`--- Group Threading Test (${TEST_CONFIG.scriptVersion}) ---`);
  
  const config = createThreadingConfig({
    threadIdProperty: TEST_CONFIG.groupTestThreadId,
    emailSubject: TEST_CONFIG.groupThreadingSubject,
    recipientEmail: "testgroup@googlegroups.com", // Update to your test group
    scriptVersion: TEST_CONFIG.scriptVersion
  });
  
  const htmlBody = createTestEmailBody("Group Threading Test",
    "Testing email threading with Google Groups. " +
    "Verifies that replies go to the group, not individuals.");
  
  const success = sendThreadedEmail(htmlBody, config);
  
  Logger.log(success ? "✅ Group threading test completed" : "❌ Group threading test failed");
  Logger.log("--- Group Threading Test Complete ---");
}

// =====================================================================
// EDGE CASE TESTS  
// =====================================================================

/**
 * Test 3: Folder movement test
 * Tests if threading works when emails are moved to folders
 */
function testFolderMovement() {
  Logger.log(`--- Folder Movement Test (${TEST_CONFIG.scriptVersion}) ---`);
  
  const properties = PropertiesService.getScriptProperties();
  const storedThreadId = properties.getProperty(TEST_CONFIG.folderTestThreadId);
  
  if (!storedThreadId) {
    // Create initial thread for folder testing
    const config = createThreadingConfig({
      threadIdProperty: TEST_CONFIG.folderTestThreadId,
      emailSubject: TEST_CONFIG.edgeCaseSubject + " - Folder Test",
      recipientEmail: TEST_CONFIG.testRecipients,
      scriptVersion: TEST_CONFIG.scriptVersion
    });
    
    const htmlBody = createTestEmailBody("Folder Movement Test - Initial",
      "This email tests folder movement behavior. " +
      "Move this thread to a folder, then run this test again.");
    
    const success = sendThreadedEmail(htmlBody, config);
    Logger.log("🔄 NEXT STEP: Move this thread to a folder in Gmail, then run this test again!");
    return;
  }
  
  // Test replying to moved thread
  Logger.log("Testing reply to thread that may have been moved to folder...");
  
  const config = createThreadingConfig({
    threadIdProperty: TEST_CONFIG.folderTestThreadId,
    emailSubject: TEST_CONFIG.edgeCaseSubject + " - Folder Test",
    recipientEmail: TEST_CONFIG.testRecipients,
    scriptVersion: TEST_CONFIG.scriptVersion
  });
  
  const htmlBody = createTestEmailBody("Folder Movement Test - Reply",
    "Testing reply to thread that was moved to a folder. " +
    "This should still maintain threading even if the original is not in inbox.");
  
  const success = sendThreadedEmail(htmlBody, config);
  
  Logger.log(success ? "✅ Folder movement test completed" : "❌ Folder movement test failed");
  Logger.log("--- Folder Movement Test Complete ---");
}

/**
 * Test 4: External reply handling test  
 * Tests behavior when external parties reply to the thread
 */
function testExternalReplyHandling() {
  Logger.log(`--- External Reply Test (${TEST_CONFIG.scriptVersion}) ---`);
  
  const properties = PropertiesService.getScriptProperties();
  const storedThreadId = properties.getProperty(TEST_CONFIG.externalReplyTestThreadId);
  
  if (!storedThreadId) {
    // Create initial thread for external reply testing
    const config = createThreadingConfig({
      threadIdProperty: TEST_CONFIG.externalReplyTestThreadId,
      emailSubject: TEST_CONFIG.edgeCaseSubject + " - External Reply Test",
      recipientEmail: TEST_CONFIG.testRecipients,
      scriptVersion: TEST_CONFIG.scriptVersion
    });
    
    const htmlBody = createTestEmailBody("External Reply Test - Initial",
      "This email tests external reply handling. " +
      "Reply to this email from one of the test recipients, then run this test again.");
    
    const success = sendThreadedEmail(htmlBody, config);
    Logger.log("🔄 NEXT STEP: Reply to this email from a test recipient, then run this test again!");
    return;
  }
  
  // Analyze thread and test reply after external replies
  Logger.log("Analyzing thread with potential external replies...");
  
  try {
    const thread = findThreadById(storedThreadId);
    if (thread) {
      const messages = thread.getMessages();
      const myEmail = Session.getActiveUser().getEmail();
      
      Logger.log(`Thread has ${messages.length} messages`);
      
      // Analyze message senders
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const from = message.getFrom();
        const isFromMe = from.includes(myEmail);
        Logger.log(`Message ${i + 1}: From ${from} (${isFromMe ? 'Internal' : 'External'})`);
      }
      
      const lastMessage = messages[messages.length - 1];
      const isLastExternal = !lastMessage.getFrom().includes(myEmail);
      Logger.log(`Last message is external: ${isLastExternal}`);
    }
  } catch (error) {
    Logger.log(`Error analyzing thread: ${error.toString()}`);
  }
  
  // Send reply regardless of external replies
  const config = createThreadingConfig({
    threadIdProperty: TEST_CONFIG.externalReplyTestThreadId,
    emailSubject: TEST_CONFIG.edgeCaseSubject + " - External Reply Test",
    recipientEmail: TEST_CONFIG.testRecipients,
    scriptVersion: TEST_CONFIG.scriptVersion
  });
  
  const htmlBody = createTestEmailBody("External Reply Test - Response",
    "Testing response after external parties have replied to the thread. " +
    "This should maintain threading regardless of who replied last.");
  
  const success = sendThreadedEmail(htmlBody, config);
  
  Logger.log(success ? "✅ External reply test completed" : "❌ External reply test failed");
  Logger.log("--- External Reply Test Complete ---");
}

// =====================================================================
// TEST UTILITIES
// =====================================================================

/**
 * Runs all tests in sequence
 */
function runAllTests() {
  Logger.log("=== RUNNING COMPLETE TEST SUITE ===");
  
  Logger.log("\n1. Basic Threading Test:");
  testBasicThreading();
  
  Logger.log("\n2. Group Threading Test:");
  testGroupThreading();
  
  Logger.log("\n3. Folder Movement Test:");
  testFolderMovement();
  
  Logger.log("\n4. External Reply Test:");
  testExternalReplyHandling();
  
  Logger.log("\n=== TEST SUITE COMPLETE ===");
}

/**
 * Resets all test threads - use this to start fresh
 */
function resetAllTests() {
  Logger.log("--- Resetting All Test Threads ---");
  
  resetThreading(TEST_CONFIG.basicTestThreadId);
  resetThreading(TEST_CONFIG.groupTestThreadId);  
  resetThreading(TEST_CONFIG.folderTestThreadId);
  resetThreading(TEST_CONFIG.externalReplyTestThreadId);
  
  Logger.log("✅ All test threads reset - next tests will create new threads");
}

/**
 * Gets information about all test threads
 */
function getAllTestInfo() {
  Logger.log("=== ALL TEST THREAD INFORMATION ===");
  
  Logger.log("\nBasic Test Thread:");
  getThreadInfo(TEST_CONFIG.basicTestThreadId);
  
  Logger.log("\nGroup Test Thread:");
  getThreadInfo(TEST_CONFIG.groupTestThreadId);
  
  Logger.log("\nFolder Test Thread:");
  getThreadInfo(TEST_CONFIG.folderTestThreadId);
  
  Logger.log("\nExternal Reply Test Thread:");
  getThreadInfo(TEST_CONFIG.externalReplyTestThreadId);
  
  Logger.log("\n=== END TEST INFORMATION ===");
}

/**
 * Creates test email HTML content
 * 
 * @param {string} testType - Type of test being run
 * @param {string} description - Description of what this test does
 * @return {string} HTML body for test email
 */
function createTestEmailBody(testType, description) {
  const timestamp = new Date().toLocaleString();
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 2px solid #007bff; border-radius: 8px;">
      <h2 style="color: #007bff;">📧 Email Threading Test</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Test Type:</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${testType}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Framework Version:</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${TEST_CONFIG.scriptVersion}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Timestamp:</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${timestamp}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Method:</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Gmail Native Threading (lastMessage.reply)</td>
        </tr>
      </table>
      
      <div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
        <strong>Test Description:</strong><br>
        ${description}
      </div>
      
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        If multiple test emails appear in the same conversation, threading is working correctly! ✅
      </p>
    </div>
  `;
}

// =====================================================================
// VALIDATION FUNCTIONS
// =====================================================================

/**
 * Validates test configuration before running tests
 */
function validateTestSetup() {
  Logger.log("--- Test Setup Validation ---");
  
  // Check if test recipients are configured
  if (TEST_CONFIG.testRecipients.includes("test1@example.com")) {
    Logger.log("⚠️ WARNING: Using default test recipients. Update TEST_CONFIG.testRecipients with your actual test email addresses.");
  } else {
    Logger.log(`✅ Test recipients configured: ${TEST_CONFIG.testRecipients.join(', ')}`);
  }
  
  // Check user permissions
  try {
    const userEmail = Session.getActiveUser().getEmail();
    Logger.log(`✅ Script user: ${userEmail}`);
  } catch (error) {
    Logger.log(`❌ Cannot get user email: ${error.toString()}`);
  }
  
  // Check properties service access
  try {
    const properties = PropertiesService.getScriptProperties();
    Logger.log("✅ Properties service accessible");
  } catch (error) {
    Logger.log(`❌ Properties service error: ${error.toString()}`);
  }
  
  Logger.log("--- Validation Complete ---");
}