/**
 * Genspark Conversation Manager v2.5 - Background Service Worker
 * שירות רקע לניהול התוסף
 */

class BackgroundService {
    constructor() {
        this.version = '2.5';
        this.isActive = true;
        this.tabStates = new Map();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();

        console.log(`🔧 Background Service v${this.version} אותחל`);
    }

    setupEventListeners() {
        // התקנת התוסף
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // הודעות בין רכיבים
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // שמור חיבור אסינכרוני
        });

        // עדכוני טאבים
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // סגירת טאבים
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            this.handleTabRemoved(tabId);
        });

        // אירועי חלונות
        chrome.windows.onRemoved.addListener((windowId) => {
            this.handleWindowClosed(windowId);
        });
    }

    async handleInstallation(details) {
        console.log('התקנת תוסף:', details);

        if (details.reason === 'install') {
            // התקנה ראשונה
            await this.setDefaultSettings();
            this.showWelcomeNotification();

        } else if (details.reason === 'update') {
            // עדכון גרסה
            const previousVersion = details.previousVersion;
            console.log(`עדכון מגרסה ${previousVersion} לגרסה ${this.version}`);

            await this.migrateSettings(previousVersion);
            this.showUpdateNotification(previousVersion);
        }
    }

    async setDefaultSettings() {
        const defaultSettings = {
            autoDownload: false,
            downloadFormat: 'both',
            showNotifications: true,
            version: this.version,
            installDate: new Date().toISOString()
        };

        await chrome.storage.sync.set(defaultSettings);
        console.log('הגדרות ברירת מחדל נשמרו:', defaultSettings);
    }

    async migrateSettings(previousVersion) {
        try {
            const currentSettings = await chrome.storage.sync.get();

            // הוסף הגדרות חדשות שלא היו בגרסה הקודמת
            const updates = {
                version: this.version,
                lastUpdate: new Date().toISOString()
            };

            // Migration logic לגרסאות ספציפיות
            if (this.compareVersions(previousVersion, '2.0') < 0) {
                // שינויים מגרסה 2.0
                updates.showNotifications = currentSettings.showNotifications ?? true;
            }

            if (this.compareVersions(previousVersion, '2.3') < 0) {
                // שינויים מגרסה 2.3  
                updates.downloadFormat = currentSettings.downloadFormat || 'both';
            }

            await chrome.storage.sync.set(updates);
            console.log('הגדרות הועברו בהצלחה:', updates);

        } catch (error) {
            console.error('שגיאה במעבר הגדרות:', error);
        }
    }

    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;

            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }

        return 0;
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get();
            console.log('הגדרות נטענו:', settings);
            return settings;
        } catch (error) {
            console.error('שגיאה בטעינת הגדרות:', error);
            return {};
        }
    }

    async handleMessage(request, sender, sendResponse) {
        console.log('הודעה התקבלה:', request, 'מאת:', sender);

        try {
            switch (request.action) {
                case 'getSettings':
                    const settings = await this.loadSettings();
                    sendResponse({ success: true, settings });
                    break;

                case 'saveSettings':
                    await chrome.storage.sync.set(request.settings);
                    sendResponse({ success: true });
                    break;

                case 'getVersion':
                    sendResponse({ version: this.version });
                    break;

                case 'getTabState':
                    const tabState = this.tabStates.get(sender.tab?.id);
                    sendResponse({ tabState: tabState || {} });
                    break;

                case 'setTabState':
                    if (sender.tab?.id) {
                        this.tabStates.set(sender.tab.id, request.state);
                        sendResponse({ success: true });
                    }
                    break;

                case 'trackUsage':
                    await this.trackUsage(request.event, request.data);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ error: 'פעולה לא מזוהה' });
            }
        } catch (error) {
            console.error('שגיאה בטיפול בהודעה:', error);
            sendResponse({ error: error.message });
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // עדכון כאשר טאב נטען
        if (changeInfo.status === 'complete' && tab.url?.includes('genspark.ai')) {
            console.log(`טאב Genspark נטען: ${tabId}`);

            // אתחל מצב טאב
            this.tabStates.set(tabId, {
                url: tab.url,
                title: tab.title,
                loadTime: new Date().toISOString()
            });
        }
    }

    handleTabRemoved(tabId) {
        // נקה מצב טאב שנסגר
        if (this.tabStates.has(tabId)) {
            console.log(`מנקה מצב עבור טאב: ${tabId}`);
            this.tabStates.delete(tabId);
        }
    }

    handleWindowClosed(windowId) {
        // נקה טאבים של חלון שנסגר
        const tabsToRemove = [];

        this.tabStates.forEach((state, tabId) => {
            // בדוק אם הטאב שייך לחלון שנסגר
            chrome.tabs.get(tabId).catch(() => {
                tabsToRemove.push(tabId);
            });
        });

        tabsToRemove.forEach(tabId => {
            this.tabStates.delete(tabId);
        });
    }

    async trackUsage(eventType, data = {}) {
        try {
            const usageData = {
                event: eventType,
                timestamp: new Date().toISOString(),
                version: this.version,
                ...data
            };

            // שמור נתוני שימוש (מקומי בלבד)
            const usage = await chrome.storage.local.get('usage') || { usage: [] };
            usage.usage = usage.usage || [];
            usage.usage.push(usageData);

            // שמור רק 1000 אירועים אחרונים
            if (usage.usage.length > 1000) {
                usage.usage = usage.usage.slice(-1000);
            }

            await chrome.storage.local.set({ usage: usage.usage });

            console.log('נתוני שימוש נשמרו:', usageData);

        } catch (error) {
            console.error('שגיאה במעקב שימוש:', error);
        }
    }

    showWelcomeNotification() {
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'ברוכים הבאים ל-Genspark Conversation Manager!',
                message: 'התוסף הותקן בהצלחה. כעת תוכלו לחפש, להוריד ולנהל את השיחות שלכם מ-Genspark.ai'
            });
        }
    }

    showUpdateNotification(previousVersion) {
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Genspark Conversation Manager עודכן!',
                message: `התוסף עודכן מגרסה ${previousVersion} לגרסה ${this.version} עם פיצ'רים חדשים`
            });
        }
    }

    // פונקציות עזר
    async isGensparkTab(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            return tab.url?.includes('genspark.ai');
        } catch {
            return false;
        }
    }

    async getActiveGensparkTabs() {
        const tabs = await chrome.tabs.query({ 
            url: ['*://genspark.ai/*', '*://*.genspark.ai/*'] 
        });

        return tabs;
    }

    async injectContentScript(tabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['content.js']
            });

            console.log(`Content script הוזרק לטאב: ${tabId}`);
            return true;

        } catch (error) {
            console.error('שגיאה בהזרקת סקריפט:', error);
            return false;
        }
    }
}

// אתחול שירות הרקע
const backgroundService = new BackgroundService();

// טיפול בשגיאות גלובליות
self.addEventListener('error', (event) => {
    console.error('Background service error:', event.error);
});

// התכוננות להשעיה (Service Worker lifecycle)
self.addEventListener('beforeunload', () => {
    console.log('Background service נכנס להשעיה');
});

console.log('🚀 Genspark Conversation Manager Background Service v2.5 פעיל');