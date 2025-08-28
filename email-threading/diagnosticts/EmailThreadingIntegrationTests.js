/**
 * @fileoverview Email Threading Integration Test Framework
 * @version 2.0.0
 * 
 * Advanced integration and scenario tests for email threading.
 * These tests cover complex real-world scenarios that require manual interaction
 * or specific conditions that cannot be easily automated.
 * 
 * Works with EmailThreadingLibrary v2.0.0
 */

// =====================================================================
// TEST CONFIGURATION
// =====================================================================
const INTEGRATION_TEST_CONFIG = {
  // Test recipients (update these to your test email addresses)
  testRecipients: ["test1@example.com", "test2@example.com"],
  testGroup: "testgroup@googlegroups.com", // Update to your test group
  
  // Test subjects for different scenarios
  folderTestSubject: "Integration Test - Folder Movement",
  externalReplySubject: "Integration Test - External Reply", 
  groupReplySubject: "Integration Test - Group Reply Patterns",
  
  // Property keys for different tests
  folderTestThreadId: 'integration_folderTestThreadId',
  externalReplyTestThreadId: 'integration_externalReplyTestThreadId',
  groupPatternTestThreadId: 'integration_groupPatternTestThreadId',
  
  // Script version
  scriptVersion: "v2.0.0-INTEGRATION"
};

// =====================================================================
// ADVANCED SCENARIO TESTS
// =====================================================================

/**
 * Test 1: Folder Movement Test
 * Tests if threading works when emails are moved to folders/labels
 * This is a multi-step test requiring manual intervention
 */
function testFolderMovementScenario() {
  Logger.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  Logger.log(`FOLDER MOVEMENT SCENARIO TEST`);
  Logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  const manager = new EmailThreadingManager({
    threadIdProperty: INTEGRATION_TEST_CONFIG.folderTestThreadId,
    emailSubject: INTEGRATION_TEST_CONFIG.folderTestSubject,
    recipientEmail: INTEGRATION_TEST_CONFIG.testRecipients[0],
    enableLogging: true
  });
  
  // Check if this is step 1 or step 2
  const threadInfo = manager.getThreadInfo();
  
  if (!threadInfo.currentThreadId) {
    // STEP 1: Create initial thread
    Logger.log("STEP 1: Creating initial thread for folder test...");
    
    const htmlBody = createIntegrationTestEmail(
      "Folder Movement Test - Step 1",
      "This email tests folder movement behavior.",
      "After this email is sent, move this thread to a folder/label in Gmail, then run this test again.",
      { step: 1, totalSteps: 2 }
    );
    
    const success = manager.sendThreadedEmail(htmlBody);
    
    if (success) {
      Logger.log("✅ Step 1 complete!");
      Logger.log("\n📋 NEXT STEPS:");
      Logger.log("1. Go to Gmail");
      Logger.log("2. Find this email thread");
      Logger.log("3. Move it to a folder or apply a label");
      Logger.log("4. Run testFolderMovementScenario() again");
    } else {
      Logger.log("❌ Failed to create initial thread");
    }
    
  } else {
    // STEP 2: Test replying to moved thread
    Logger.log("STEP 2: Testing reply to thread that may be in a folder...");
    
    // First, let's check if we can find the thread
    try {
      const thread = GmailApp.getThreadById(threadInfo.currentThreadId);
      if (thread) {
        const labels = thread.getLabels();
        Logger.log(`Thread found with ${labels.length} labels: ${labels.map(l => l.getName()).join(', ')}`);
      }
    } catch (error) {
      Logger.log(`Note: ${error.toString()}`);
    }
    
    const htmlBody = createIntegrationTestEmail(
      "Folder Movement Test - Step 2",
      "Testing reply to thread that was moved to a folder.",
      "This reply should maintain threading even if the original is not in inbox.",
      { step: 2, totalSteps: 2 }
    );
    
    const success = manager.sendThreadedEmail(htmlBody);
    
    if (success) {
      Logger.log("✅ Folder movement test COMPLETE!");
      Logger.log("Check Gmail to verify the thread maintained continuity despite folder movement.");
    } else {
      Logger.log("❌ Failed to reply to moved thread");
    }
  }
}

/**
 * Test 2: External Reply Handling Test
 * Tests behavior when external parties reply to the thread
 * Requires manual email replies from test recipients
 */
