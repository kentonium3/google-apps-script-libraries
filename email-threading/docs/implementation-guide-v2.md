# Email Threading Library v2.0 - Implementation Guide

## ⚠️ Critical Update from v1.x

**The v1.x implementation had a critical flaw**: The `reply()` method ignores the `to` parameter, causing group emails to be hijacked by individual replies. **Version 2.0 fixes this** by using `sendEmail()` with manual threading headers.

## Quick Start with v2.0

### 1. Basic Implementation
```javascript
// Import the EmailThreadingLibrary.js file into your project

// Create a threading manager instance
const threadingManager = new EmailThreadingManager({
  threadIdProperty: 'myAppThreadId',
  recipientEmail: 'recipient@example.com',
  emailSubject: 'My App Updates',
  enableLogging: true
});

// Send a threaded email
const htmlBody = '<h2>Update</h2><p>Your content here...</p>';
const success = threadingManager.sendThreadedEmail(htmlBody);

if (success) {
  Logger.log('Email sent successfully!');
}
```

### 2. For Google Groups (Critical Fix in v2.0)
```javascript
// v2.0 ensures ALL group members receive emails
// even after individual replies
const threadingManager = new EmailThreadingManager({
  threadIdProperty: 'groupThreadId',
  recipientEmail: 'mygroup@googlegroups.com',
  emailSubject: 'Group Updates',
  enableLogging: true
});

// This will ALWAYS go to the entire group
threadingManager.sendThreadedEmail(htmlBody);
```

### 3. For Multiple Recipients
```javascript
// Comma-separated list of recipients
const threadingManager = new EmailThreadingManager({
  threadIdProperty: 'multiThreadId',
  recipientEmail: 'user1@example.com, user2@example.com',
  emailSubject: 'Team Updates'
});

threadingManager.sendThreadedEmail(htmlBody);
```

## Migration from v1.x to v2.0

### ❌ Old v1.x Approach (BROKEN for groups)
```javascript
// DON'T USE - This approach fails for groups
function sendThreadedEmail(htmlBody, config) {
  const lastMessage = messages[messages.length - 1];
  lastMessage.reply("", { 
    htmlBody: htmlBody,
    to: config.recipientEmail  // THIS IS IGNORED!
  });
}
```

### ✅ New v2.0 Approach (WORKS for all recipients)
```javascript
// USE THIS - Works for groups and individuals
const manager = new EmailThreadingManager({
  threadIdProperty: 'yourThreadId',
  recipientEmail: 'group@googlegroups.com',
  emailSubject: 'Your Subject'
});

manager.sendThreadedEmail(htmlBody);
```

### Migration Steps

1. **Replace function calls:**
   ```javascript
   // Old
   sendThreadedEmail(html, config);
   
   // New
   const manager = new EmailThreadingManager(config);
   manager.sendThreadedEmail(html);
   ```

2. **Update configuration:**
   ```javascript
   // Old
   const config = createThreadingConfig({...});
   
   // New - directly pass to constructor
   const manager = new EmailThreadingManager({
     threadIdProperty: 'threadId',
     recipientEmail: 'email@example.com',
     emailSubject: 'Subject'
   });
   ```

3. **Test group scenarios** to ensure proper delivery

## Configuration Options

### Required Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `threadIdProperty` | string | Unique key for storing thread ID |
| `recipientEmail` | string | Email address (individual or group) |
| `emailSubject` | string | Subject line for emails |

### Optional Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableLogging` | boolean | true | Enable detailed logging |
| `scriptVersion` | string | '2.0.0' | Version for tracking |

## Common Implementation Patterns

