# 🔄 Genspark RTL Toolbox

🇮🇱 **לקריאה בעברית - [לחץ כאן](README-HE.md)**  
🇺🇸 **For English documentation - continue reading below**

**Enhanced Hebrew/RTL support and conversation download tools for Genspark.ai**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.3-blue.svg)](https://github.com/Dude775/genspark-rtl-toolbox/releases)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chromewebstore.google.com)

---

## ✨ Features

### 🔤 **RTL Support**
- **Full Hebrew/Arabic/Persian support** for Genspark.ai interface
- **Automatic text direction detection** for mixed-language content
- **Custom CSS styling** optimized for RTL languages
- **Toggle RTL on/off** with simple click

### 💾 **Conversation Download**
- **Export complete conversations** to text files
- **Preserve formatting** and message structure  
- **Include timestamps** and user/AI identification
- **Bulk conversation export** capability

### 🎨 **Professional Interface**
- **Modern popup design** with intuitive controls
- **Real-time status indicators** and progress feedback
- **Comprehensive settings panel** for customization
- **Error handling** with user-friendly messages

---

## 🚀 Installation

### From Chrome Web Store (Recommended)
1. Visit [Chrome Web Store](https://chromewebstore.google.com) 
2. Search for "Genspark RTL Toolbox"
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

### RTL Support
1. Navigate to [Genspark.ai](https://genspark.ai)
2. Click the extension icon in your toolbar
3. Toggle "Enable RTL" to activate Hebrew/Arabic support
4. Enjoy properly formatted RTL text!

### Download Conversations
1. Open any conversation on Genspark.ai
2. Click the extension icon
3. Click "Download Conversation"
4. File will be saved to your Downloads folder

---

## 🛠️ Technical Details

### Architecture
- **Manifest V3** compliance for modern Chrome extensions
- **Content Script** for DOM manipulation and RTL styling
- **Background Service Worker** for data persistence
- **Popup Interface** for user controls

### Permissions Required
- `tabs` - Access active tab information
- `scripting` - Inject RTL styles and functionality  
- `storage` - Save user preferences
- `downloads` - Export conversation files
- `host_permissions` - Access to genspark.ai domain

### Browser Compatibility
- **Chrome 88+** (Manifest V3 support)
- **Edge 88+** (Chromium-based)
- **Opera 74+** (Chromium-based)

---

## 🔧 Development

### Project Structure
```
genspark-rtl-toolbox/
├── manifest.json          # Extension configuration
├── content.js            # Main RTL and download logic
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── background.js        # Background service worker
├── rtl-styles.css       # RTL styling rules
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

### Build Instructions
1. Clone this repository
2. No build process required - load directly in Chrome
3. For production: Create ZIP of all files except README.md

---

## 🐛 Troubleshooting

### Common Issues

**Extension not working on Genspark.ai?**
- Refresh the page after installing
- Make sure you're on genspark.ai (not other domains)
- Check if extension is enabled in Chrome

**RTL text still looks wrong?**
- Try toggling RTL off and on again
- Clear browser cache and reload page
- Ensure you're using supported RTL language

**Downloads not working?**
- Check Chrome download permissions
- Verify popup blocker isn't interfering
- Make sure conversation has content to download

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

### v2.3 (Current)
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
- **Privacy Policy**: [View our privacy policy](https://dude775.github.io/genspark-rtl-privacy/)
- **Email**: Create GitHub issue for fastest response

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- Thanks to **Genspark.ai** team for creating an amazing AI platform
- **RTL language communities** for feedback and testing  
- **Chrome Extension** community for development resources

---



**Made with ❤️ for the Hebrew/RTL speaking community**

[⭐ Star this repo](https://github.com/Dude775/genspark-rtl-toolbox) | [🐛 Report Issues](https://github.com/Dude775/genspark-rtl-toolbox/issues) | [💡 Request Features](https://github.com/Dude775/genspark-rtl-toolbox/issues/new)

