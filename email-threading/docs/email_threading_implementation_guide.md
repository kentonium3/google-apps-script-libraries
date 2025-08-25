# Email Threading Library - Implementation Guide

## Quick Start

### 1. Basic Implementation
```javascript
// 1. Include the core threading library functions in your script

// 2. Create configuration
const config = createThreadingConfig({
  threadIdProperty: 'myAppThreadId',
  emailSubject: 'My App Updates', 
  recipientEmail: 'recipient@example.com',
  scriptVersion: 'v1.0'
});

// 3. Send threaded email
const htmlBody = "<h2>My Update</h2><p>Content here...</p>";
const success = sendThreadedEmail(htmlBody, config);
```

### 2. For Google Groups
```javascript
const config = createThreadingConfig({
  threadIdProperty: 'groupAppThreadId',
  emailSubject: 'Group Updates',
  recipientEmail: 'mygroup@googlegroups.com', // Group address
  scriptVersion: 'v1.0'
});
```

### 3. For Multiple Recipients  
```javascript
const config = createThreadingConfig({
  threadIdProperty: 'multiAppThreadId', 
  emailSubject: 'Multi Updates',
  recipientEmail: ['user1@example.com', 'user2@example.com'],
  scriptVersion: 'v1.0'
});
```

## Configuration Options

### Required Parameters
- **`threadIdProperty`** - Unique key for storing thread ID in PropertiesService
- **`emailSubject`** - Subject line for emails (must be consistent for threading)  
- **`recipientEmail`** - Email address(es) - string for single, array for multiple

### Optional Parameters
- **`scriptVersion`** - Version string for logging and debugging

## Common Patterns

### Pattern 1: Daily Updates (Like Rise Tracker)
```javascript
function sendDailyUpdate() {
  // Get data from spreadsheet
  const data = getSpreadsheetData();
  
  // Create email content  
  const htmlBody = createEmailBody(data);
  
  // Configure threading
  const config = createThreadingConfig({
    threadIdProperty: 'dailyUpdateThreadId',
    emailSubject: 'Daily Progress Update',
    recipientEmail: 'team@company.com',
    scriptVersion: 'v2.0'
  });
  
  // Send with threading
  return sendThreadedEmail(htmlBody, config);
}
```

### Pattern 2: Form Submission Notifications
```javascript
function onFormSubmit(event) {
  // Process form data
  const formData = processFormSubmission(event);
  
  // Create notification email
  const htmlBody = createFormNotificationEmail(formData);
  
  // Configure threading  
  const config = createThreadingConfig({
    threadIdProperty: 'formNotificationThreadId',
    emailSubject: 'Form Submissions',
    recipientEmail: 'notifications@company.com',
    scriptVersion: 'v1.5'
  });
  
  // Send threaded notification
  sendThreadedEmail(htmlBody, config);
}
```

### Pattern 3: Multi-App Threading  
```javascript
// Different apps can have separate thread IDs
const THREAD_IDS = {
  riseTracker: 'riseTrackerThreadId',
  habitTracker: 'habitTrackerThreadId', 
  goalTracker: 'goalTrackerThreadId'
};

function sendRiseUpdate(htmlBody) {
  const config = createThreadingConfig({
    threadIdProperty: THREAD_IDS.riseTracker,
    emailSubject: '5:00a Rise Tracker',
    recipientEmail: 'rise-team@company.com',
    scriptVersion: 'v3.0'
  });
  return sendThreadedEmail(htmlBody, config);
}

function sendHabitUpdate(htmlBody) {
  const config = createThreadingConfig({
    threadIdProperty: THREAD_IDS.habitTracker,
    emailSubject: 'Habit Tracker Updates', 
    recipientEmail: 'habits@company.com',
    scriptVersion: 'v1.0'
  });
  return sendThreadedEmail(htmlBody, config);
}
```

## Error Handling Best Practices

### 1. Robust Error Handling
```javascript
function sendUpdateWithErrorHandling() {
  try {
    const data = getDataSafely();
    if (!data) {
      Logger.log("No data available, skipping update");
      return false;
    }
    
    const htmlBody = createEmailBody(data);
    const config = createThreadingConfig({
      threadIdProperty: 'myAppThreadId',
      emailSubject: 'Updates',
      recipientEmail: 'team@company.com'
    });
    
    const success = sendThreadedEmail(htmlBody, config);
    if (!success) {
      Logger.log("❌ Failed to send update email");
      // Could implement retry logic here
    }
    
    return success;
    
  } catch (error) {
    Logger.log(`❌ Critical error in sendUpdate: ${error.toString()}`);
    return false;
  }
}
```

### 2. Data Validation
```javascript
function validateEmailData(data) {
  if (!data || typeof data !== 'object') {
    Logger.log("❌ Invalid data object");
    return false;
  }
  
  if (!data.content || data.content.length === 0) {
    Logger.log("⚠️ No content to send");
    return false;
  }
  
  return true;
}
```

## Debugging and Maintenance

### 1. Thread Information
```javascript
// Check current thread status
getThreadInfo('myAppThreadId');

// Reset if needed
resetThreading('myAppThreadId');
```