### Pattern 1: Daily Automated Reports
```javascript
class DailyReportSender {
  constructor() {
    this.threadingManager = new EmailThreadingManager({
      threadIdProperty: 'dailyReportThreadId',
      recipientEmail: 'team@company.com',
      emailSubject: 'Daily Report',
      enableLogging: true
    });
  }
  
  sendDailyReport() {
    const data = this.collectReportData();
    const htmlBody = this.formatReportHtml(data);
    
    const success = this.threadingManager.sendThreadedEmail(htmlBody);
    
    if (!success) {
      // Handle failure - maybe retry or alert
      console.error('Failed to send daily report');
    }
    
    return success;
  }
  
  collectReportData() {
    // Your data collection logic
    return { /* ... */ };
  }
  
  formatReportHtml(data) {
    return `
      <div style="font-family: Arial, sans-serif;">
        <h2>Daily Report - ${new Date().toLocaleDateString()}</h2>
        <p>Report content here...</p>
      </div>
    `;
  }
}

// Usage
const reporter = new DailyReportSender();
reporter.sendDailyReport();
```

### Pattern 2: Form Submission Handler
```javascript
function onFormSubmit(e) {
  // Create manager instance for form notifications
  const manager = new EmailThreadingManager({
    threadIdProperty: 'formSubmissionsThreadId',
    recipientEmail: 'support@company.com',
    emailSubject: 'Form Submissions'
  });
  
  // Format the form data
  const htmlBody = `
    <div>
      <h3>New Form Submission</h3>
      <p><strong>Timestamp:</strong> ${e.timestamp}</p>
      <p><strong>Response:</strong> ${e.values.join(', ')}</p>
    </div>
  `;
  
  // Send notification with threading
  manager.sendThreadedEmail(htmlBody);
}
```

### Pattern 3: Multi-Stream Threading
```javascript
// Different email streams with separate threads
class MultiStreamEmailer {
  constructor() {
    this.streams = {
      alerts: new EmailThreadingManager({
        threadIdProperty: 'alertsThreadId',
        recipientEmail: 'alerts@company.com',
        emailSubject: 'System Alerts'
      }),
      
      reports: new EmailThreadingManager({
        threadIdProperty: 'reportsThreadId',
        recipientEmail: 'reports@company.com',
        emailSubject: 'Weekly Reports'
      }),
      
      updates: new EmailThreadingManager({
        threadIdProperty: 'updatesThreadId',
        recipientEmail: 'updates@company.com',
        emailSubject: 'Product Updates'
      })
    };
  }
  
  sendAlert(message) {
    const html = `<div class="alert">${message}</div>`;
    return this.streams.alerts.sendThreadedEmail(html);
  }
  
  sendReport(reportData) {
    const html = this.formatReport(reportData);
    return this.streams.reports.sendThreadedEmail(html);
  }
  
  sendUpdate(updateInfo) {
    const html = this.formatUpdate(updateInfo);
    return this.streams.updates.sendThreadedEmail(html);
  }
}
```

### Pattern 4: Spreadsheet Integration (Like Rise Tracker)
```javascript
class SpreadsheetEmailer {
  constructor(config) {
    this.config = {
      sheetName: config.sheetName,
      dataRange: config.dataRange,
      commentColumn: config.commentColumn
    };
    
    this.threadingManager = new EmailThreadingManager({
      threadIdProperty: config.threadIdProperty || 'spreadsheetThreadId',
      recipientEmail: config.recipientEmail,
      emailSubject: config.emailSubject
    });
  }
  
  sendUpdate() {
    try {
      // Get spreadsheet data
      const sheet = SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(this.config.sheetName);
      const data = sheet.getRange(this.config.dataRange).getValues();
      
      // Get latest comment
      const lastRow = sheet.getLastRow();
      const comment = sheet.getRange(lastRow, this.config.commentColumn).getValue();
      
      // Create email
      const htmlBody = this.createEmailHtml(data, comment);
      
      // Send with threading
      return this.threadingManager.sendThreadedEmail(htmlBody);
      
    } catch (error) {
      Logger.log(`Error: ${error.toString()}`);
      return false;
    }
  }
  
  createEmailHtml(data, comment) {
    let html = `
      <div>
        <p><strong>Comment:</strong> ${comment}</p>
        <table border="1" cellpadding="5">
    `;
    
    data.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</table></div>';
    return html;
  }
}
```

## Advanced Usage

### Adding Attachments
```javascript
const options = {
  attachments: [
    DriveApp.getFileById('fileId').getBlob()
  ],
  cc: 'cc@example.com',
  bcc: 'bcc@example.com'
};

manager.sendThreadedEmail(htmlBody, options);
```

