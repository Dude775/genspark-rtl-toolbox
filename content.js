/**
 * Genspark Conversation Manager v2.5 - Content Script
 * ניהול מתקדם של שיחות Genspark - הורדה, חיפוש, שמירה וניהול שיחות
 */

class GensparkRTLToolbox {
    constructor() {
        this.isInitialized = false;
        this.conversations = [];

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

        console.log('🚀 Genspark Conversation Manager v2.5 מתחיל...');

        // המתן לטעינת הדף
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        this.isInitialized = true;
    }

    setup() {
        this.addDownloadButton();
        this.setupMessageListeners();
        this.observeChanges();

        console.log('✅ Genspark Conversation Manager v2.5 הופעל בהצלחה');
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

    // חיפוש בשיחות (בשיחה הנוכחית)
    searchConversation(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const conversations = this.extractConversation();
        const searchQuery = query.toLowerCase().trim();
        const results = [];

        conversations.forEach((msg, index) => {
            const content = msg.content.toLowerCase();

            if (content.includes(searchQuery)) {
                // מצא את המיקום של המילה
                const startIndex = content.indexOf(searchQuery);

                // קח קטע מסביב למילה (50 תווים לפני ואחרי)
                const start = Math.max(0, startIndex - 50);
                const end = Math.min(msg.content.length, startIndex + searchQuery.length + 50);
                let snippet = msg.content.substring(start, end);

                // הוסף ... אם יש עוד טקסט
                if (start > 0) snippet = '...' + snippet;
                if (end < msg.content.length) snippet = snippet + '...';

                results.push({
                    index: index,
                    type: msg.type,
                    content: msg.content,
                    snippet: snippet,
                    matchPosition: startIndex
                });
            }
        });

        console.log(`🔍 נמצאו ${results.length} תוצאות עבור: "${query}"`);
        return results;
    }

    // חילוץ כל השיחות מהסיידבר
    extractAllConversations() {
        console.log('📋 מחלץ כל השיחות מהסיידבר...');

        const conversations = [];

        // סלקטורים לאיתור פריטי תפריט בסיידבר
        const sidebarSelectors = [
            '.menu-item',
            '[class*="menu-item"]',
            '[class*="conversation-item"]',
            '[class*="chat-item"]',
            'li[role="menuitem"]',
            '.sidebar-item',
            '[data-conversation-id]'
        ];

        let menuItems = [];

        // נסה למצוא פריטי תפריט
        for (const selector of sidebarSelectors) {
            try {
                const items = document.querySelectorAll(selector);
                if (items.length > 0) {
                    menuItems = Array.from(items);
                    console.log(`✅ נמצאו ${items.length} פריטים עם הסלקטור: ${selector}`);
                    break;
                }
            } catch (e) {
                console.warn(`Selector failed: ${selector}`, e);
            }
        }

        // אם לא נמצא, חפש בצורה יותר כללית
        if (menuItems.length === 0) {
            console.log('🔍 מחפש פריטים בדרך כללית...');
            const sidebar = document.querySelector('aside, [role="navigation"], .sidebar, nav');
            if (sidebar) {
                menuItems = Array.from(sidebar.querySelectorAll('li, div[role="button"], a'));
                console.log(`📌 נמצאו ${menuItems.length} פריטים פוטנציאליים בסיידבר`);
            }
        }

        menuItems.forEach((item, index) => {
            try {
                // חלץ טקסט
                const text = item.textContent || item.innerText || '';

                // דלג על פריטים ריקים או קצרים מדי
                if (text.trim().length < 3) return;

                // נסה לחלץ כותרת
                const titleElement = item.querySelector('h1, h2, h3, h4, h5, h6, .title, [class*="title"], strong, b');
                const title = titleElement ? titleElement.textContent.trim() : text.split('\n')[0].trim();

                // נסה לחלץ תאריך
                const dateElement = item.querySelector('time, .date, [class*="date"], [class*="time"], small');
                const date = dateElement ? dateElement.textContent.trim() : '';

                // נסה לחלץ URL או ID
                const link = item.querySelector('a');
                const url = link ? link.href : '';
                const id = item.getAttribute('data-conversation-id') ||
                          item.getAttribute('data-id') ||
                          item.id ||
                          `item-${index}`;

                // שמור את האלמנט DOM למטרת ניווט
                conversations.push({
                    id: id,
                    title: title,
                    date: date,
                    fullText: text.trim(),
                    url: url,
                    element: item,
                    index: index
                });

            } catch (e) {
                console.warn('שגיאה בעיבוד פריט:', e);
            }
        });

        console.log(`✅ חולצו ${conversations.length} שיחות מהסיידבר`);
        return conversations;
    }

    // חיפוש חכם בכל השיחות (סיידבר)
    searchAllConversations(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const allConversations = this.extractAllConversations();
        const searchQuery = query.toLowerCase().trim();
        const results = [];

        // פונקצית התאמה גמישה
        const fuzzyMatch = (text, query) => {
            const lowerText = text.toLowerCase();

            // התאמה מדויקת
            if (lowerText.includes(query)) {
                return { match: true, score: 100, exactMatch: true };
            }

            // התאמה חלקית - מילים נפרדות
            const queryWords = query.split(/\s+/);
            const matchedWords = queryWords.filter(word =>
                lowerText.includes(word) && word.length > 2
            );

            if (matchedWords.length > 0) {
                const score = (matchedWords.length / queryWords.length) * 80;
                return { match: true, score: score, exactMatch: false };
            }

            // התאמה fuzzy - אותיות סמוכות
            let matchScore = 0;
            let lastIndex = -1;

            for (const char of query) {
                const index = lowerText.indexOf(char, lastIndex + 1);
                if (index > lastIndex) {
                    matchScore++;
                    lastIndex = index;
                }
            }

            const fuzzyScore = (matchScore / query.length) * 60;
            if (fuzzyScore > 40) {
                return { match: true, score: fuzzyScore, exactMatch: false };
            }

            return { match: false, score: 0 };
        };

        allConversations.forEach((conversation) => {
            // חפש בכותרת
            const titleMatch = fuzzyMatch(conversation.title, searchQuery);

            // חפש בטקסט המלא
            const textMatch = fuzzyMatch(conversation.fullText, searchQuery);

            // קח את ההתאמה הטובה ביותר
            const bestMatch = titleMatch.score > textMatch.score ? titleMatch : textMatch;

            if (bestMatch.match) {
                // צור snippet עם הקשר
                let snippet = '';
                const lowerFullText = conversation.fullText.toLowerCase();
                const matchIndex = lowerFullText.indexOf(searchQuery);

                if (matchIndex !== -1) {
                    const start = Math.max(0, matchIndex - 40);
                    const end = Math.min(conversation.fullText.length, matchIndex + searchQuery.length + 40);
                    snippet = conversation.fullText.substring(start, end);

                    if (start > 0) snippet = '...' + snippet;
                    if (end < conversation.fullText.length) snippet = snippet + '...';
                } else {
                    // אם אין התאמה מדויקת, קח את ההתחלה
                    snippet = conversation.title;
                }

                results.push({
                    ...conversation,
                    snippet: snippet,
                    matchScore: bestMatch.score,
                    exactMatch: bestMatch.exactMatch,
                    matchedIn: titleMatch.score > textMatch.score ? 'title' : 'content'
                });
            }
        });

        // מיין לפי ציון התאמה
        results.sort((a, b) => b.matchScore - a.matchScore);

        console.log(`🔍 נמצאו ${results.length} שיחות עבור: "${query}"`);
        return results;
    }

    // ניווט לשיחה בסיידבר
    navigateToConversation(conversationId) {
        const allConversations = this.extractAllConversations();
        const conversation = allConversations.find(c => c.id === conversationId);

        if (!conversation || !conversation.element) {
            console.error('❌ לא נמצאה שיחה עם ID:', conversationId);
            return;
        }

        // גלול לשיחה בסיידבר
        conversation.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // הדגש את השיחה
        const originalBg = conversation.element.style.backgroundColor;
        const originalBorder = conversation.element.style.border;

        conversation.element.style.transition = 'all 0.3s';
        conversation.element.style.backgroundColor = '#fff3cd';
        conversation.element.style.border = '2px solid #667eea';

        setTimeout(() => {
            conversation.element.style.backgroundColor = originalBg;
            conversation.element.style.border = originalBorder;
        }, 2000);

        // אם יש לינק, לחץ עליו לפתיחת השיחה
        const link = conversation.element.querySelector('a');
        if (link) {
            setTimeout(() => {
                link.click();
                console.log('✅ נווטתי לשיחה:', conversation.title);
            }, 500);
        }
    }

    // הדגשת הודעה בדף (בשיחה הנוכחית)
    highlightMessage(messageIndex) {
        const conversations = this.extractConversation();

        if (messageIndex < 0 || messageIndex >= conversations.length) {
            console.error('אינדקס הודעה לא תקין:', messageIndex);
            return;
        }

        const message = conversations[messageIndex];

        // מצא את האלמנט המתאים בדף
        const allMessages = [
            ...this.findElements(this.selectors.userMessage),
            ...this.findElements(this.selectors.assistantMessage)
        ];

        // מיין לפי סדר בדף
        const sortedMessages = allMessages.sort((a, b) => {
            return this.getElementOrder(a) - this.getElementOrder(b);
        });

        if (sortedMessages[messageIndex]) {
            const element = sortedMessages[messageIndex];

            // גלול אל ההודעה
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // הוסף הדגשה זמנית
            element.style.transition = 'background-color 0.3s';
            const originalBg = element.style.backgroundColor;
            element.style.backgroundColor = '#fff3cd';

            setTimeout(() => {
                element.style.backgroundColor = originalBg;
            }, 2000);

            console.log('✅ הודעה הודגשה בהצלחה');
        }
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
                    sendResponse({ status: 'active', version: '2.5' });
                    break;

                case 'download':
                    this.downloadConversation(request.format || 'both');
                    sendResponse({ success: true });
                    break;

                case 'getStats':
                    const conversations = this.extractConversation();
                    sendResponse({
                        messageCount: conversations.length
                    });
                    break;

                case 'search':
                    const searchResults = this.searchConversation(request.query);
                    sendResponse({
                        success: true,
                        results: searchResults
                    });
                    break;

                case 'searchAll':
                    const allResults = this.searchAllConversations(request.query);
                    sendResponse({
                        success: true,
                        results: allResults
                    });
                    break;

                case 'navigateToConversation':
                    this.navigateToConversation(request.conversationId);
                    sendResponse({ success: true });
                    break;

                case 'getAllConversations':
                    const allConversations = this.extractAllConversations();
                    sendResponse({
                        success: true,
                        count: allConversations.length,
                        conversations: allConversations.map(c => ({
                            id: c.id,
                            title: c.title,
                            date: c.date
                        }))
                    });
                    break;

                case 'saveConversation':
                    this.saveCurrentConversation()
                        .then(result => sendResponse(result))
                        .catch(error => sendResponse({ success: false, error: error.message }));
                    return true; // Keep connection open for async response
                    break;

                case 'highlightMessage':
                    this.highlightMessage(request.index);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }

            return true; // שמור על החיבור עבור תגובה אסינכרונית
        });
    }

    async saveCurrentConversation() {
        try {
            console.log('💾 שומר שיחה נוכחית...');

            // חלץ את השיחה הנוכחית
            const messages = this.extractConversation();

            if (!messages || messages.length === 0) {
                throw new Error('לא נמצאו הודעות לשמירה');
            }

            // צור מזהה ייחודי לשיחה
            const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // חלץ כותרת שיחה
            const title = this.getConversationTitle() || `שיחה מ-${new Date().toLocaleDateString('he-IL')}`;

            // צור אובייקט שיחה
            const conversation = {
                id: conversationId,
                title: title,
                url: window.location.href,
                savedAt: new Date().toISOString(),
                messageCount: messages.length,
                messages: messages
            };

            // שמור ב-chrome.storage.local
            const stored = await chrome.storage.local.get(['savedConversations']);
            const savedConversations = stored.savedConversations || [];

            savedConversations.push(conversation);

            await chrome.storage.local.set({ savedConversations: savedConversations });

            console.log('✅ שיחה נשמרה בהצלחה:', conversationId);

            return {
                success: true,
                conversationId: conversationId,
                messageCount: messages.length,
                title: title
            };

        } catch (error) {
            console.error('❌ שגיאה בשמירת שיחה:', error);
            throw error;
        }
    }

    getConversationTitle() {
        // נסה למצוא כותרת שיחה
        for (const selector of this.selectors.chatTitle) {
            const titleElement = document.querySelector(selector);
            if (titleElement && titleElement.textContent.trim()) {
                return titleElement.textContent.trim();
            }
        }

        // אם לא נמצא כותרת, השתמש בהודעה הראשונה
        const firstMessage = this.extractConversation()[0];
        if (firstMessage && firstMessage.text) {
            return firstMessage.text.substring(0, 50) + (firstMessage.text.length > 50 ? '...' : '');
        }

        return null;
    }
}

// אתחול התוסף
if (typeof window !== 'undefined') {
    // וודא שהתוסף לא רץ כבר
    if (!window.gensparkConversationManager) {
        window.gensparkConversationManager = new GensparkRTLToolbox();
        console.log('🎯 Genspark Conversation Manager v2.5 אותחל');
    }
}