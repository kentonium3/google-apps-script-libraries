# Google Apps Script Libraries

A collection of proven, production-ready utility libraries for Google Apps Script applications, developed through real-world automation projects.

## 📧 Libraries Available

### [Email Threading Library](./email-threading/)
**Status: ✅ Production Ready**  
**Problem Solved:** Reliable email threading for automated updates across all email clients

Gmail Apps Script's native `GmailApp.sendEmail()` with manual threading headers doesn't work reliably. This library provides a proven solution using Gmail's native threading capabilities.

**Key Features:**
- ✅ Works across all email clients (Gmail, Apple Mail, Yahoo, etc.)
- ✅ Handles Google Groups and individual recipients  
- ✅ Survives folder moves and external replies
- ✅ Comprehensive test framework included
- ✅ Production-tested in habit tracking applications

**Use Cases:**
- Daily progress updates
- Form submission notifications  
- Automated group communications
- Multi-habit tracking apps

[→ View Email Threading Documentation](./email-threading/README.md)

---

## 🚀 Quick Start

### Using a Library
1. **Copy the core functions** from the library's main `.js` file into your Apps Script project
2. **Follow the implementation examples** in the library's `/examples` folder  
3. **Run the test functions** to validate setup
4. **Reference the documentation** for advanced configurations

### Example Implementation
```javascript
// 1. Include the library functions in your script

// 2. Configure for your use case
const config = createThreadingConfig({
  threadIdProperty: 'myAppThreadId',
  emailSubject: 'My App Updates',
  recipientEmail: 'team@company.com',
  scriptVersion: 'v1.0'
});

// 3. Send threaded email
const htmlBody = "<h2>Update</h2><p>Your content here...</p>";
const success = sendThreadedEmail(htmlBody, config);
```

## 📁 Repository Structure

```
google-apps-script-libraries/
├── README.md                    # This file
├── email-threading/             # Email threading library
│   ├── README.md               # Library-specific documentation
│   ├── core-threading.js       # Main library functions
│   ├── test-framework.js       # Comprehensive testing suite
│   ├── examples/               # Implementation examples
│   │   ├── basic-usage.js
│   │   ├── rise-tracker.js     # Real-world example
│   │   └── habit-tracker.js    # Multi-app example  
│   └── docs/                   # Additional documentation
│       ├── debugging-guide.md
│       └── implementation-patterns.md
└── [future-libraries]/         # Additional utilities as developed
```

## 🧪 Development Philosophy

These libraries are developed through **real-world problem solving**, not theoretical programming:

1. **Problem Discovery** - Encounter issues in actual automation projects
2. **Extensive Debugging** - Document what doesn't work and why  
3. **Solution Development** - Find proven approaches that work reliably
4. **Edge Case Testing** - Validate against real-world scenarios
5. **Production Deployment** - Test in live applications
6. **Documentation & Sharing** - Package for reuse across projects

## 📊 Current Applications

### Rise Tracker (Production prototype)
- **Purpose:** Daily 5AM wake-up habit tracking
- **Email Threading:** ✅ Deployed and working
- **Recipients:** Google Group with external replies
- **Status:** Active daily use since August 2025

### Multi-Habit Tracker (In Development)  
- **Purpose:** Generic habit tracking web application
- **Email Threading:** 🔄 Integration planned
- **Features:** Multiple habit types, flexible scheduling
- **Status:** Active development

## 🛠️ Technical Details

### Google Apps Script Environment
- **Platform:** Google Apps Script (JavaScript ES5/ES6)
- **Dependencies:** Native GmailApp, PropertiesService, SpreadsheetApp
- **External APIs:** None required
- **Permissions:** Gmail send, Spreadsheet read (application-dependent)

### Testing Approach
- **Manual testing** with real email clients
- **Edge case validation** (folder moves, external replies, groups)  
- **Cross-client verification** (Gmail, Apple Mail, Yahoo Mail)
- **Production monitoring** through extensive logging

### Code Quality Standards
- **Comprehensive error handling** with graceful degradation
- **Detailed logging** for debugging and monitoring
- **Clear documentation** with real-world examples
- **Configuration-driven** for easy adaptation

## 📝 Usage Guidelines

### For Non-Developers
- **Copy and paste** the library functions into your Apps Script project
- **Follow the examples** exactly for your first implementation
- **Run test functions** to make sure everything works
- **Customize configuration** for your specific needs

### For Developers  
- **Review the debugging documentation** to understand design decisions
- **Examine test frameworks** for validation approaches
- **Consider edge cases** documented in each library
- **Contribute improvements** via issues or pull requests

## 🤝 Contributing

This is primarily a personal library collection, but improvements are welcome:

1. **Issues** - Report bugs or request features
2. **Pull Requests** - Submit improvements with clear descriptions
3. **Documentation** - Help improve examples and guides
4. **Testing** - Share results from different use cases

## 📄 License

MIT License - Feel free to use in your own projects

## 🔗 Related Projects

- [Rise Tracker Repository](https://github.com/kentonium3/bug-driven-development) - Daily habit tracking application
- [Multi-Habit Tracker Repository](https://github.com/kentonium3/multi-habit-tracker) - Generic new habit tracking web app

## 📧 Contact

For questions about specific libraries or implementation help, please open an issue in this repository.

---

**Note:** These libraries are developed for Google Apps Script environments and may require adaptation for other JavaScript platforms.
