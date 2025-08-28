/**
 * @fileoverview Example implementations using the Email Threading Library
 * @version 2.0.0
 * @description Shows how to integrate the threading library into various applications
 */

// =====================================================================
// EXAMPLE 1: Simple Daily Report Implementation
// =====================================================================

/**
 * Example configuration for a daily report system
 */
const DAILY_REPORT_CONFIG = {
  threadIdProperty: 'dailyReportThreadId',
  recipientEmail: 'team@googlegroups.com',
  emailSubject: 'Daily Status Report',
  enableLogging: true,
  scriptVersion: '1.0.0'
};

/**
 * Send a daily report using the threading library
 */
function sendDailyReport() {
  // Create threading manager instance
  const threadingManager = new EmailThreadingManager(DAILY_REPORT_CONFIG);
  
  // Get your report data (example)
  const reportData = generateReportData();
  
  // Create HTML email body
  const htmlBody = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Daily Status Report</h2>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <div>${reportData}</div>
    </div>
  `;
  
  // Send threaded email
  const success = threadingManager.sendThreadedEmail(htmlBody);
  
  if (success) {
    Logger.log('Daily report sent successfully');
  } else {
    Logger.log('Failed to send daily report');
  }
}

// =====================================================================
// EXAMPLE 2: Form Submission Handler with Threading
// =====================================================================

/**
 * Handle form submissions with threaded emails
 * This would be triggered by a form submission
 */
function onFormSubmit(e) {
  // Configuration for form response emails
  const formConfig = {
    threadIdProperty: 'formResponseThreadId',
    recipientEmail: 'support@example.com',
    emailSubject: 'New Form Submission',
    enableLogging: true
  };
  
  const threadingManager = new EmailThreadingManager(formConfig);
  
  // Extract form data
  const formData = e.values;
  const timestamp = new Date(e.timestamp);
  
  // Build email content
  const htmlBody = buildFormResponseEmail(formData, timestamp);
  
  // Optional: Add attachments or CC
  const options = {
    cc: 'manager@example.com',
    attachments: [] // Add any attachments here
  };
  
  // Send threaded email
  threadingManager.sendThreadedEmail(htmlBody, options);
}

/**
 * Build HTML email from form data
 * @param {Array} formData - Form response values
 * @param {Date} timestamp - Submission timestamp
 * @return {string} HTML email body
 */
function buildFormResponseEmail(formData, timestamp) {
  let html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>New Form Submission</h2>
      <p><strong>Submitted:</strong> ${timestamp.toLocaleString()}</p>
      <table style="border-collapse: collapse; width: 100%;">
  `;
  
  // Add form fields (customize based on your form)
  const fieldNames = ['Name', 'Email', 'Message', 'Priority'];
  formData.forEach((value, index) => {
    if (index < fieldNames.length) {
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">
            ${fieldNames[index]}:
          </td>
          <td style="border: 1px solid #ddd; padding: 8px;">
            ${value || 'N/A'}
          </td>
        </tr>
      `;
    }
  });
  
  html += `
      </table>
    </div>
  `;
  
  return html;
}

// =====================================================================
// EXAMPLE 3: Spreadsheet Data Tracker with Comments
// =====================================================================

/**
 * Complete implementation for spreadsheet-based tracking system
 * Similar to the 5:00am rise tracker
 */
class SpreadsheetTracker {
  constructor(config) {
    this.config = {
      // Spreadsheet configuration
      dataSheetName: config.dataSheetName || 'Data',
      formSheetName: config.formSheetName || 'Form Responses 1',
      dataRangeToCopy: config.dataRangeToCopy || 'A1:D33',
      commentColumnIndex: config.commentColumnIndex || 3,
      
      // Email configuration
      threadIdProperty: config.threadIdProperty || 'trackerThreadId',
      recipientEmail: config.recipientEmail,
      emailSubject: config.emailSubject || 'Tracker Update',
      
      // Options
      enableLogging: config.enableLogging !== false,
      scriptVersion: config.scriptVersion || '1.0.0'
    };
    
    // Initialize threading manager
    this.threadingManager = new EmailThreadingManager({
      threadIdProperty: this.config.threadIdProperty,
      recipientEmail: this.config.recipientEmail,
      emailSubject: this.config.emailSubject,
      enableLogging: this.config.enableLogging,
      scriptVersion: this.config.scriptVersion
    });
  }
  
  /**
   * Send tracker update
   */
  sendUpdate() {
    Logger.log('Starting tracker update...');
    
    try {
      // Get data from spreadsheet
      const data = this.getSpreadsheetData();
      if (!data) {
        Logger.log('Failed to get spreadsheet data');
        return false;
      }
      
      // Create email body
      const htmlBody = this.createEmailBody(data);
      
      // Send threaded email
      const success = this.threadingManager.sendThreadedEmail(htmlBody);
      
      if (success) {
        Logger.log('✅ Tracker update sent successfully');
      } else {
        Logger.log('❌ Failed to send tracker update');
      }
      
      return success;
      
    } catch (error) {
      Logger.log(`Error in sendUpdate: ${error.toString()}`);
      return false;
    }
  }
  
  /**
   * Get data from spreadsheet
   * @private
   * @return {Object|null} Data object or null
   */
  getSpreadsheetData() {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const dataSheet = spreadsheet.getSheetByName(this.config.dataSheetName);
      const formSheet = spreadsheet.getSheetByName(this.config.formSheetName);
      
      if (!dataSheet || !formSheet) {
        Logger.log('Required sheets not found');
        return null;
      }
      
      // Get latest comment
      const lastRow = formSheet.getLastRow();
      let comment = 'No comments yet';
      
      if (lastRow >= 1) {
        comment = formSheet.getRange(lastRow, this.config.commentColumnIndex).getValue();
      }
      
      // Get data range
      const dataRange = dataSheet.getRange(this.config.dataRangeToCopy);
      const data = dataRange.getDisplayValues();
      
      return { comment, data };
      
    } catch (error) {
      Logger.log(`Error getting spreadsheet data: ${error.toString()}`);
      return null;
    }
  }
  
  /**
   * Create HTML email body
   * @private
   * @param {Object} data - Data object with comment and table data
   * @return {string} HTML email body
   */
  createEmailBody(data) {
    const timestamp = new Date().toLocaleString();
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px;">
        <h2>${this.config.emailSubject}</h2>
        <p><strong>Comment:</strong> ${data.comment}</p>
        <p style="color: #666; font-size: 12px;">Updated: ${timestamp}</p>
        <table style="border-collapse: collapse; width: 100%;">
    `;
    
    // Add table rows
    data.data.forEach((row, rowIndex) => {
      const isHeader = rowIndex === 0;
      const bgColor = isHeader ? '#e3f2fd' : (rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff');
      
      html += '<tr>';
      row.forEach(cell => {
        const tag = isHeader ? 'th' : 'td';
        html += `
          <${tag} style="
            border: 1px solid #ddd;
            padding: 8px;
            background-color: ${bgColor};
            ${isHeader ? 'font-weight: bold;' : ''}
          ">
            ${cell || '&nbsp;'}
          </${tag}>
        `;
      });
      html += '</tr>';
    });
    
    html += `
        </table>
        <p style="margin-top: 20px; color: #888; font-size: 10px;">
          Automated update - ${this.config.scriptVersion}
        </p>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Reset threading for this tracker
   */
  resetThreading() {
    this.threadingManager.resetThreading();
  }
  
  /**
   * Get thread information
   * @return {Object} Thread info
   */
  getThreadInfo() {
    return this.threadingManager.getThreadInfo();
  }
}

// =====================================================================
// EXAMPLE 4: Utility Functions for Testing and Management
// =====================================================================

/**
 * Test the threading library with a simple example
 */
function testThreadingLibrary() {
  Logger.log('=== TESTING EMAIL THREADING LIBRARY ===');
  
  const testConfig = {
    threadIdProperty: 'testThreadId',
    recipientEmail: 'test@example.com',
    emailSubject: 'Test Thread',
    enableLogging: true
  };
  
  const manager = new EmailThreadingManager(testConfig);
  
  const htmlBody = `
    <div>
      <h2>Test Email</h2>
      <p>This is a test of the threading library.</p>
      <p>Timestamp: ${new Date().toLocaleString()}</p>
    </div>
  `;
  
  const success = manager.sendThreadedEmail(htmlBody);
  Logger.log(`Test result: ${success ? 'SUCCESS' : 'FAILED'}`);
  
  // Get thread info
  const info = manager.getThreadInfo();
  Logger.log('Thread info:', JSON.stringify(info, null, 2));
  
  Logger.log('=== TEST COMPLETE ===');
}

/**
 * Reset all threading for a specific property
 * @param {string} threadIdProperty - The property name to reset
 */
function resetSpecificThread(threadIdProperty) {
  const manager = new EmailThreadingManager({
    threadIdProperty: threadIdProperty,
    recipientEmail: 'dummy@example.com',
    emailSubject: 'Dummy'
  });
  
  manager.resetThreading();
  Logger.log(`Reset complete for: ${threadIdProperty}`);
}

/**
 * Get information about all threads in the system
 */
function getAllThreadInfo() {
  const properties = PropertiesService.getScriptProperties();
  const allProps = properties.getProperties();
  
  Logger.log('=== ALL THREAD INFORMATION ===');
  
  Object.keys(allProps).forEach(key => {
    if (key.includes('ThreadId')) {
      Logger.log(`${key}: ${allProps[key]}`);
    }
  });
  
  Logger.log('=== END THREAD INFORMATION ===');
}

// =====================================================================
// EXAMPLE 5: Migration Helper for Existing Scripts
// =====================================================================

/**
 * Helper to migrate from old reply() method to new threading approach
 * Use this to update existing scripts
 */
function migrateOldThreadingCode() {
  Logger.log('=== MIGRATION GUIDE ===');
  Logger.log('Old approach issues:');
  Logger.log('- reply() method ignores "to" parameter');
  Logger.log('- Emails go to last individual replier, not group');
  Logger.log('');
  Logger.log('New approach benefits:');
  Logger.log('- sendEmail() with threading headers');
  Logger.log('- Always sends to configured recipient');
  Logger.log('- Maintains proper threading');
  Logger.log('');
  Logger.log('Steps to migrate:');
  Logger.log('1. Replace reply() calls with EmailThreadingManager');
  Logger.log('2. Configure with your group email address');
  Logger.log('3. Test with resetThreading() first');
  Logger.log('4. Monitor logs to verify proper operation');
  Logger.log('=== END MIGRATION GUIDE ===');
}

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

/**
 * Generate sample report data (placeholder)
 * @return {string} Sample HTML content
 */
function generateReportData() {
  return `
    <ul>
      <li>Tasks completed: 15</li>
      <li>Issues resolved: 3</li>
      <li>Pending items: 7</li>
    </ul>
  `;
}