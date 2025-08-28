# Email Threading Library for Google Apps Script

## Version 2.0.0

A robust email threading management library that maintains proper group distribution and prevents reply hijacking in automated email systems.

## 🎯 Key Features

- **Maintains email threads** across conversations
- **Forces emails to group addresses** - prevents individual replies from hijacking automated responses
- **Handles thread ID persistence** and validation
- **Comprehensive error handling** and logging
- **Modular design** for reuse across projects
- **Built-in testing and debugging tools**

## 🐛 The Problem This Solves

When using Gmail's native `reply()` method in Google Apps Script, if someone replies only to the sender (not Reply All), subsequent automated replies will only go to that individual, not the entire group. This library fixes that critical issue by using `sendEmail()` with proper threading headers, ensuring emails always go to the configured recipient (group or individual).

## 📦 Installation

1. Copy the three library files to your Google Apps Script project:
   - `EmailThreadingLibrary.js` - Core threading functions
   - `EmailThreadingExample.js` - Usage examples
   - `EmailThreadingUtilities.js` - Testing and debugging tools

2. In your script, create an instance of the EmailThreadingManager with your configuration.

## 🚀 Quick Start

### Basic Usage

```javascript
// Configure the threading manager
const config = {
  threadIdProperty: 'myAppThreadId',     // Unique property name for storing thread ID
  recipientEmail: 'team@googlegroups.com', // Group or individual email
  emailSubject: 'Daily Report',            // Subject for new threads
  enableLogging: true                      // Enable detailed logging
};

// Create manager instance
const threadingManager = new EmailThreadingManager(config);

// Send a threaded email
const htmlBody = '<h2>Daily Report</h2><p>Your content here...</p>';
const success = threadingManager.sendThreadedEmail(htmlBody);

if (success) {
  Logger.log('Email sent successfully!');
}
```

### Form Submission Handler

```javascript
function onFormSubmit(e) {
  const config = {
    threadIdProperty: 'formResponseThreadId',
    recipientEmail: 'support@example.com',
    emailSubject: 'New Form Submission'
  };
  
  const manager = new EmailThreadingManager(config);
  
  const htmlBody = `
    <h2>New Form Submission</h2>
    <p>Response: ${e.values.join(', ')}</p>
  `;
  
  manager.sendThreadedEmail(htmlBody);
}
```

### Spreadsheet Tracker (like the 5:00am Rise Tracker)

```javascript
// Using the SpreadsheetTracker class from examples
const tracker = new SpreadsheetTracker({
  dataSheetName: 'Daily Tracker',
  formSheetName: 'Form Responses 1',
  dataRangeToCopy: 'A1:D33',
  commentColumnIndex: 3,
  recipientEmail: 'accountability@googlegroups.com',
  emailSubject: '5:00am Rise Tracking Update'
});

// Send update (triggered by form submission or time trigger)
tracker.sendUpdate();
```

## 📚 API Reference

### EmailThreadingManager Class

#### Constructor
```javascript
new EmailThreadingManager(config)
```

**Config Options:**
- `threadIdProperty` (string): Property name for storing thread ID
- `recipientEmail` (string): Email address (individual or group)
- `emailSubject` (string): Subject line for new threads
- `enableLogging` (boolean): Enable detailed logging (default: true)
- `scriptVersion` (string): Version for tracking (default: '2.0.0')

#### Methods

##### sendThreadedEmail(htmlBody, options)
Send an email that maintains threading.

**Parameters:**
- `htmlBody` (string): HTML content of the email
- `options` (object): Optional parameters
  - `plainBody` (string): Plain text version
  - `attachments` (array): File attachments
  - `cc` (string): CC recipients
  - `bcc` (string): BCC recipients

**Returns:** boolean - Success status

##### resetThreading()
Clear the stored thread ID to start a new thread.

##### getThreadInfo()
Get information about the current thread.

**Returns:** Object with thread details

## 🔧 Utilities and Testing

### Run Diagnostics
```javascript
runEmailThreadingDiagnostics();
```

Checks:
- Environment configuration
- Stored thread IDs
- Email permissions
- Active threads
- Recent email patterns

### Run Test Suite
```javascript
runEmailThreadingTests();
```

Tests:
- Thread creation
- Thread replies
- Group recipient enforcement
- Thread reset functionality
- Error handling
- Header extraction

### Quick Thread Check
```javascript
quickThreadCheck();
```

### Clean Up Test Data
```javascript
cleanupTestThreads();
```

## 🔄 Migration from Old Code

If you're using the old `reply()` method approach:

### Old (Problematic) Approach:
```javascript
// This doesn't work - 'to' parameter is ignored!
lastMessage.reply("", {
  htmlBody: htmlBody,
  to: CONFIG.recipientEmail  // This is ignored!
});
```

### New (Fixed) Approach:
```javascript
// Use the EmailThreadingManager instead
const manager = new EmailThreadingManager({
  threadIdProperty: 'yourThreadId',
  recipientEmail: 'group@googlegroups.com',
  emailSubject: 'Your Subject'
});

manager.sendThreadedEmail(htmlBody);
```

## 📊 How It Works

1. **First Email**: Creates a new thread using `createDraft().send()` to reliably get the thread ID
2. **Subsequent Emails**: 
   - Retrieves the stored thread ID
   - Extracts Message-ID from the first message
   - Uses `sendEmail()` with `In-Reply-To` and `References` headers
   - **Always sends to the configured recipient**, not the last replier

## 🐞 Debugging

### Enable Logging
```javascript
const config = {
  // ... your config
  enableLogging: true
};
```

### View Thread Information
```javascript
const manager = new EmailThreadingManager(config);
const info = manager.getThreadInfo();
Logger.log(JSON.stringify(info, null, 2));
```

### Monitor Threading Over Time
```javascript
// Call periodically to track behavior
monitorThreading();

// View history
getMonitoringHistory();
```

## ⚠️ Important Notes

1. **Gmail Quota**: Be aware of your daily email quota
2. **Testing**: Use test email addresses during development
3. **Group Permissions**: Ensure the script user has permission to send to groups
4. **Thread Lifetime**: Gmail threads may be split after ~100 messages

## 📝 Changelog

### v2.0.0 (Current)
- **CRITICAL FIX**: Replaced `reply()` method with `sendEmail()` + threading headers
- Ensures emails always go to configured recipient (prevents reply hijacking)
- Added comprehensive testing suite
- Improved error handling and logging

### v1.x.x
- Initial implementation using `reply()` method
- Had issues with individual replies hijacking group emails

## 🤝 Contributing

When improving this library:
1. Maintain backward compatibility
2. Add tests for new features
3. Update documentation
4. Increment version number

## 📄 License

This library is provided as-is for use in Google Apps Script projects.

## 💡 Tips

1. **Start Fresh**: Use `resetThreading()` when you want to start a new conversation thread
2. **Multiple Threads**: Use different `threadIdProperty` values for different email streams
3. **Error Recovery**: The library automatically creates new threads if reply fails
4. **Group Emails**: Always test with actual Google Groups to verify behavior

## 🆘 Troubleshooting

### Emails not threading properly
1. Run diagnostics: `runEmailThreadingDiagnostics()`
2. Check if thread ID is valid
3. Verify email permissions

### Emails going to individuals instead of group
- Ensure you're using v2.0.0 or later
- Verify `recipientEmail` is set to group address
- Check logs to confirm "recipient enforced" message

### Thread ID not found
- Normal after ~30 days (Gmail may archive)
- Library will automatically create new thread

## 📞 Support

For issues or questions about this library, check the logs first using the diagnostic tools, then review the examples for proper implementation patterns.