### Thread Management
```javascript
// Get thread information
const info = manager.getThreadInfo();
console.log(info);
// {
//   currentThreadId: '...',
//   threadDetails: {
//     subject: '...',
//     messageCount: 5,
//     firstMessageDate: Date,
//     lastMessageDate: Date
//   }
// }

// Reset threading (start new thread)
manager.resetThreading();

// Check if thread exists
if (info.currentThreadId) {
  console.log('Thread exists');
} else {
  console.log('No thread yet');
}
```

## Error Handling Best Practices

### Comprehensive Error Handling
```javascript
class RobustEmailSender {
  constructor(config) {
    this.manager = new EmailThreadingManager(config);
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }
  
  async sendWithRetry(htmlBody, attempt = 1) {
    try {
      const success = this.manager.sendThreadedEmail(htmlBody);
      
      if (success) {
        Logger.log('Email sent successfully');
        return true;
      }
      
      throw new Error('Send returned false');
      
    } catch (error) {
      Logger.log(`Attempt ${attempt} failed: ${error.toString()}`);
      
      if (attempt < this.maxRetries) {
        Logger.log(`Retrying in ${this.retryDelay}ms...`);
        Utilities.sleep(this.retryDelay);
        return this.sendWithRetry(htmlBody, attempt + 1);
      }
      
      Logger.log('Max retries exceeded');
      this.handleFailure(error);
      return false;
    }
  }
  
  handleFailure(error) {
    // Could send alert via different channel
    // Or write to error log
    // Or create calendar event for manual review
    const errorSheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Errors');
    errorSheet.appendRow([
      new Date(),
      'Email send failed',
      error.toString()
    ]);
  }
}
```

### Validation Before Sending
```javascript
class ValidatedEmailSender {
  constructor(config) {
    this.validateConfig(config);
    this.manager = new EmailThreadingManager(config);
  }
  
  validateConfig(config) {
    if (!config.recipientEmail) {
      throw new Error('recipientEmail is required');
    }
    
    if (!this.isValidEmail(config.recipientEmail)) {
      throw new Error('Invalid email format');
    }
    
    if (!config.emailSubject || config.emailSubject.trim() === '') {
      throw new Error('emailSubject cannot be empty');
    }
    
    if (!config.threadIdProperty) {
      throw new Error('threadIdProperty is required');
    }
  }
  
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  sendEmail(htmlBody) {
    if (!htmlBody || htmlBody.trim() === '') {
      Logger.log('Warning: Empty email body');
      return false;
    }
    
    return this.manager.sendThreadedEmail(htmlBody);
  }
}
```

## Testing Your Implementation

### Using the Built-in Test Suite
```javascript
// Run comprehensive tests
function testMyImplementation() {
  // 1. Run unit tests
  const testSuite = new EmailThreadingTestSuite();
  testSuite.runAllTests();
  
  // 2. Run integration tests
  runAllIntegrationTests();
  
  // 3. Test your specific configuration
  testYourSpecificSetup();
}

function testYourSpecificSetup() {
  const manager = new EmailThreadingManager({
    threadIdProperty: 'testThreadId',
    recipientEmail: 'your-test@example.com',
    emailSubject: 'Test Thread'
  });
  
  // Test 1: Create thread
  const success1 = manager.sendThreadedEmail('<p>Test 1</p>');
  Logger.log(`Test 1 - Create thread: ${success1 ? 'PASS' : 'FAIL'}`);
  
  // Test 2: Reply to thread
  Utilities.sleep(2000);
  const success2 = manager.sendThreadedEmail('<p>Test 2</p>');
  Logger.log(`Test 2 - Reply to thread: ${success2 ? 'PASS' : 'FAIL'}`);
  
  // Test 3: Check thread info
  const info = manager.getThreadInfo();
  const hasMultipleMessages = info.threadDetails && 
    info.threadDetails.messageCount > 1;
  Logger.log(`Test 3 - Multiple messages: ${hasMultipleMessages ? 'PASS' : 'FAIL'}`);
}
```

### Manual Testing Checklist