function testExternalReplyScenario() {
  Logger.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  Logger.log(`EXTERNAL REPLY SCENARIO TEST`);
  Logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  const manager = new EmailThreadingManager({
    threadIdProperty: INTEGRATION_TEST_CONFIG.externalReplyTestThreadId,
    emailSubject: INTEGRATION_TEST_CONFIG.externalReplySubject,
    recipientEmail: INTEGRATION_TEST_CONFIG.testRecipients.join(','),
    enableLogging: true
  });
  
  const threadInfo = manager.getThreadInfo();
  
  if (!threadInfo.currentThreadId) {
    // STEP 1: Create initial thread
    Logger.log("STEP 1: Creating initial thread for external reply test...");
    
    const htmlBody = createIntegrationTestEmail(
      "External Reply Test - Initial",
      "This tests how the system handles external replies.",
      "Reply to this email from one of the test recipient addresses, then run this test again.",
      { 
        step: 1, 
        totalSteps: 3,
        recipients: INTEGRATION_TEST_CONFIG.testRecipients 
      }
    );
    
    const success = manager.sendThreadedEmail(htmlBody);
    
    if (success) {
      Logger.log("✅ Initial email sent!");
      Logger.log("\n📋 NEXT STEPS:");
      Logger.log("1. Check the test recipient inbox");
      Logger.log("2. Reply to this email from that account");
      Logger.log("3. Wait for the reply to arrive");
      Logger.log("4. Run testExternalReplyScenario() again");
    }
    
  } else {
    // STEP 2+: Analyze and respond
    Logger.log("Analyzing thread with potential external replies...");
    
    analyzeThreadParticipants(threadInfo.currentThreadId);
    
    const htmlBody = createIntegrationTestEmail(
      "External Reply Test - Automated Response",
      "This is an automated response after external replies.",
      "With v2.0.0, this should go to ALL configured recipients, not just the last replier.",
      { 
        step: "2+",
        feature: "Group recipient enforcement"
      }
    );
    
    const success = manager.sendThreadedEmail(htmlBody);
    
    if (success) {
      Logger.log("✅ Response sent after external replies!");
      Logger.log("Verify that ALL test recipients received this email, not just the last replier.");
    }
  }
}

/**
 * Test 3: Group Reply Pattern Test
 * Tests various reply patterns with groups
 */
function testGroupReplyPatterns() {
  Logger.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  Logger.log(`GROUP REPLY PATTERNS TEST`);
  Logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  if (INTEGRATION_TEST_CONFIG.testGroup === "testgroup@googlegroups.com") {
    Logger.log("⚠️ WARNING: Using default test group. Update INTEGRATION_TEST_CONFIG.testGroup");
    Logger.log("Skipping test...");
    return;
  }
  
  const manager = new EmailThreadingManager({
    threadIdProperty: INTEGRATION_TEST_CONFIG.groupPatternTestThreadId,
    emailSubject: INTEGRATION_TEST_CONFIG.groupReplySubject,
    recipientEmail: INTEGRATION_TEST_CONFIG.testGroup,
    enableLogging: true
  });
  
  const threadInfo = manager.getThreadInfo();
  const runNumber = threadInfo.currentThreadId ? 
    (threadInfo.threadDetails ? threadInfo.threadDetails.messageCount + 1 : 2) : 1;
  
  const htmlBody = createIntegrationTestEmail(
    `Group Pattern Test - Email #${runNumber}`,
    "Testing group email threading patterns.",
    "This email should always go to the entire group, regardless of individual replies.",
    { 
      runNumber: runNumber,
      groupEmail: INTEGRATION_TEST_CONFIG.testGroup,
      criticalFix: "v2.0.0 ensures group delivery"
    }
  );
  
  const success = manager.sendThreadedEmail(htmlBody);
  
  if (success) {
    Logger.log(`✅ Group email #${runNumber} sent!`);
    Logger.log("\n📋 TEST INSTRUCTIONS:");
    Logger.log("1. Have someone reply only to you (not Reply All)");
    Logger.log("2. Run this test again");
    Logger.log("3. Verify the next email goes to the whole group");
  }
}

// =====================================================================
// ANALYSIS UTILITIES
// =====================================================================

/**
 * Analyzes thread participants and reply patterns
 * @param {string} threadId - Thread ID to analyze
 */
