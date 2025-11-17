/**
 * Genspark RTL Toolbox v2.4 - Content Script
 * תוסף לתמיכה בעברית ו-RTL באתר Genspark.ai עם יכולות הורדת שיחות מתקדמות
 * תכונה חדשה: מנהל שיחות - ניהול והורדה של כל השיחות
 */

class GensparkRTLToolbox {
    constructor() {
        this.isInitialized = false;
        this.conversations = [];
        this.rtlEnabled = true;
        this.conversationManager = {
            enabled: true,
            autoSave: true,
            conversations: new Map(),
            currentConversationId: null
        };

        // סלקטורים מתוקנים עבור Genspark
        this.selectors = {
            // ממשק עיקרי
            mainContent: 'main, [role="main"], .main-content, #main-content',
            chatContainer: '.chat-container, .conversation-container, .messages-container, [data-testid="chat-container"]',

            // הודעות משתמש ו-AI
            userMessage: [
                '[data-testid="user-message"]',
                '.user-message',
                '[role="user"]',
                '.message[data-role="user"]',
                '.message.user',
                '.user-bubble',
                'div[class*="user"]',
                'div[data-message-type="user"]'
            ],

            assistantMessage: [
                '[data-testid="assistant-message"]', 
                '[data-testid="ai-message"]',
                '.assistant-message',
                '.ai-message',
                '[role="assistant"]',
                '.message[data-role="assistant"]',
                '.message.assistant',
                '.ai-bubble',
                'div[class*="assistant"]',
                'div[class*="ai-response"]',
                'div[data-message-type="assistant"]',
                'div[data-message-type="ai"]'
            ],

            messageContent: [
                '.message-content',
                '[data-testid="message-content"]',
                '.content',
                '.text-content',
                'p, span, div[class*="text"]'
            ],

            // כותרות ומידע נוסף
            chatTitle: [
                'h1',
                '.chat-title',
                '[data-testid="chat-title"]',
                '.conversation-title',
                'header h1, header h2',
                '.title'
            ],

            timestamp: [
                '.timestamp',
                '[data-testid="timestamp"]',
                '.message-time',
                '.time',
                'time'
            ]
        };

        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        console.log('🚀 Genspark RTL Toolbox v2.3 מתחיל...');

        // המתן לטעינת הדף
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        this.isInitialized = true;
    }

