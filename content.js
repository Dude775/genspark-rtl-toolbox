/**
 * Genspark RTL Toolbox v2.3 - Content Script
 * תוסף לתמיכה בעברית ו-RTL באתר Genspark.ai עם יכולות הורדת שיחות מתקדמות
 */

class GensparkRTLToolbox {
    constructor() {
        this.isInitialized = false;
        this.conversations = [];
        this.rtlEnabled = true;

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

    setup() {
        this.applyRTLStyles();
        this.addDownloadButton();
        this.setupMessageListeners();
        this.observeChanges();

        // הוסף ping handler
        this.setupPingHandler();

        console.log('✅ Genspark RTL Toolbox v2.3 הופעל בהצלחה');
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
        } else {
            document.documentElement.classList.remove('genspark-rtl-enabled');
        }

        // שמור הגדרה
        chrome.storage.sync.set({ rtlEnabled: this.rtlEnabled });

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
                    sendResponse({ status: 'active', version: '2.3' });
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
                    sendResponse({ 
                        messageCount: conversations.length,
                        rtlEnabled: this.rtlEnabled
                    });
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }

            return true; // שמור על החיבור עבור תגובה אסינכרונית
        });
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