function analyzeThreadParticipants(threadId) {
  try {
    const thread = GmailApp.getThreadById(threadId);
    if (!thread) {
      Logger.log("Thread not found for analysis");
      return;
    }
    
    const messages = thread.getMessages();
    const myEmail = Session.getActiveUser().getEmail();
    
    Logger.log(`\n📊 Thread Analysis:`);
    Logger.log(`Total messages: ${messages.length}`);
    
    const participants = new Map();
    const replyPatterns = [];
    
    messages.forEach((message, index) => {
      const from = message.getFrom();
      const to = message.getTo();
      const cc = message.getCc();
      const date = message.getDate();
      const isFromMe = from.toLowerCase().includes(myEmail.toLowerCase());
      
      // Track participants
      const fromEmail = extractEmail(from);
      if (fromEmail) {
        participants.set(fromEmail, (participants.get(fromEmail) || 0) + 1);
      }
      
      // Log reply pattern
      replyPatterns.push({
        index: index + 1,
        from: fromEmail,
        to: to,
        cc: cc,
        isFromMe: isFromMe,
        date: date
      });
    });
    
    // Report participants
    Logger.log(`\n👥 Participants (${participants.size} unique):`);
    participants.forEach((count, email) => {
      const isMe = email.toLowerCase() === myEmail.toLowerCase();
      Logger.log(`  ${email}: ${count} message(s) ${isMe ? '(me)' : '(external)'}`);
    });
    
    // Report reply patterns
    Logger.log(`\n📧 Reply Pattern:`);
    replyPatterns.forEach(pattern => {
      Logger.log(`  Message ${pattern.index}: ${pattern.isFromMe ? '→ OUT' : '← IN'} ` +
                `From: ${pattern.from || 'unknown'}`);
      if (!pattern.isFromMe && pattern.to) {
        Logger.log(`    To: ${pattern.to}`);
      }
    });
    
    // Check for reply-to-sender pattern
    const lastExternal = replyPatterns.filter(p => !p.isFromMe).pop();
    if (lastExternal) {
      Logger.log(`\n⚠️ Last external reply:`);
      Logger.log(`  From: ${lastExternal.from}`);
      Logger.log(`  To: ${lastExternal.to}`);
      
      if (lastExternal.to && !lastExternal.to.includes('@googlegroups.com')) {
        Logger.log(`  📌 NOTE: Last external reply was to individual, not group`);
        Logger.log(`  With v2.0.0, next automated email will still go to configured recipients`);
      }
    }
    
  } catch (error) {
    Logger.log(`Error analyzing thread: ${error.toString()}`);
  }
}

/**
 * Extracts email address from a full email string
 * @param {string} emailString - Full email string like "Name <email@example.com>"
 * @return {string|null} Extracted email or null
 */
function extractEmail(emailString) {
  if (!emailString) return null;
  
  const match = emailString.match(/<([^>]+)>/);
  if (match) {
    return match[1].toLowerCase();
  }
  
  // If no angle brackets, assume the whole string is the email
  return emailString.toLowerCase().trim();
}

// =====================================================================
// INTEGRATION TEST UTILITIES
// =====================================================================

/**
 * Creates HTML email for integration tests
 * @param {string} testName - Name of the test
 * @param {string} purpose - Purpose of this test
 * @param {string} expectation - What should happen
 * @param {Object} metadata - Additional test metadata
 * @return {string} HTML email body
 */