- [ ] **Basic Threading**
  - [ ] First email creates new thread
  - [ ] Second email appears in same thread
  - [ ] Thread visible in Gmail interface

- [ ] **Group Delivery** (Critical for v2.0)
  - [ ] Email sent to group address
  - [ ] Individual replies to just sender
  - [ ] Next automated email goes to entire group
  - [ ] Group not hijacked by individual reply

- [ ] **Edge Cases**
  - [ ] Thread survives email being moved to folder
  - [ ] Thread handles external replies
  - [ ] Long threads (20+ messages) work correctly
  - [ ] Special characters in subject handled

## Troubleshooting Common Issues

### Issue: Emails Not Threading

**Symptoms:** Each email appears as separate conversation

**Diagnosis:**
```javascript
const info = manager.getThreadInfo();
Logger.log(`Thread ID: ${info.currentThreadId}`);
Logger.log(`Thread valid: ${info.threadDetails ? 'Yes' : 'No'}`);
```

**Solutions:**
1. Check if thread ID is being stored/retrieved
2. Verify subject line is consistent
3. Check if thread was deleted/trashed
4. Reset threading and start fresh

### Issue: Group Emails Going to Wrong Recipients

**Symptoms:** Emails go to individuals instead of group

**Diagnosis:**
```javascript
// Add logging to verify recipients
Logger.log(`Configured recipient: ${manager.config.recipientEmail}`);
```

**Solution:** Ensure you're using v2.0 with `sendEmail()` method, not v1.x with `reply()`

### Issue: "Cannot find thread" Errors

**Symptoms:** Error messages about thread not found

**Solution:**
```javascript
// Implement fallback for missing threads
const info = manager.getThreadInfo();
if (!info.currentThreadId) {
  Logger.log('Thread lost, will create new one');
  manager.resetThreading();
}
```

### Issue: Rate Limits

**Symptoms:** Errors after sending multiple emails

**Solution:**
```javascript
// Check quota before sending
const remainingQuota = MailApp.getRemainingDailyQuota();
if (remainingQuota < 10) {
  Logger.log(`Warning: Only ${remainingQuota} emails remaining`);
}
```

## Performance Optimization

### Caching Thread Information
```javascript
class CachedEmailManager {
  constructor(config) {
    this.manager = new EmailThreadingManager(config);
    this.cache = CacheService.getScriptCache();
    this.cacheKey = `thread_${config.threadIdProperty}`;
  }
  
  sendEmail(htmlBody) {
    // Try cache first
    let threadId = this.cache.get(this.cacheKey);
    
    if (!threadId) {
      const info = this.manager.getThreadInfo();
      threadId = info.currentThreadId;
      
      if (threadId) {
        // Cache for 1 hour
        this.cache.put(this.cacheKey, threadId, 3600);
      }
    }
    
    return this.manager.sendThreadedEmail(htmlBody);
  }
}
```

### Batch Processing
```javascript
class BatchEmailSender {
  constructor(config) {
    this.manager = new EmailThreadingManager(config);
  }
  
  sendBatch(emailDataArray) {
    const results = [];
    
    emailDataArray.forEach((data, index) => {
      // Add delay to avoid rate limits
      if (index > 0) {
        Utilities.sleep(1000);
      }
      
      const success = this.manager.sendThreadedEmail(data.htmlBody);
      results.push({
        index: index,
        success: success,
        timestamp: new Date()
      });
    });
    
    return results;
  }
}
```

## Security Considerations

### Input Sanitization
```javascript
function sanitizeHtml(html) {
  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  html = html.replace(/on\w+="[^"]*"/gi, '');
  
  // Encode special characters
  const textArea = HtmlService.createHtmlOutput().append(html);
  return textArea.getContent();
}
```

### Recipient Validation
```javascript
class SecureEmailManager {
  constructor(config) {
    this.validateRecipients(config.recipientEmail);
    this.manager = new EmailThreadingManager(config);
    this.allowedDomains = ['company.com', 'googlegroups.com'];
  }
  
  validateRecipients(recipients) {
    const emails = recipients.split(',').map(e => e.trim());
    
    emails.forEach(email => {
      const domain = email.split('@')[1];
      if (!this.allowedDomains.includes(domain)) {
        throw new Error(`Domain ${domain} not allowed`);
      }
    });
  }
}
```

