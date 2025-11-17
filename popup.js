/**
 * Genspark RTL Toolbox v2.3 - Popup Script
 * לוגיקת ממשק המשתמש של התוסף
 */

class PopupManager {
    constructor() {
        this.isConnected = false;
        this.currentTab = null;
        this.stats = { messageCount: 0 };

        this.elements = {};
        this.init();
    }

    init() {
        this.bindElements();
        this.attachEventListeners();
        this.checkConnection();

        console.log('🎛️ Popup Manager אותחל');
    }

    bindElements() {
        this.elements = {
            statusCard: document.getElementById('statusCard'),
            statusTitle: document.getElementById('statusTitle'),
            statusInfo: document.getElementById('statusInfo'),
            statsGrid: document.getElementById('statsGrid'),
            messageCount: document.getElementById('messageCount'),
            downloadBtn: document.getElementById('downloadBtn'),
            downloadJsonBtn: document.getElementById('downloadJsonBtn'),
            downloadTxtBtn: document.getElementById('downloadTxtBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            toggleSearchBtn: document.getElementById('toggleSearchBtn'),
            searchContainer: document.getElementById('searchContainer'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            closeSearch: document.getElementById('closeSearch'),
            searchResults: document.getElementById('searchResults'),
            loading: document.getElementById('loading'),
            message: document.getElementById('message')
        };
    }

    attachEventListeners() {
        // כפתור הורדה כללית
        this.elements.downloadBtn?.addEventListener('click', () => {
            this.downloadConversation('both');
        });

        // הורדת JSON בלבד
        this.elements.downloadJsonBtn?.addEventListener('click', () => {
            this.downloadConversation('json');
        });

        // הורדת TXT בלבד
        this.elements.downloadTxtBtn?.addEventListener('click', () => {
            this.downloadConversation('txt');
        });

        // כפתור רענון
        this.elements.refreshBtn?.addEventListener('click', () => {
            this.refreshData();
        });

        // כפתור פתיחת חיפוש
        this.elements.toggleSearchBtn?.addEventListener('click', () => {
            this.toggleSearch();
        });

        // כפתור סגירת חיפוש
        this.elements.closeSearch?.addEventListener('click', () => {
            this.closeSearchPanel();
        });

        // כפתור חיפוש
        this.elements.searchBtn?.addEventListener('click', () => {
            this.performSearch();
        });

        // חיפוש בלחיצה על Enter
        this.elements.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    async checkConnection() {
        try {
            this.showLoading(true);
            this.updateStatus('🔍', 'בודק חיבור...', 'מחפש טאב פעיל של Genspark...');

            // קבל את הטאב הנוכחי
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tabs[0];

            if (!this.currentTab) {
                throw new Error('לא נמצא טאב פעיל');
            }

            // בדוק אם זה דף של Genspark
            if (!this.currentTab.url?.includes('genspark.ai')) {
                this.updateStatus('⚠️', 'לא בדף Genspark', 'התוסף פועל רק באתר genspark.ai');
                this.setButtonsEnabled(false);
                return;
            }

            // נסה לשלוח ping לתוסף
            const response = await this.sendMessageToTab('ping');

            if (response && response.status === 'active') {
                this.isConnected = true;
                this.updateStatus('✅', 'מחובר בהצלחה', `התוסף פועל (${response.version || 'לא ידוע'})`);
                this.setButtonsEnabled(true);
                await this.loadStats();
            } else {
                throw new Error('התוסף לא מגיב');
            }

        } catch (error) {
            console.error('Connection failed:', error);
            this.isConnected = false;
            this.updateStatus('❌', 'שגיאת חיבור', error.message || 'לא ניתן להתחבר לתוסף');
            this.setButtonsEnabled(false);
        } finally {
            this.showLoading(false);
        }
    }

    async sendMessageToTab(action, data = {}) {
        if (!this.currentTab?.id) {
            throw new Error('אין טאב פעיל');
        }

        try {
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: action,
                ...data
            });

            return response;
        } catch (error) {
            console.error('Message sending failed:', error);

            // נסה להזריק את הסקריפט אם הוא לא קיים
            if (error.message?.includes('Could not establish connection')) {
                await this.injectContentScript();

                // נסה שוב אחרי הזרקה
                return await chrome.tabs.sendMessage(this.currentTab.id, {
                    action: action,
                    ...data
                });
            }

            throw error;
        }
    }

    async injectContentScript() {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                files: ['content.js']
            });