### 2. Logging Best Practices
```javascript
function sendUpdateWithLogging() {
  Logger.log(`--- Starting Update (${new Date().toLocaleString()}) ---`);
  
  try {
    // Your implementation here
    Logger.log("✅ Update completed successfully");
  } catch (error) {
    Logger.log(`❌ Update failed: ${error.toString()}`);
    Logger.log(`Stack trace: ${error.stack}`);
  }
  
  Logger.log("--- Update Complete ---");
}
```

## Testing Your Implementation

### 1. Use the Test Framework
```javascript
// Update test configuration with your settings
const TEST_CONFIG = {
  testRecipients: ["your-test@email.com"],
  // ... other settings
};

// Run tests
testBasicThreading();
testGroupThreading(); // If using groups
```

### 2. Manual Testing Checklist
- [ ] First email creates new thread
- [ ] Second email replies to same thread  
- [ ] Emails appear in same conversation in Gmail
- [ ] Emails appear in same conversation in other clients (if applicable)
- [ ] Group emails go to group, not individuals
- [ ] Thread survives folder moves
- [ ] Thread handles external replies correctly

## Migration from Broken Threading

### If You Have Existing Broken Threading Code:

#### Before (Broken - Message-ID Extraction):
```javascript
// DON'T USE - This approach fails
const messages = thread.getMessages();
const lastMessageId = extractMessageIdFromRaw(messages[messages.length - 1]); // Returns null
const references = messages.map(msg => extractMessageIdFromRaw(msg)).join(" "); // Empty

GmailApp.sendEmail(recipient, subject, "", {
  htmlBody: htmlBody,
  inReplyTo: lastMessageId,    // null - ignored by Gmail
  references: references       // empty - ignored by Gmail  
});
```

#### After (Working - Native Threading):
```javascript
// USE THIS - Works reliably
const config = createThreadingConfig({
  threadIdProperty: 'yourThreadId',
  emailSubject: 'Your Subject', 
  recipientEmail: 'recipient@example.com'
});

sendThreadedEmail(htmlBody, config); // Handles everything automatically
```

### Migration Steps:
1. **Replace** Message-ID extraction code with `sendThreadedEmail()` calls
2. **Update** configuration to use `createThreadingConfig()` 
3. **Test** with the test framework
4. **Reset** existing thread IDs if needed with `resetThreading()`

## Advanced Scenarios

### 1. Conditional Threading
```javascript
function sendConditionalUpdate(data, forceNewThread = false) {
  const threadIdProperty = forceNewThread ? 
    `tempThreadId_${Date.now()}` : 'mainThreadId';
    
  const config = createThreadingConfig({
    threadIdProperty: threadIdProperty,
    emailSubject: 'Conditional Updates',
    recipientEmail: 'team@company.com'
  });
  
  return sendThreadedEmail(createEmailBody(data), config);
}
```

### 2. Multi-Environment Support
```javascript
const ENV_CONFIG = {
  development: {
    recipientEmail: 'dev-team@company.com',
    threadIdProperty: 'devThreadId'
  },
  production: {
    recipientEmail: 'prod-team@company.com', 
    threadIdProperty: 'prodThreadId'
  }
};

function sendEnvironmentUpdate(environment, htmlBody) {
  const envConfig = ENV_CONFIG[environment];
  const config = createThreadingConfig({
    threadIdProperty: envConfig.threadIdProperty,
    emailSubject: `${environment.toUpperCase()} Updates`,
    recipientEmail: envConfig.recipientEmail
  });
  
  return sendThreadedEmail(htmlBody, config);
}
```

## Troubleshooting Common Issues

### Issue 1: Emails Not Threading
**Symptoms:** Each email appears as separate conversation
**Causes:**
- Different subject lines
- Thread ID not being stored/retrieved
- Recipients changed between emails
**Solution:** Verify configuration consistency, check logs

### Issue 2: Group Emails Going to Individuals  
**Symptoms:** Replies go to last sender instead of group
**Cause:** Not forcing group delivery in reply options
**Solution:** Library automatically handles this for group addresses

### Issue 3: Thread Not Found
**Symptoms:** "Thread not found" errors, creates new thread each time
**Causes:**
- Thread was deleted
- Thread was moved to trash
- Thread ID corruption
**Solution:** Use `getThreadInfo()` to debug, `resetThreading()` if needed

### Issue 4: Permission Errors
**Symptoms:** Cannot read/write properties, cannot send emails
**Cause:** Insufficient script permissions
**Solution:** Reauthorize script, check Gmail API access

## Performance Considerations

### 1. Minimize API Calls
- Store thread IDs efficiently
- Use batch operations when possible
- Implement caching for frequently accessed data

### 2. Error Recovery
- Implement exponential backoff for retries
- Graceful degradation when threading fails
- Logging for post-mortem analysis

## Security Best Practices

### 1. Email Content Validation
```javascript
function sanitizeEmailContent(htmlContent) {
  // Remove potentially dangerous content
  // Validate HTML structure
  // Escape user inputs
  return cleanContent;
}
```

### 2. Recipient Validation
```javascript
function validateRecipients(recipients) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return Array.isArray(recipients) ? 
    recipients.every(email => emailRegex.test(email)) :
    emailRegex.test(recipients);
}
```