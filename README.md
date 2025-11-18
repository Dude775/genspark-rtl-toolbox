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
- **Full-text search** across all your Genspark conversations
- **Keyword search** to find specific messages instantly
- **Context highlighting** shows surrounding text for each result
- **Smart navigation** - click any result to jump directly to that message in the conversation
- **Real-time search** with instant results as you type (Enter to search)

### 💾 **Flexible Downloads**
- **Three download formats**:
  - **TXT only** - Plain text format, easy to read
  - **JSON only** - Structured data with metadata
  - **TXT + JSON** - Get both formats at once
- **No duplicates** - Each format downloads exactly once
- **Complete conversation export** with timestamps
- **Preserve formatting** and message structure
- **User/AI identification** clearly marked

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
1. Navigate to any conversation on [Genspark.ai](https://genspark.ai)
2. Click the extension icon in your toolbar
3. Click "חיפוש בשיחה" (Search in Conversation)
4. Enter your search term (word or phrase)
5. Click "חפש" or press Enter
6. Click any result to jump to that message in the conversation!

### Download Conversations
1. Open any conversation on Genspark.ai
2. Click the extension icon
3. Choose your preferred format:
   - **"הורד שיחה (JSON + TXT)"** - Downloads both formats
   - **"הורד JSON בלבד"** - JSON only
   - **"הורד TXT בלבד"** - TXT only
4. Files will be saved to your Downloads folder with timestamp

### Quick Tips
- Use **Enter key** for faster searching
- Search supports both **Hebrew and English**
- Downloaded files include **date in filename** for easy organization
- Search results show **context** (50 characters before/after match)
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

1. הורד או שכפל את התוסף.
2. טען כתוסף בדפדפן דרך מצב מפתחים.
3. השתמש בממשק להורדות ולחיפוש.

## תצורה

ניתן להגדיר הגדרות ברירת מחדל ב-background.js.

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

### v2.4 (Current) - November 2024
- ✅ **Removed RTL algorithm** (simplified extension)
- ✅ **Fixed download duplication** - no more 4x downloads!
- ✅ **Added full-text search** with context highlighting
- ✅ **Added keyword search** for quick finding
- ✅ **Added message navigation** - click to jump to message
- ✅ **Improved UI** with dedicated search panel
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

- [ ] Export to PDF format
- [ ] Conversation tagging and categorization
- [ ] Multi-conversation search
- [ ] Cloud sync for saved conversations
- [ ] Advanced filters (date range, user/AI only, etc.)

---

**Made with ❤️ for the Genspark community**

[⭐ Star this repo](https://github.com/Dude775/genspark-rtl-toolbox) | [🐛 Report Issues](https://github.com/Dude775/genspark-rtl-toolbox/issues) | [💡 Request Features](https://github.com/Dude775/genspark-rtl-toolbox/issues/new)