## Monitoring and Logging

### Comprehensive Logging Strategy
```javascript
class MonitoredEmailManager {
  constructor(config) {
    this.manager = new EmailThreadingManager(config);
    this.logSheet = this.initializeLogSheet();
  }
  
  initializeLogSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('EmailLog');
    
    if (!sheet) {
      sheet = ss.insertSheet('EmailLog');
      sheet.appendRow(['Timestamp', 'Status', 'Thread ID', 'Recipients', 'Subject', 'Error']);
    }
    
    return sheet;
  }
  
  sendEmailWithLogging(htmlBody) {
    const startTime = new Date();
    let status = 'Success';
    let error = '';
    let threadId = '';
    
    try {
      const success = this.manager.sendThreadedEmail(htmlBody);
      
      if (!success) {
        status = 'Failed';
        error = 'Send returned false';
      }
      
      const info = this.manager.getThreadInfo();
      threadId = info.currentThreadId || 'New';
      
    } catch (e) {
      status = 'Error';
      error = e.toString();
    }
    
    // Log to sheet
    this.logSheet.appendRow([
      startTime,
      status,
      threadId,
      this.manager.config.recipientEmail,
      this.manager.config.emailSubject,
      error
    ]);
    
    // Also log to console
    Logger.log(`Email ${status}: Thread ${threadId}`);
    
    return status === 'Success';
  }
  
  getRecentLogs(count = 10) {
    const lastRow = this.logSheet.getLastRow();
    const startRow = Math.max(2, lastRow - count + 1);
    
    if (lastRow < 2) return [];
    
    const range = this.logSheet.getRange(startRow, 1, lastRow - startRow + 1, 6);
    return range.getValues();
  }
}
```

### Health Check System
```javascript
class EmailHealthChecker {
  constructor() {
    this.managers = new Map();
  }
  
  registerManager(name, manager) {
    this.managers.set(name, manager);
  }
  
  runHealthCheck() {
    const results = {
      timestamp: new Date(),
      checks: []
    };
    
    this.managers.forEach((manager, name) => {
      const info = manager.getThreadInfo();
      
      const check = {
        name: name,
        hasThread: !!info.currentThreadId,
        threadId: info.currentThreadId,
        messageCount: info.threadDetails?.messageCount || 0,
        lastMessage: info.threadDetails?.lastMessageDate || null,
        status: 'Unknown'
      };
      
      // Determine health status
      if (!check.hasThread) {
        check.status = 'No Thread';
      } else if (check.lastMessage) {
        const hoursSinceLastMessage = 
          (new Date() - new Date(check.lastMessage)) / (1000 * 60 * 60);
        
        if (hoursSinceLastMessage < 24) {
          check.status = 'Active';
        } else if (hoursSinceLastMessage < 168) { // 1 week
          check.status = 'Idle';
        } else {
          check.status = 'Stale';
        }
      }
      
      results.checks.push(check);
    });
    
    return results;
  }
  
  logHealthCheck() {
    const results = this.runHealthCheck();
    
    Logger.log('=== Email System Health Check ===');
    Logger.log(`Timestamp: ${results.timestamp}`);
    
    results.checks.forEach(check => {
      Logger.log(`\n${check.name}:`);
      Logger.log(`  Status: ${check.status}`);
      Logger.log(`  Thread ID: ${check.threadId || 'None'}`);
      Logger.log(`  Messages: ${check.messageCount}`);
      Logger.log(`  Last Activity: ${check.lastMessage || 'Never'}`);
    });
    
    Logger.log('\n=== End Health Check ===');
  }
}
```

## Production Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit and integration)
- [ ] Group delivery verified (critical for v2.0)
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Recipients validated
- [ ] Email quota checked

### Configuration Review
- [ ] Thread ID properties are unique per email stream
- [ ] Email subjects are consistent
- [ ] Recipients are correct (production vs test)
- [ ] Logging level appropriate for production