            // המתן קצת לאתחול
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error('Script injection failed:', error);
            throw new Error('כשל בהזרקת הסקריפט');
        }
    }

    async loadStats() {
        try {
            const response = await this.sendMessageToTab('getStats');

            if (response) {
                this.stats = {
                    messageCount: response.messageCount || 0
                };

                this.updateStatsDisplay();
            }

        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStatsDisplay() {
        if (this.elements.messageCount) {
            this.elements.messageCount.textContent = this.stats.messageCount;
        }

        // הצג נתונים
        if (this.elements.statsGrid) {
            this.elements.statsGrid.style.display = 'grid';
        }
    }

    async downloadConversation(format) {
        try {
            if (!this.isConnected) {
                throw new Error('אין חיבור לתוסף');
            }

            this.showLoading(true);
            this.showMessage('מוריד שיחה...', 'info');

            const response = await this.sendMessageToTab('download', { format });

            if (response && response.success) {
                this.showMessage('✅ השיחה הורדה בהצלחה!', 'success');

                // רענן נתונים
                setTimeout(() => this.loadStats(), 1000);
            } else {
                throw new Error('כשל בהורדת השיחה');
            }

        } catch (error) {
            console.error('Download failed:', error);
            this.showMessage('❌ שגיאה בהורדה: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async refreshData() {
        this.showMessage('מרענן נתונים...', 'info');
        await this.checkConnection();
        this.showMessage('✅ נתונים עודכנו', 'success');
    }

    toggleSearch() {
        if (!this.isConnected) {
            this.showMessage('❌ אין חיבור לתוסף', 'error');
            return;
        }

        const isVisible = this.elements.searchContainer.style.display !== 'none';

        if (isVisible) {
            this.closeSearchPanel();
        } else {
            this.openSearchPanel();
        }
    }

    openSearchPanel() {
        this.elements.searchContainer.style.display = 'block';
        this.elements.searchInput.value = '';
        this.elements.searchResults.innerHTML = '';
        this.elements.searchInput.focus();
    }

    closeSearchPanel() {
        this.elements.searchContainer.style.display = 'none';
        this.elements.searchInput.value = '';
        this.elements.searchResults.innerHTML = '';
    }

    async performSearch() {
        const query = this.elements.searchInput.value.trim();

        if (!query) {
            this.showMessage('⚠️ נא להזין טקסט לחיפוש', 'error');
            return;
        }

        try {
            this.showLoading(true);
            this.elements.searchResults.innerHTML = '<div class="search-no-results">מחפש...</div>';

            const response = await this.sendMessageToTab('search', { query });

            if (response && response.success) {
                this.displaySearchResults(response.results, query);
            } else {
                throw new Error('כשל בחיפוש');
            }

        } catch (error) {
            console.error('Search failed:', error);
            this.showMessage('❌ שגיאה בחיפוש: ' + error.message, 'error');
            this.elements.searchResults.innerHTML = '<div class="search-no-results">שגיאה בחיפוש</div>';
        } finally {
            this.showLoading(false);
        }
    }

    displaySearchResults(results, query) {
        if (!results || results.length === 0) {
            this.elements.searchResults.innerHTML = '<div class="search-no-results">לא נמצאו תוצאות</div>';
            return;
        }

        let html = '';

        results.forEach((result) => {
            const typeLabel = result.type === 'user' ? '👤 משתמש' : '🤖 AI';

            // הדגש את המילה שחיפשנו
            const highlightedSnippet = this.highlightText(result.snippet, query);

            html += `
                <div class="search-result-item" data-index="${result.index}">
                    <div class="search-result-type">${typeLabel}</div>
                    <div class="search-result-content">${highlightedSnippet}</div>
                </div>
            `;
        });

        this.elements.searchResults.innerHTML = html;

        // הוסף event listeners לתוצאות
        this.elements.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.highlightMessageInPage(index);
            });
        });

        this.showMessage(`✅ נמצאו ${results.length} תוצאות`, 'success');
    }

    highlightText(text, query) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);

        if (index === -1) return text;

        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);

        return `${before}<span class="search-highlight">${match}</span>${after}`;
    }

    async highlightMessageInPage(index) {
        try {
            await this.sendMessageToTab('highlightMessage', { index });
            this.showMessage('✅ גלילה להודעה', 'success');
        } catch (error) {
            console.error('Highlight failed:', error);
            this.showMessage('❌ שגיאה בהדגשת הודעה', 'error');
        }
    }

    updateStatus(icon, title, info) {
        if (this.elements.statusTitle) {
            const iconSpan = this.elements.statusTitle.querySelector('.icon');
            if (iconSpan) iconSpan.textContent = icon;

            const titleText = this.elements.statusTitle.childNodes[1];
            if (titleText) titleText.textContent = title;
        }

        if (this.elements.statusInfo) {
            this.elements.statusInfo.textContent = info;
        }

        // שנה צבע כרטיס הסטטוס
        if (this.elements.statusCard) {
            this.elements.statusCard.style.borderRightColor = 
                icon === '✅' ? '#28a745' : 
                icon === '❌' ? '#dc3545' : 
                icon === '⚠️' ? '#ffc107' : '#007bff';
        }
    }

    setButtonsEnabled(enabled) {
        const buttons = [
            this.elements.downloadBtn,
            this.elements.downloadJsonBtn,
            this.elements.downloadTxtBtn,
            this.elements.toggleSearchBtn
        ];

        buttons.forEach(button => {
            if (button) {
                button.disabled = !enabled;
            }
        });
    }

    showLoading(show) {
        if (this.elements.loading) {
            this.elements.loading.style.display = show ? 'block' : 'none';
        }
    }

    showMessage(text, type = 'info') {
        if (!this.elements.message) return;

        this.elements.message.textContent = text;
        this.elements.message.className = type;
        this.elements.message.style.display = 'block';

        // הסתר הודעה אחרי 3 שניות
        setTimeout(() => {
            if (this.elements.message) {
                this.elements.message.style.display = 'none';
            }
        }, 3000);
    }
}

// אתחול כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// טיפול בשגיאות גלובליות
window.addEventListener('error', (event) => {
    console.error('Popup error:', event.error);
});

// Log לצורך דיבוג
console.log('🎮 Genspark Download Toolbox Popup v2.3 נטען');