function createIntegrationTestEmail(testName, purpose, expectation, metadata = {}) {
  const timestamp = new Date().toLocaleString();
  
  let metadataHtml = '';
  if (Object.keys(metadata).length > 0) {
    metadataHtml = '<h3>Test Metadata:</h3><ul>';
    Object.entries(metadata).forEach(([key, value]) => {
      metadataHtml += `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`;
    });
    metadataHtml += '</ul>';
  }
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">🧪 Email Threading Integration Test</h1>
        <p style="margin: 5px 0; opacity: 0.9;">${testName}</p>
      </div>
      
      <div style="border: 2px solid #667eea; border-top: none; padding: 20px; 
                  border-radius: 0 0 8px 8px;">
        
        <div style="background-color: #f0f4ff; padding: 15px; border-radius: 6px; 
                    margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #667eea;">📋 Test Purpose:</h3>
          <p style="margin: 0;">${purpose}</p>
        </div>
        
        <div style="background-color: #fff9e6; padding: 15px; border-radius: 6px; 
                    margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #f59e0b;">🎯 Expected Result:</h3>
          <p style="margin: 0;">${expectation}</p>
        </div>
        
        ${metadataHtml}
        
        <div style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; 
                    margin-top: 15px;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            <strong>Framework:</strong> Email Threading Library v2.0.0<br>
            <strong>Test Suite:</strong> ${INTEGRATION_TEST_CONFIG.scriptVersion}<br>
            <strong>Timestamp:</strong> ${timestamp}<br>
            <strong>Threading Method:</strong> sendEmail() with manual headers (fixes group delivery)
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Runs all integration tests (note: these require manual steps)
 */
function runAllIntegrationTests() {
  Logger.log('\n╔════════════════════════════════════════════════════════╗');
  Logger.log('║   EMAIL THREADING INTEGRATION TEST SUITE              ║');
  Logger.log('║   Version 2.0.0                                       ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  
  Logger.log('\n⚠️  NOTE: These tests require manual intervention!');
  Logger.log('Run each test individually and follow the instructions.\n');
  
  validateIntegrationTestSetup();
  
  Logger.log('\nAvailable tests:');
  Logger.log('1. testFolderMovementScenario() - Tests threading with folder/label movement');
  Logger.log('2. testExternalReplyScenario() - Tests threading with external replies');
  Logger.log('3. testGroupReplyPatterns() - Tests group email patterns');
  Logger.log('\nRun each test function individually as they require manual steps.');
}

/**
 * Resets all integration test threads
 */
function resetAllIntegrationTests() {
  Logger.log("Resetting all integration test threads...");
  
  const testThreadIds = [
    INTEGRATION_TEST_CONFIG.folderTestThreadId,
    INTEGRATION_TEST_CONFIG.externalReplyTestThreadId,
    INTEGRATION_TEST_CONFIG.groupPatternTestThreadId
  ];
  
  testThreadIds.forEach(threadId => {
    const manager = new EmailThreadingManager({
      threadIdProperty: threadId,
      recipientEmail: 'dummy@example.com',
      emailSubject: 'Dummy'
    });
    manager.resetThreading();
    Logger.log(`  Reset: ${threadId}`);
  });
  
  Logger.log("✅ All integration test threads reset");
}

/**
 * Validates integration test setup
 */
function validateIntegrationTestSetup() {
  Logger.log("Validating Integration Test Setup...");
  
  // Check test recipients
  if (INTEGRATION_TEST_CONFIG.testRecipients.includes("test1@example.com")) {
    Logger.log("⚠️ WARNING: Update testRecipients in INTEGRATION_TEST_CONFIG");
  } else {
    Logger.log(`✅ Test recipients: ${INTEGRATION_TEST_CONFIG.testRecipients.join(', ')}`);
  }
  
  // Check test group
  if (INTEGRATION_TEST_CONFIG.testGroup === "testgroup@googlegroups.com") {
    Logger.log("⚠️ WARNING: Update testGroup in INTEGRATION_TEST_CONFIG");
  } else {
    Logger.log(`✅ Test group: ${INTEGRATION_TEST_CONFIG.testGroup}`);
  }
  
  // Check email quota
  try {
    const quota = MailApp.getRemainingDailyQuota();
    if (quota < 20) {
      Logger.log(`⚠️ Low email quota: ${quota} remaining`);
    } else {
      Logger.log(`✅ Email quota: ${quota} remaining`);
    }
  } catch (error) {
    Logger.log(`Note: ${error.toString()}`);
  }
}

/**
 * Gets detailed information about all integration test threads
 */
function getIntegrationTestInfo() {
  Logger.log('\n═══════════════════════════════════════════════════════');
  Logger.log('INTEGRATION TEST THREAD INFORMATION');
  Logger.log('═══════════════════════════════════════════════════════');
  
  const tests = [
    { name: "Folder Movement Test", id: INTEGRATION_TEST_CONFIG.folderTestThreadId },
    { name: "External Reply Test", id: INTEGRATION_TEST_CONFIG.externalReplyTestThreadId },
    { name: "Group Pattern Test", id: INTEGRATION_TEST_CONFIG.groupPatternTestThreadId }
  ];
  
  tests.forEach(test => {
    Logger.log(`\n${test.name}:`);
    Logger.log('-------------------');
    
    const manager = new EmailThreadingManager({
      threadIdProperty: test.id,
      recipientEmail: 'dummy@example.com',
      emailSubject: 'Dummy'
    });
    
    const info = manager.getThreadInfo();
    
    if (info.currentThreadId) {
      Logger.log(`Thread ID: ${info.currentThreadId}`);
      if (info.threadDetails) {
        Logger.log(`Subject: ${info.threadDetails.subject}`);
        Logger.log(`Messages: ${info.threadDetails.messageCount}`);
        Logger.log(`First: ${info.threadDetails.firstMessageDate}`);
        Logger.log(`Last: ${info.threadDetails.lastMessageDate}`);
        if (info.threadDetails.labels && info.threadDetails.labels.length > 0) {
          Logger.log(`Labels: ${info.threadDetails.labels.join(', ')}`);
        }
      }
    } else {
      Logger.log('No thread created yet');
    }
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════');
}