### Monitoring Setup
- [ ��� Log sheet created
- [ ] Health checks scheduled
- [ ] Error alerts configured
- [ ] Backup plan for failures

### Post-Deployment
- [ ] First email sent successfully
- [ ] Threading verified in Gmail
- [ ] Group delivery confirmed
- [ ] Logs reviewed
- [ ] Health check passing

## Example: Complete Production Implementation

Here's a complete example incorporating all best practices:

```javascript
/**
 * Production-ready email system with v2.0 threading
 */
class ProductionEmailSystem {
  constructor() {
    // Initialize managers for different streams
    this.initializeManagers();
    
    // Set up monitoring
    this.initializeMonitoring();
    
    // Configure error handling
    this.errorHandler = new ErrorHandler();
  }
  
  initializeManagers() {
    // Daily reports to team
    this.dailyReports = new EmailThreadingManager({
      threadIdProperty: 'prod_dailyReportsThreadId',
      recipientEmail: 'team@company.com',
      emailSubject: 'Daily Report',
      enableLogging: true
    });
    
    // Alerts to ops team
    this.alerts = new EmailThreadingManager({
      threadIdProperty: 'prod_alertsThreadId',
      recipientEmail: 'ops@company.com',
      emailSubject: 'System Alerts',
      enableLogging: true
    });
    
    // Weekly summaries to management
    this.summaries = new EmailThreadingManager({
      threadIdProperty: 'prod_summariesThreadId',
      recipientEmail: 'management@company.com',
      emailSubject: 'Weekly Summary',
      enableLogging: true
    });
  }
  
  initializeMonitoring() {
    this.monitor = new EmailHealthChecker();
    this.monitor.registerManager('Daily Reports', this.dailyReports);
    this.monitor.registerManager('Alerts', this.alerts);
    this.monitor.registerManager('Summaries', this.summaries);
  }
  
  /**
   * Send daily report with full error handling and monitoring
   */
  sendDailyReport(data) {
    try {
      // Validate data
      if (!this.validateReportData(data)) {
        throw new Error('Invalid report data');
      }
      
      // Create email content
      const htmlBody = this.createDailyReportHtml(data);
      
      // Send with retry logic
      const success = this.sendWithRetry(
        this.dailyReports,
        htmlBody,
        'Daily Report'
      );
      
      // Log result
      this.logEmailSent('Daily Report', success);
      
      return success;
      
    } catch (error) {
      this.errorHandler.handle(error, 'sendDailyReport');
      return false;
    }
  }
  
  /**
   * Send alert with high priority
   */
  sendAlert(alertData) {
    try {
      const htmlBody = this.createAlertHtml(alertData);
      
      // Alerts get more retries
      const success = this.sendWithRetry(
        this.alerts,
        htmlBody,
        'Alert',
        5 // More retries for alerts
      );
      
      if (!success) {
        // Fallback: Try to notify via calendar event
        this.createCalendarAlert(alertData);
      }
      
      return success;
      
    } catch (error) {
      this.errorHandler.handle(error, 'sendAlert');
      return false;
    }
  }
  
  /**
   * Send with exponential backoff retry
   */
  sendWithRetry(manager, htmlBody, type, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const success = manager.sendThreadedEmail(htmlBody);
        
        if (success) {
          Logger.log(`${type} sent on attempt ${attempt}`);
          return true;
        }
        
      } catch (error) {
        Logger.log(`${type} attempt ${attempt} failed: ${error}`);
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        Logger.log(`Retrying in ${delay}ms...`);
        Utilities.sleep(delay);
      }
    }
    
    Logger.log(`${type} failed after ${maxRetries} attempts`);
    return false;
  }
  
  /**
   * Validate report data before sending
   */
  validateReportData(data) {
    if (!data || typeof data !== 'object') {
      Logger.log('Invalid data type');
      return false;
    }
    
    const requiredFields = ['date', 'metrics', 'summary'];
    for (const field of requiredFields) {
      if (!data[field]) {
        Logger.log(`Missing required field: ${field}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Create HTML for daily report
   */
  createDailyReportHtml(data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Daily Report - ${data.date}</h2>
        
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
          <h3>Summary</h3>
          <p>${data.summary}</p>
        </div>
        
        <h3>Key Metrics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${this.formatMetricsTable(data.metrics)}
        </table>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Generated by ProductionEmailSystem v2.0
        </p>
      </div>
    `;
  }
  
  /**
   * Create HTML for alerts
   */
  createAlertHtml(alertData) {
    const severity = alertData.severity || 'INFO';
    const color = {
      'CRITICAL': '#ff0000',
      'WARNING': '#ff9900',
      'INFO': '#0099ff'
    }[severity] || '#666666';
    
    return `
      <div style="font-family: Arial, sans-serif; border: 2px solid ${color}; padding: 20px;">
        <h2 style="color: ${color};">⚠️ ${severity} Alert</h2>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>System:</strong> ${alertData.system}</p>
        <p><strong>Message:</strong> ${alertData.message}</p>
        
        ${alertData.details ? `
          <div style="background: #f5f5f5; padding: 10px; margin-top: 10px;">
            <pre>${alertData.details}</pre>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Format metrics as HTML table
   */
  formatMetricsTable(metrics) {
    let html = '';
    
    Object.entries(metrics).forEach(([key, value]) => {
      html += `
        <tr>
          <td style="padding: 5px; border: 1px solid #ddd;">${key}</td>
          <td style="padding: 5px; border: 1px solid #ddd;">${value}</td>
        </tr>
      `;
    });
    
    return html;
  }
  
  /**
   * Log email sent
   */
  logEmailSent(type, success) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('EmailLog') || 
      SpreadsheetApp.getActiveSpreadsheet()
        .insertSheet('EmailLog');
    
    sheet.appendRow([
      new Date(),
      type,
      success ? 'Success' : 'Failed',
      Session.getActiveUser().getEmail()
    ]);
  }
  
  /**
   * Create calendar alert as fallback
   */
  createCalendarAlert(alertData) {
    const calendar = CalendarApp.getDefaultCalendar();
    const title = `ALERT: ${alertData.message}`;
    const description = JSON.stringify(alertData, null, 2);
    
    calendar.createEvent(
      title,
      new Date(),
      new Date(Date.now() + 60000), // 1 minute duration
      { description: description }
    );
    
    Logger.log('Calendar alert created as fallback');
  }
  
  /**
   * Run system health check
   */
  runHealthCheck() {
    this.monitor.logHealthCheck();
  }
}

// Error handler class
class ErrorHandler {
  handle(error, context) {
    Logger.log(`ERROR in ${context}: ${error.toString()}`);
    Logger.log(`Stack: ${error.stack}`);
    
    // Could also send to external logging service
    // Or create incident ticket
    // Or send SMS alert for critical errors
  }
}

// Initialize system
const emailSystem = new ProductionEmailSystem();

// Scheduled functions
function sendDailyReport() {
  const data = collectDailyData(); // Your data collection
  emailSystem.sendDailyReport(data);
}

function runHealthCheck() {
  emailSystem.runHealthCheck();
}
```

## Summary: Key Differences from v1.x

| Feature | v1.x (Broken) | v2.0 (Fixed) |
|---------|---------------|--------------|
| Method | `reply()` | `sendEmail()` with headers |
| Group Delivery | ❌ Hijacked by individuals | ✅ Always goes to group |
| Threading | ✅ Works | ✅ Works |
| Recipient Control | ❌ No control | ✅ Full control |
| Architecture | Functions | Class-based |
| Testing | Basic | Comprehensive |
| Error Handling | Minimal | Robust |

## Conclusion

Version 2.0 of the Email Threading Library solves the critical group delivery issue present in v1.x while maintaining all threading functionality. The key insight is that Gmail's `reply()` method ignores the `to` parameter, requiring the use of `sendEmail()` with manual threading headers for proper recipient control.

By following this implementation guide, you can ensure your automated emails:
- Always reach the intended recipients (especially groups)
- Maintain proper threading in all email clients
- Handle edge cases gracefully
- Provide comprehensive logging and monitoring

Remember: **Always test group scenarios** to ensure your implementation doesn't allow individual replies to hijack group communications.