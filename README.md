# 💬 Genspark Conversation Manager

🇮🇱 **לקריאה בעברית - [לחץ כאן](README-HE.md)**
🇺🇸 **For English documentation - continue reading below**

**Advanced conversation management, search, and download tools for Genspark.ai**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.4-blue.svg)](https://github.com/Dude775/genspark-rtl-toolbox/releases)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chromewebstore.google.com)

---

## ✨ Features

### 🔍 **Advanced Search**
- **Two search modes**:
  - **In-Conversation Search** - Search within the current conversation
  - **Cross-Conversation Search** - Search across ALL conversations in your sidebar
- **Full-text search** with fuzzy matching for both Hebrew and English
- **Smart scoring system**:
  - ⭐ Exact match (score: 100)
  - ✓ Partial match (score: 80)
  - ~ Fuzzy match (score: 60)
- **Context highlighting** shows surrounding text for each result
- **Smart navigation** - click any result to jump directly to that message or conversation
- **Real-time search** with instant results (press Enter to search)

### 💾 **Flexible Downloads**
- **Three download formats**:
  - **TXT only** - Plain text format, easy to read
  - **JSON only** - Structured data with metadata
  - **TXT + JSON** - Get both formats at once
- **No duplicates** - Each format downloads exactly once
- **Complete conversation export** with timestamps
- **Preserve formatting** and message structure
- **User/AI identification** clearly marked

### 📚 **Conversation Manager**
- **Save conversations** - Save current conversation with one click
- **View saved conversations** - Browse all your saved conversations in an organized list
- **Conversation details** - See title, date, time, and message count for each conversation
- **Quick actions**:
  - 🔗 **Open** - Open saved conversation in a new tab
  - 🗑️ **Delete** - Remove unwanted conversations
- **Bulk download** - Export ALL saved conversations at once (JSON + TXT)
- **Persistent storage** - Conversations stored locally in chrome.storage.local
- **Smart indexing** - Unique conversation IDs and automatic metadata

### 🎨 **Professional Interface**
- **Modern popup design** with intuitive controls
- **Real-time status indicators** and connection feedback
- **Message counter** shows conversation length
- **Responsive search panel** with clean results display
- **Error handling** with user-friendly Hebrew/English messages

---

## 🚀 Installation

### From Chrome Web Store (Recommended)
1. Visit [Chrome Web Store](https://chromewebstore.google.com)
2. Search for "Genspark Conversation Manager"
3. Click "Add to Chrome"
4. Enjoy enhanced Genspark experience!

### Manual Installation (Developer Mode)
1. Download the [latest release](https://github.com/Dude775/genspark-rtl-toolbox/releases)
2. Extract the ZIP file
3. Open Chrome → Settings → Extensions
4. Enable "Developer mode" (top right)
5. Click "Load unpacked" and select the extracted folder

---

## 📖 Usage

### Search Conversations

**In-Conversation Search:**
1. Navigate to any conversation on [Genspark.ai](https://genspark.ai)
2. Click the extension icon in your toolbar
3. Click "חיפוש בשיחה" (Search in Conversation)
4. Make sure "💬 בשיחה הנוכחית" mode is selected
5. Enter your search term (word or phrase)
6. Click "חפש" or press Enter
7. Click any result to jump to that message in the conversation

**Cross-Conversation Search:**
1. Navigate to [Genspark.ai](https://genspark.ai) (any page with sidebar)
2. Click the extension icon in your toolbar
3. Click "חיפוש בשיחה" (Search)
4. Click "📋 בכל השיחות" (All Conversations) mode
5. Enter your search term (word or phrase)
6. Click "חפש" or press Enter
7. Browse results showing matches across all conversations
8. Click any result to navigate directly to that conversation

### Download Conversations
1. Open any conversation on Genspark.ai
2. Click the extension icon
3. Choose your preferred format:
   - **"הורד שיחה (JSON + TXT)"** - Downloads both formats
   - **"הורד JSON בלבד"** - JSON only
   - **"הורד TXT בלבד"** - TXT only
4. Files will be saved to your Downloads folder with timestamp

### Manage Saved Conversations

**Save Current Conversation:**
1. Navigate to any conversation on [Genspark.ai](https://genspark.ai)
2. Click the extension icon
3. Click "💾 שמור שיחה נוכחית" (Save Current Conversation)
4. Conversation is saved with title, date, and all messages

**View Saved Conversations:**
1. Click the extension icon
2. Click "📚 צפה בשיחות שמורות" (View Saved Conversations)
3. Browse your saved conversations list
4. Each item shows:
   - Conversation title
   - Save date and time
   - Message count
   - Action buttons (Open, Delete)

**Open Saved Conversation:**
- Click the 🔗 button to open the conversation in a new tab

**Delete Saved Conversation:**
- Click the 🗑️ button to remove the conversation from storage

**Bulk Download All Conversations:**
1. Click the extension icon
2. Click "📦 הורד את כל השיחות" (Download All Conversations)
3. Confirm the action
4. All saved conversations will be exported to 2 files:
   - `genspark_all_conversations_YYYY-MM-DD.json` - All conversations in JSON format
   - `genspark_all_conversations_YYYY-MM-DD.txt` - All conversations in readable text format

### Quick Tips
- Use **Enter key** for faster searching
- Search supports both **Hebrew and English**
- **Switch between search modes** using the toggle buttons:
  - 💬 **In-Conversation** - Search current conversation only
  - 📋 **All Conversations** - Search across sidebar conversations
- **Save important conversations** for later reference
- **View saved conversations count** in the stats panel
- **Bulk download all** your saved conversations at once
- Downloaded files include **date in filename** for easy organization
- Search results show **context** (50 characters before/after match)
- **Match scores** help identify best results (⭐ exact, ✓ partial, ~ fuzzy)
- Click **X** to close search panel

---

## 🛠️ Technical Details

### Architecture
- **Manifest V3** compliance for modern Chrome extensions
- **Content Script** for conversation extraction and search
- **Background Service Worker** for data persistence
- **Popup Interface** for user controls
- **No external dependencies** - fully self-contained

### Permissions Required
- `tabs` - Access active tab information
- `scripting` - Inject conversation management functionality
- `storage` - Save user preferences
- `activeTab` - Access current Genspark.ai page
- `host_permissions` - Access to genspark.ai domain

### Browser Compatibility
- **Chrome 88+** (Manifest V3 support)
- **Edge 88+** (Chromium-based)
- **Opera 74+** (Chromium-based)

---

## 🔧 Development

### Project Structure
```
genspark-conversation-manager/
├── manifest.json          # Extension configuration (v2.4)
├── content.js            # Search, download, and extraction logic
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality and search UI
├── background.js        # Background service worker
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
├── README.md           # English documentation
├── README-HE.md        # Hebrew documentation
└── LICENSE             # MIT License
```

### Build Instructions
1. Clone this repository
```bash
git clone https://github.com/Dude775/genspark-rtl-toolbox.git
cd genspark-rtl-toolbox
```
2. No build process required - load directly in Chrome
3. For production: Create ZIP of all files except README files

### Key Changes from v2.3
- ❌ **Removed** RTL algorithm (not needed for Genspark)
- ✅ **Fixed** download duplication bug
- ✅ **Added** full-text search with highlighting
- ✅ **Improved** download button organization
- ✅ **Enhanced** user interface with search panel

---

## 🐛 Troubleshooting

### Common Issues

**Extension not working on Genspark.ai?**
- Refresh the page after installing
- Make sure you're on genspark.ai (not other domains)
- Check if extension is enabled in Chrome

**Search not finding results?**
- Make sure the conversation has loaded completely
- Try searching for a shorter keyword
- Search is case-insensitive, so "Hello" = "hello"

**Downloads not working?**
- Check Chrome download permissions
- Verify popup blocker isn't interfering
- Make sure conversation has content to download
- If downloads duplicate, refresh the page (bug fixed in v2.4)

**Search panel won't open?**
- Make sure you're connected (green status indicator)
- Try clicking "רענן נתונים" (Refresh Data)
- Reload the Genspark.ai page

---

## 🤝 Contributing

We welcome contributions! Please feel free to:

1. **Report bugs** via GitHub Issues
2. **Suggest features** for future releases
3. **Submit pull requests** with improvements
4. **Help translate** to more languages

### Development Setup
```bash
git clone https://github.com/Dude775/genspark-rtl-toolbox.git
cd genspark-rtl-toolbox
# Load unpacked extension in Chrome Developer Mode
```

---

## 📋 Changelog

### v2.5 (Current) - November 2024
- ✅ **NEW: Conversation Manager** - Complete conversation management system:
  - 💾 Save current conversation with one click
  - 📚 View all saved conversations in organized list
  - 🔗 Open saved conversations in new tabs
  - 🗑️ Delete unwanted conversations
  - 📦 Bulk download all saved conversations
  - Persistent storage with chrome.storage.local
  - Smart indexing with unique IDs
- ✅ **Enhanced stats panel** - Now shows saved conversations count
- ✅ **Improved UI** - New Conversation Manager section with intuitive controls

### v2.4 - November 2024
- ✅ **Removed RTL algorithm** (simplified extension)
- ✅ **Fixed download duplication** - no more 4x downloads!
- ✅ **Added dual search modes**:
  - In-conversation search with context highlighting
  - Cross-conversation search across ALL sidebar conversations
- ✅ **Fuzzy matching algorithm** with smart scoring (exact/partial/fuzzy)
- ✅ **Added message navigation** - click to jump to message or conversation
- ✅ **Improved UI** with dedicated search panel and mode toggle
- ✅ **Renamed extension** to "Conversation Manager"
- ✅ **Better error messages** in Hebrew and English

### v2.3
- ✅ Enhanced RTL detection algorithm
- ✅ Improved conversation download functionality
- ✅ Modern popup interface design
- ✅ Better error handling and user feedback
- ✅ Manifest V3 compliance

### v2.2
- Added background service worker
- Improved CSS styling for RTL
- Bug fixes for content script injection

### v2.1
- Initial RTL support
- Basic conversation download
- Popup interface prototype

---

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Dude775/genspark-rtl-toolbox/issues)
- **Email**: Create GitHub issue for fastest response

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- Thanks to **Genspark.ai** team for creating an amazing AI platform
- **Hebrew-speaking community** for feedback and testing
- **Chrome Extension** community for development resources

---

## 🎯 Future Plans

- [x] ~~Multi-conversation search~~ ✅ **Completed in v2.4**
- [ ] Export to PDF format
- [ ] Conversation tagging and categorization
- [ ] Cloud sync for saved conversations
- [ ] Advanced filters (date range, user/AI only, etc.)
- [ ] Search history and saved searches

---

**Made with ❤️ for the Genspark community**

[⭐ Star this repo](https://github.com/Dude775/genspark-rtl-toolbox) | [🐛 Report Issues](https://github.com/Dude775/genspark-rtl-toolbox/issues) | [💡 Request Features](https://github.com/Dude775/genspark-rtl-toolbox/issues/new)
