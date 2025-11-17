/**
 * Genspark RTL Toolbox v2.4 - Popup Script
 * לוגיקת ממשק המשתמש של התוסף
 * תכונה חדשה: מנהל שיחות
 */

class PopupManager {
    constructor() {
        this.isConnected = false;
        this.currentTab = null;
        this.stats = { messageCount: 0, rtlEnabled: false, savedConversations: 0 };
        this.conversations = [];

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
            rtlStatus: document.getElementById('rtlStatus'),
            savedCount: document.getElementById('savedCount'),
            rtlToggle: document.getElementById('rtlToggle'),
            downloadBtn: document.getElementById('downloadBtn'),
            downloadJsonBtn: document.getElementById('downloadJsonBtn'),
            downloadTxtBtn: document.getElementById('downloadTxtBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            loading: document.getElementById('loading'),
            message: document.getElementById('message'),
            // Conversation Manager
            conversationManager: document.getElementById('conversationManager'),
            saveConversationBtn: document.getElementById('saveConversationBtn'),
            viewConversationsBtn: document.getElementById('viewConversationsBtn'),
            downloadAllBtn: document.getElementById('downloadAllBtn'),
            conversationsList: document.getElementById('conversationsList'),
            conversationsContainer: document.getElementById('conversationsContainer'),
            closeListBtn: document.getElementById('closeListBtn')
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

        // מתג RTL
        this.elements.rtlToggle?.addEventListener('click', () => {
            this.toggleRTL();
        });

        // Conversation Manager Events
        this.elements.saveConversationBtn?.addEventListener('click', () => {
            this.saveCurrentConversation();
        });

        this.elements.viewConversationsBtn?.addEventListener('click', () => {
            this.viewConversations();
        });

        this.elements.downloadAllBtn?.addEventListener('click', () => {
            this.downloadAllConversations();
        });

        this.elements.closeListBtn?.addEventListener('click', () => {
            this.closeConversationsList();
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
                    messageCount: response.messageCount || 0,
                    rtlEnabled: response.rtlEnabled || false,
                    savedConversations: response.savedConversations || 0
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

        if (this.elements.rtlStatus) {
            this.elements.rtlStatus.textContent = this.stats.rtlEnabled ? 'ON' : 'OFF';
        }

        if (this.elements.savedCount) {
            this.elements.savedCount.textContent = this.stats.savedConversations || 0;
        }

        // עדכן מתג RTL
        if (this.elements.rtlToggle) {
            if (this.stats.rtlEnabled) {
                this.elements.rtlToggle.classList.add('active');
            } else {
                this.elements.rtlToggle.classList.remove('active');
            }
        }

        // הצג נתונים
        if (this.elements.statsGrid) {
            this.elements.statsGrid.style.display = 'grid';
        }

        // הצג מנהל שיחות
        if (this.elements.conversationManager) {
            this.elements.conversationManager.style.display = 'block';
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

    async toggleRTL() {
        try {
            if (!this.isConnected) {
                throw new Error('אין חיבור לתוסף');
            }

            const response = await this.sendMessageToTab('toggleRTL');

            if (response && typeof response.rtlEnabled === 'boolean') {
                this.stats.rtlEnabled = response.rtlEnabled;
                this.updateStatsDisplay();

                const status = this.stats.rtlEnabled ? 'הופעל' : 'הושבת';
                this.showMessage(`RTL ${status}`, 'success');
            }

        } catch (error) {
            console.error('RTL toggle failed:', error);
            this.showMessage('❌ שגיאה בשינוי RTL: ' + error.message, 'error');
        }
    }

    async refreshData() {
        this.showMessage('מרענן נתונים...', 'info');
        await this.checkConnection();
        this.showMessage('✅ נתונים עודכנו', 'success');
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
            this.elements.saveConversationBtn
        ];

        buttons.forEach(button => {
            if (button) {
                button.disabled = !enabled;
            }
        });

        // RTL toggle
        if (this.elements.rtlToggle) {
            this.elements.rtlToggle.style.opacity = enabled ? '1' : '0.5';
            this.elements.rtlToggle.style.pointerEvents = enabled ? 'auto' : 'none';
        }
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

    // ========== Conversation Manager Methods ==========

    async saveCurrentConversation() {
        try {
            if (!this.isConnected) {
                throw new Error('אין חיבור לתוסף');
            }

            this.showLoading(true);
            this.showMessage('שומר שיחה...', 'info');

            const response = await this.sendMessageToTab('saveCurrentConversation');

            if (response && response.success) {
                this.showMessage(`✅ השיחה נשמרה בהצלחה! (${response.messageCount} הודעות)`, 'success');

                // עדכן נתונים
                await this.loadStats();
            } else {
                throw new Error(response?.error || 'כשל בשמירת השיחה');
            }

        } catch (error) {
            console.error('Save failed:', error);
            this.showMessage('❌ שגיאה בשמירה: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async viewConversations() {
        try {
            this.showLoading(true);

            const response = await this.sendMessageToTab('getAllConversations');

            if (response && response.success) {
                this.conversations = response.conversations;
                this.displayConversations();
            } else {
                throw new Error(response?.error || 'כשל בטעינת שיחות');
            }

        } catch (error) {
            console.error('View conversations failed:', error);
            this.showMessage('❌ שגיאה בטעינת שיחות: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayConversations() {
        if (!this.elements.conversationsContainer) return;

        // נקה רשימה קודמת
        this.elements.conversationsContainer.innerHTML = '';

        if (this.conversations.length === 0) {
            this.elements.conversationsContainer.innerHTML = '<div class="no-conversations">אין שיחות שמורות</div>';
        } else {
            this.conversations.forEach(conv => {
                const item = this.createConversationItem(conv);
                this.elements.conversationsContainer.appendChild(item);
            });
        }

        // הצג רשימה
        if (this.elements.conversationsList) {
            this.elements.conversationsList.style.display = 'flex';
        }
    }

    createConversationItem(conv) {
        const item = document.createElement('div');
        item.className = 'conversation-item';

        const title = document.createElement('div');
        title.className = 'conversation-title';
        title.textContent = conv.title || 'שיחה ללא כותרת';

        const meta = document.createElement('div');
        meta.className = 'conversation-meta';

        const date = new Date(conv.savedAt);
        const dateStr = date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        meta.innerHTML = `
            <span>${dateStr}</span>
            <span>${conv.messageCount} הודעות</span>
        `;

        const actions = document.createElement('div');
        actions.className = 'conversation-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'small-btn small-btn-danger';
        deleteBtn.textContent = '🗑️ מחק';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteConversation(conv.id);
        };

        const openBtn = document.createElement('button');
        openBtn.className = 'small-btn small-btn-info';
        openBtn.textContent = '🔗 פתח';
        openBtn.onclick = (e) => {
            e.stopPropagation();
            chrome.tabs.create({ url: conv.url });
        };

        actions.appendChild(openBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(title);
        item.appendChild(meta);
        item.appendChild(actions);

        return item;
    }

    async deleteConversation(conversationId) {
        try {
            if (!confirm('האם אתה בטוח שברצונך למחוק שיחה זו?')) {
                return;
            }

            this.showLoading(true);

            const response = await this.sendMessageToTab('deleteConversation', { conversationId });

            if (response && response.success) {
                this.showMessage('✅ השיחה נמחקה בהצלחה', 'success');

                // רענן רשימה
                await this.viewConversations();
                await this.loadStats();
            } else {
                throw new Error(response?.error || 'כשל במחיקת השיחה');
            }

        } catch (error) {
            console.error('Delete failed:', error);
            this.showMessage('❌ שגיאה במחיקה: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async downloadAllConversations() {
        try {
            if (!confirm('האם להוריד את כל השיחות השמורות?')) {
                return;
            }

            this.showLoading(true);
            this.showMessage('מוריד את כל השיחות...', 'info');

            // הורד גם JSON וגם TXT
            const jsonResponse = await this.sendMessageToTab('downloadAllConversations', { format: 'json' });

            if (jsonResponse && jsonResponse.success) {
                await new Promise(resolve => setTimeout(resolve, 500)); // המתן קצת

                const txtResponse = await this.sendMessageToTab('downloadAllConversations', { format: 'txt' });

                if (txtResponse && txtResponse.success) {
                    this.showMessage(`✅ כל השיחות הורדו בהצלחה! (${jsonResponse.count} שיחות)`, 'success');
                }
            } else {
                throw new Error(jsonResponse?.error || 'כשל בהורדת השיחות');
            }

        } catch (error) {
            console.error('Download all failed:', error);
            this.showMessage('❌ שגיאה בהורדה: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    closeConversationsList() {
        if (this.elements.conversationsList) {
            this.elements.conversationsList.style.display = 'none';
        }
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
console.log('🎮 Genspark RTL Toolbox Popup v2.3 נטען');