    async setup() {
        // טען הגדרות מהאחסון
        await this.loadSettings();
        await this.loadSavedConversations();

        this.applyRTLStyles();
        this.addDownloadButton();
        this.setupMessageListeners();
        this.observeChanges();

        // הוסף ping handler
        this.setupPingHandler();

        console.log('✅ Genspark RTL Toolbox v2.4 הופעל בהצלחה');
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get(['rtlEnabled']);
            if (typeof settings.rtlEnabled === 'boolean') {
                this.rtlEnabled = settings.rtlEnabled;
            }
        } catch (error) {
            console.warn('לא ניתן לטעון הגדרות:', error);
        }
    }

    setupPingHandler() {
        // מאזין לבדיקות חיבור מהפופאפ
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'ping') {
                sendResponse({ status: 'active', version: '2.3' });
                return true;
            }

            if (request.action === 'download') {
                this.downloadConversation(request.format || 'both');
                sendResponse({ success: true });
                return true;
            }

            if (request.action === 'toggleRTL') {
                this.toggleRTL();
                sendResponse({ rtlEnabled: this.rtlEnabled });
                return true;
            }
        });
    }

    // זיהוי הודעות עם סלקטורים מרובים
    findElements(selectorList, parent = document) {
        const elements = [];

        if (Array.isArray(selectorList)) {
            for (const selector of selectorList) {
                try {
                    const found = parent.querySelectorAll(selector);
                    elements.push(...found);
                } catch (e) {
                    console.warn(`Selector failed: ${selector}`, e);
                }
            }
        } else {
            try {
                const found = parent.querySelectorAll(selectorList);
                elements.push(...found);
            } catch (e) {
                console.warn(`Selector failed: ${selectorList}`, e);
            }
        }

        // הסרת כפילויות
        return [...new Set(elements)];
    }

    // חילוץ תוכן השיחה המתוקן
    extractConversation() {
        console.log('🔍 מחלץ תוכן שיחה...');

        const conversations = [];

        // חפש הודעות משתמש
        const userMessages = this.findElements(this.selectors.userMessage);
        console.log(`נמצאו ${userMessages.length} הודעות משתמש`);

        // חפש הודעות AI
        const aiMessages = this.findElements(this.selectors.assistantMessage);
        console.log(`נמצאו ${aiMessages.length} הודעות AI`);

        // עבד הודעות משתמש
        userMessages.forEach((element, index) => {
            const content = this.extractMessageContent(element);
            if (content.trim()) {
                conversations.push({
                    type: 'user',
                    content: content,
                    timestamp: this.extractTimestamp(element),
                    order: this.getElementOrder(element),
                    index: index
                });
            }
        });

        // עבד הודעות AI
        aiMessages.forEach((element, index) => {
            const content = this.extractMessageContent(element);
            if (content.trim()) {
                conversations.push({
                    type: 'assistant', 
                    content: content,
                    timestamp: this.extractTimestamp(element),
                    order: this.getElementOrder(element),
                    index: index
                });
            }
        });

        // מיין לפי סדר בדף
        conversations.sort((a, b) => a.order - b.order);

        console.log(`✅ חולצו ${conversations.length} הודעות בסך הכל`);
        return conversations;
    }

    // חילוץ תוכן מהודעה בודדת
    extractMessageContent(messageElement) {
        // נסה למצוא תוכן ספציפי
        const contentElements = this.findElements(this.selectors.messageContent, messageElement);

        if (contentElements.length > 0) {
            return contentElements.map(el => el.textContent || el.innerText).join('\n').trim();
        }

        // אם לא נמצא תוכן ספציפי, קח את כל הטקסט
        const textContent = messageElement.textContent || messageElement.innerText || '';

        // סנן כפתורים ואלמנטי ממשק
        const filteredContent = this.filterUIElements(textContent);

        return filteredContent.trim();
    }

    // סינון אלמנטי ממשק
    filterUIElements(text) {
        const uiPatterns = [
            /^(copy|העתק|שתף|share|like|אהבתי|download|הורד|reply|השב)$/i,
            /^\d+\s*(likes?|אהבות?)$/i,
            /^(\d{1,2}:\d{2}|\d{1,2}:\d{2}:\d{2})$/,
            /^(today|היום|yesterday|אתמול)$/i,
            /^[\s\n]*$/
        ];

        const lines = text.split('\n').filter(line => {
            const cleaned = line.trim();
            if (!cleaned) return false;

            return !uiPatterns.some(pattern => pattern.test(cleaned));
        });

        return lines.join('\n');
    }

    // חילוץ זמן
    extractTimestamp(element) {
        const timestampElements = this.findElements(this.selectors.timestamp, element);

        if (timestampElements.length > 0) {
            return timestampElements[0].textContent || timestampElements[0].getAttribute('datetime') || '';
        }

        return new Date().toISOString();
    }

    // קבלת סדר האלמנט בדף
    getElementOrder(element) {
        const rect = element.getBoundingClientRect();
        return rect.top + (rect.left * 0.001); // מיון לפי מיקום בדף
    }

    // הורדת השיחה
    async downloadConversation(format = 'both') {
        try {
            const conversations = this.extractConversation();

            if (conversations.length === 0) {
                alert('לא נמצא תוכן שיחה להורדה');
                return;
            }

            const title = this.getPageTitle();
            const timestamp = new Date().toISOString().split('T')[0];

            if (format === 'json' || format === 'both') {
                await this.downloadJSON(conversations, `${title}_${timestamp}.json`);
            }

            if (format === 'txt' || format === 'both') {
                await this.downloadTXT(conversations, `${title}_${timestamp}.txt`);
            }

            console.log(`✅ השיחה הורדה בהצלחה (${conversations.length} הודעות)`);

        } catch (error) {
            console.error('❌ שגיאה בהורדת השיחה:', error);
            alert('שגיאה בהורדת השיחה: ' + error.message);
        }
    }

    async downloadJSON(conversations, filename) {
        const data = {
            title: this.getPageTitle(),
            url: window.location.href,
            timestamp: new Date().toISOString(),
            messageCount: conversations.length,
            conversations: conversations
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json;charset=utf-8'
        });

        this.downloadBlob(blob, filename);
    }

    async downloadTXT(conversations, filename) {
        let content = `שיחה מ-Genspark.ai\n`;
        content += `כותרת: ${this.getPageTitle()}\n`;
        content += `URL: ${window.location.href}\n`;
        content += `תאריך: ${new Date().toLocaleString('he-IL')}\n`;
        content += `מספר הודעות: ${conversations.length}\n`;
        content += `${'='.repeat(50)}\n\n`;

        conversations.forEach((msg, index) => {
            const speaker = msg.type === 'user' ? '👤 משתמש' : '🤖 AI';
            content += `${speaker} (${index + 1}):\n`;
            content += `${msg.content}\n\n`;
            content += `${'-'.repeat(30)}\n\n`;
        });

        const blob = new Blob([content], {
            type: 'text/plain;charset=utf-8'
        });

        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getPageTitle() {
        // נסה למצוא כותרת
        const titleElements = this.findElements(this.selectors.chatTitle);

        if (titleElements.length > 0) {
            const title = titleElements[0].textContent.trim();
            if (title) return title;
        }

        // חזור לכותרת הדף
        return document.title || 'genspark_conversation';
    }

    // הוספת כפתור הורדה
    addDownloadButton() {
        // הסר כפתור קיים אם יש
        const existingButton = document.getElementById('genspark-download-btn');
        if (existingButton) {
            existingButton.remove();
        }

        const button = document.createElement('button');
        button.id = 'genspark-download-btn';
        button.innerHTML = '📥 הורד שיחה';
        button.title = 'הורד את השיחה הנוכחית';

        // עיצוב הכפתור
        Object.assign(button.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
        });

        // אפקטי הובר
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#005a9e';
            button.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#007acc';
            button.style.transform = 'translateY(0)';
        });

        // פונקציונליות
        button.addEventListener('click', () => this.downloadConversation('both'));

        document.body.appendChild(button);
    }

    // החלת סגנונות RTL
    applyRTLStyles() {
        if (!this.rtlEnabled) return;

        // הוסף מחלקת RTL לגוף הדף
        document.documentElement.classList.add('genspark-rtl-enabled');

        console.log('✅ סגנונות RTL הופעלו');
    }

    toggleRTL() {
        this.rtlEnabled = !this.rtlEnabled;

        if (this.rtlEnabled) {
            document.documentElement.classList.add('genspark-rtl-enabled');
            document.body.classList.add('genspark-rtl-enabled');
        } else {
            document.documentElement.classList.remove('genspark-rtl-enabled');
            document.body.classList.remove('genspark-rtl-enabled');

            // אפס מפורש את הכיוון
            document.documentElement.style.direction = 'ltr';
            document.body.style.direction = 'ltr';

            // אפס אחרי זמן קצר כדי לאפשר לדף לחזור למצבו הטבעי
            setTimeout(() => {
                document.documentElement.style.direction = '';
                document.body.style.direction = '';
            }, 100);
        }

        // שמור הגדרה
        chrome.storage.sync.set({ rtlEnabled: this.rtlEnabled });

        // כפה עדכון תצוגה
        document.body.offsetHeight; // Force reflow

        console.log(`RTL ${this.rtlEnabled ? 'הופעל' : 'הושבת'}`);
    }

    // מאזין לשינויים בדף
    observeChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });

            if (shouldUpdate) {
                // עדכן כפתור הורדה אם נעלם
                setTimeout(() => {
                    if (!document.getElementById('genspark-download-btn')) {
                        this.addDownloadButton();
                    }
                }, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupMessageListeners() {
        // מאזין להודעות מהפופאפ ומהbackground
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('📨 הודעה התקבלה:', request);

            switch (request.action) {
                case 'ping':
                    sendResponse({ status: 'active', version: '2.4' });
                    break;

                case 'download':
                    this.downloadConversation(request.format || 'both');
                    sendResponse({ success: true });
                    break;

                case 'toggleRTL':
                    this.toggleRTL();
                    sendResponse({ rtlEnabled: this.rtlEnabled });
                    break;

                case 'getStats':
                    const conversations = this.extractConversation();
                    this.getAllSavedConversations().then(result => {
                        sendResponse({
                            messageCount: conversations.length,
                            rtlEnabled: this.rtlEnabled,
                            savedConversations: result.success ? result.conversations.length : 0
                        });
                    });
                    return true; // async response

                case 'saveCurrentConversation':
                    this.saveCurrentConversation().then(result => {
                        sendResponse(result);
                    });
                    return true; // async response

                case 'getAllConversations':
                    this.getAllSavedConversations().then(result => {
                        sendResponse(result);
                    });
                    return true; // async response

                case 'deleteConversation':
                    this.deleteConversation(request.conversationId).then(result => {
                        sendResponse(result);
                    });
                    return true; // async response

                case 'downloadAllConversations':
                    this.downloadAllConversations(request.format || 'json').then(result => {
                        sendResponse(result);
                    });
                    return true; // async response

                default:
                    sendResponse({ error: 'Unknown action' });
            }

            return true; // שמור על החיבור עבור תגובה אסינכרונית
        });
    }

    // ========== מנהל שיחות - פונקציות חדשות ==========

    async saveCurrentConversation() {
        try {
            const conversations = this.extractConversation();

            if (conversations.length === 0) {
                return { success: false, error: 'אין שיחה לשמור' };
            }

            const conversationId = this.generateConversationId();
            const conversationData = {
                id: conversationId,
                title: this.getPageTitle(),
                url: window.location.href,
                timestamp: new Date().toISOString(),
                messageCount: conversations.length,
                messages: conversations,
                savedAt: new Date().toISOString()
            };

            // שמור ב-localStorage ו-chrome.storage
            await this.saveConversationToStorage(conversationData);

            console.log('✅ שיחה נשמרה:', conversationId);
            return { success: true, conversationId, messageCount: conversations.length };

        } catch (error) {
            console.error('❌ שגיאה בשמירת שיחה:', error);
            return { success: false, error: error.message };
        }
    }

    async saveConversationToStorage(conversationData) {
        // שמור ב-chrome.storage.local
        const storageKey = `conversation_${conversationData.id}`;
        const indexKey = 'conversation_index';

        // שמור את השיחה
        await chrome.storage.local.set({ [storageKey]: conversationData });

        // עדכן אינדקס
        const result = await chrome.storage.local.get([indexKey]);
        const index = result[indexKey] || [];

        const indexEntry = {
            id: conversationData.id,
            title: conversationData.title,
            url: conversationData.url,
            timestamp: conversationData.timestamp,
            messageCount: conversationData.messageCount,
            savedAt: conversationData.savedAt
        };

        // הוסף או עדכן באינדקס
        const existingIndex = index.findIndex(item => item.id === conversationData.id);
        if (existingIndex >= 0) {
            index[existingIndex] = indexEntry;
        } else {
            index.push(indexEntry);
        }

        await chrome.storage.local.set({ [indexKey]: index });

        // עדכן את המפה המקומית
        this.conversationManager.conversations.set(conversationData.id, conversationData);
    }

    async getAllSavedConversations() {
        try {
            const indexKey = 'conversation_index';
            const result = await chrome.storage.local.get([indexKey]);
            const index = result[indexKey] || [];

            // מיין לפי תאריך (החדשות ביותר ראשונות)
            index.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

            return { success: true, conversations: index };

        } catch (error) {
            console.error('❌ שגיאה בטעינת שיחות:', error);
            return { success: false, error: error.message, conversations: [] };
        }
    }

    async deleteConversation(conversationId) {
        try {
            const storageKey = `conversation_${conversationId}`;
            const indexKey = 'conversation_index';

            // מחק את השיחה
            await chrome.storage.local.remove([storageKey]);

            // עדכן אינדקס
            const result = await chrome.storage.local.get([indexKey]);
            const index = result[indexKey] || [];
            const updatedIndex = index.filter(item => item.id !== conversationId);
            await chrome.storage.local.set({ [indexKey]: updatedIndex });

            // עדכן מפה מקומית
            this.conversationManager.conversations.delete(conversationId);

            console.log('✅ שיחה נמחקה:', conversationId);
            return { success: true };

        } catch (error) {
            console.error('❌ שגיאה במחיקת שיחה:', error);
            return { success: false, error: error.message };
        }
    }

    async downloadAllConversations(format = 'json') {
        try {
            const { success, conversations } = await this.getAllSavedConversations();

            if (!success || conversations.length === 0) {
                return { success: false, error: 'אין שיחות שמורות להורדה' };
            }

            // טען את כל השיחות המלאות
            const fullConversations = [];
            for (const conv of conversations) {
                const storageKey = `conversation_${conv.id}`;
                const result = await chrome.storage.local.get([storageKey]);
                if (result[storageKey]) {
                    fullConversations.push(result[storageKey]);
                }
            }

            const timestamp = new Date().toISOString().split('T')[0];

            if (format === 'json') {
                const data = {
                    exportDate: new Date().toISOString(),
                    totalConversations: fullConversations.length,
                    conversations: fullConversations
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json;charset=utf-8'
                });

                this.downloadBlob(blob, `genspark_all_conversations_${timestamp}.json`);
            } else if (format === 'txt') {
                let content = `כל השיחות מ-Genspark.ai\n`;
                content += `תאריך ייצוא: ${new Date().toLocaleString('he-IL')}\n`;
                content += `סך הכל שיחות: ${fullConversations.length}\n`;
                content += `${'='.repeat(70)}\n\n`;

                fullConversations.forEach((conv, index) => {
                    content += `\n${'#'.repeat(70)}\n`;
                    content += `שיחה ${index + 1} מתוך ${fullConversations.length}\n`;
                    content += `כותרת: ${conv.title}\n`;
                    content += `תאריך: ${new Date(conv.timestamp).toLocaleString('he-IL')}\n`;
                    content += `הודעות: ${conv.messageCount}\n`;
                    content += `${'#'.repeat(70)}\n\n`;

                    conv.messages.forEach((msg, msgIndex) => {
                        const speaker = msg.type === 'user' ? '👤 משתמש' : '🤖 AI';
                        content += `${speaker} (${msgIndex + 1}):\n`;
                        content += `${msg.content}\n\n`;
                        content += `${'-'.repeat(50)}\n\n`;
                    });
                });

                const blob = new Blob([content], {
                    type: 'text/plain;charset=utf-8'
                });

                this.downloadBlob(blob, `genspark_all_conversations_${timestamp}.txt`);
            }

            return { success: true, count: fullConversations.length };

        } catch (error) {
            console.error('❌ שגיאה בהורדת כל השיחות:', error);
            return { success: false, error: error.message };
        }
    }

    generateConversationId() {
        // צור ID ייחודי על בסיס URL ותאריך
        const url = window.location.href;
        const timestamp = Date.now();
        const hash = this.simpleHash(`${url}_${timestamp}`);
        return `conv_${hash}_${timestamp}`;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    async loadSavedConversations() {
        try {
            const { success, conversations } = await this.getAllSavedConversations();
            if (success) {
                console.log(`📚 נטענו ${conversations.length} שיחות שמורות`);
            }
        } catch (error) {
            console.warn('לא ניתן לטעון שיחות שמורות:', error);
        }
    }
}

// אתחול התוסף
if (typeof window !== 'undefined') {
    // וודא שהתוסף לא רץ כבר
    if (!window.gensparkRTLToolbox) {
        window.gensparkRTLToolbox = new GensparkRTLToolbox();
        console.log('🎯 Genspark RTL Toolbox v2.3 אותחל');
    }
}