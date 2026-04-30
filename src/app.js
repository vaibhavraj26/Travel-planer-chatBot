/**
 * Main Application Entry Point
 * Initializes and manages the entire application
 */

import { StateManager } from './modules/StateManager.js';
import { UIUtils } from './modules/UIUtils.js';
import { APIManager } from './modules/APIManager.js';
import { StorageManager } from './modules/StorageManager.js';
import { API_CONFIG, DEFAULT_SETTINGS } from './config/constants.js';
import { ChatComponent } from './components/ChatComponent.js';
import { SidebarComponent } from './components/SidebarComponent.js';
import { InputComponent } from './components/InputComponent.js';

class TravelPlannerApp {
    constructor() {
        // Initialize managers and components
        this.state = new StateManager();
        this.uiUtils = UIUtils;
        this.apiManager = APIManager;
        this.chatComponent = new ChatComponent(this.state, this.uiUtils, this.apiManager);
        this.sidebarComponent = new SidebarComponent(this.state, this.uiUtils);
        this.inputComponent = new InputComponent(
            this.state,
            this.uiUtils,
            this.apiManager,
            this.chatComponent
        );
    }

    async initialize() {
        // Load state from storage
        await this.state.initialize();

        // Add system prompt to settings if not present
        if (!this.state.settings.systemPrompt) {
            this.state.settings.systemPrompt = API_CONFIG.SYSTEM_PROMPT;
        }

        // Setup UI
        this.setupEventListeners();
        this.renderInitialUI();

        // Load API key from .env if available
        if (!this.state.settings.apiKey) {
            try {
                const response = await fetch('.env');
                if (response.ok) {
                    const text = await response.text();
                    const match = text.match(/API_KEY=(.*)/);
                    if (match && match[1].trim()) {
                        this.state.settings.apiKey = match[1].trim();
                        this.state.saveSettings(this.state.settings);
                        this.uiUtils.showToast('API key loaded from configuration', 'success');
                    }
                }
            } catch (e) {
                // Silently fail, user will use settings modal
            }
        }

        // Show warning if no API key
        if (!this.state.settings.apiKey) {
            setTimeout(() => {
                this.uiUtils.showToast('Please configure your Gemini API Key in Settings', 'warning');
            }, 1000);
        }

        // Setup input auto-resize
        this.inputComponent.setupAutoResize();
    }

    renderInitialUI() {
        // Render conversations
        this.sidebarComponent.renderConversationList();

        // Load active conversation or show welcome
        if (this.state.currentConvId) {
            this.loadConversation(this.state.currentConvId);
        } else {
            this.chatComponent.showWelcomeScreen();
        }

        // Update header title
        const conv = this.state.getCurrentConversation();
        const title = this.uiUtils.getElement('main-header-title');
        if (title) title.textContent = conv?.name || 'Welcome';
        
        // Setup scroll button
        this.chatComponent.setupScrollButton();
    }

    loadConversation(id) {
        const conv = this.state.getCurrentConversation();

        if (conv) {
            const title = this.uiUtils.getElement('main-header-title');
            if (title) title.textContent = conv.name;

            // Update sidebar active state
            this.uiUtils.getElements('.conv-item').forEach(el => {
                el.classList.toggle('active', el.dataset.id === id);
            });

            // Load and render messages
            this.chatComponent.hideWelcomeScreen();
            this.chatComponent.clearMessages();
            this.chatComponent.setupScrollButton();

            const messages = this.state.getMessages(id);
            messages.forEach(msg => {
                this.chatComponent.renderMessage(msg.content, msg.role);
            });
        }
    }

    setupEventListeners() {
        // Chat Input
        const btnSend = this.uiUtils.getElement('btn-send');
        const userInput = this.uiUtils.getElement('user-input');

        if (btnSend) {
            btnSend.addEventListener('click', () => this.inputComponent.sendMessage());
        }

        if (userInput) {
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.inputComponent.sendMessage();
                }
            });
        }

        // Sidebar
        const btnNewChat = this.uiUtils.getElement('btn-new-chat');
        const btnSidebarToggle = this.uiUtils.getElement('btn-sidebar-toggle');
        const sidebarOverlay = this.uiUtils.getElement('sidebar-overlay');

        if (btnNewChat) {
            btnNewChat.addEventListener('click', () => {
                this.state.createConversation();
                this.renderInitialUI();
                if (window.innerWidth <= 768) this.uiUtils.closeSidebar();
            });
        }

        if (btnSidebarToggle) {
            btnSidebarToggle.addEventListener('click', () => this.uiUtils.toggleSidebar());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.uiUtils.closeSidebar());
        }

        // Search conversations
        const searchInput = this.uiUtils.getElement('search-conversations');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.sidebarComponent.renderConversationList(e.target.value);
            });
        }

        // Conversation actions (delegated)
        const convList = this.uiUtils.getElement('conversation-list');
        if (convList) {
            convList.addEventListener('click', (e) => {
                const renameBtn = e.target.closest('.conv-item-rename');
                const deleteBtn = e.target.closest('.conv-item-delete');

                if (renameBtn) {
                    const id = renameBtn.dataset.id;
                    const conv = this.state.conversations.find(c => c.id === id);
                    if (conv) this.initiateRename(id, conv.name);
                }

                if (deleteBtn) {
                    e.stopPropagation();
                    const id = deleteBtn.dataset.id;
                    if (confirm('Are you sure you want to delete this conversation?')) {
                        this.state.deleteConversation(id);
                        this.sidebarComponent.renderConversationList();
                        this.renderInitialUI();
                        this.uiUtils.showToast('Conversation deleted', 'success');
                    }
                }
            });
        }

        // Feature cards
        this.uiUtils.getElements('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const input = this.uiUtils.getElement('user-input');
                input.value = card.dataset.prompt;
                this.uiUtils.getElement('btn-send').disabled = false;
                this.inputComponent.sendMessage();
            });
        });

        // Header actions
        const btnTripBuilder = this.uiUtils.getElement('btn-trip-builder');
        const btnExport = this.uiUtils.getElement('btn-export');
        const btnClearChat = this.uiUtils.getElement('btn-clear-chat');

        if (btnTripBuilder) {
            btnTripBuilder.addEventListener('click', () => {
                const tripBuilder = this.uiUtils.getElement('trip-builder');
                tripBuilder?.classList.toggle('active');
            });
        }

        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportChat());
        }

        if (btnClearChat) {
            btnClearChat.addEventListener('click', () => this.clearChat());
        }

        // Shortcuts menu
        const btnShortcuts = this.uiUtils.getElement('btn-shortcuts');
        const shortcutsMenu = this.uiUtils.getElement('shortcuts-menu');

        if (btnShortcuts) {
            btnShortcuts.addEventListener('click', (e) => {
                e.stopPropagation();
                shortcutsMenu?.classList.toggle('active');
            });
        }

        if (shortcutsMenu) {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.menu-wrapper')) {
                    shortcutsMenu.classList.remove('active');
                }
            });
        }

        // Settings
        const btnSettings = this.uiUtils.getElement('btn-settings');
        const btnSaveSettings = this.uiUtils.getElement('btn-save-settings');
        const inputApiKey = this.uiUtils.getElement('settings-api-key');

        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                this.uiUtils.openModal('settings-modal');
                if (inputApiKey) inputApiKey.value = this.state.settings.apiKey;
            });
        }

        if (btnSaveSettings) {
            btnSaveSettings.addEventListener('click', () => {
                if (inputApiKey) {
                    this.state.settings.apiKey = inputApiKey.value.trim();
                    this.state.saveSettings(this.state.settings);
                    this.uiUtils.closeModal('settings-modal');
                    this.uiUtils.showToast('Settings saved successfully', 'success');
                }
            });
        }

        // Rename modal
        const btnSaveRename = this.uiUtils.getElement('btn-save-rename');
        const renameInput = this.uiUtils.getElement('rename-input');

        if (btnSaveRename) {
            btnSaveRename.addEventListener('click', () => this.saveRename());
        }

        if (renameInput) {
            renameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.saveRename();
            });
        }

        // Modal close buttons
        this.uiUtils.getElements('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.currentTarget.dataset.closeModal;
                this.uiUtils.closeModal(modalId);
            });
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                const conv = this.state.createConversation();
                this.renderInitialUI();
                if (window.innerWidth <= 768) this.uiUtils.closeSidebar();
            }

            if (e.key === 'Escape') {
                this.uiUtils.getElements('.modal-overlay').forEach(m => {
                    m.classList.remove('active');
                });
                this.uiUtils.getElement('trip-builder')?.classList.remove('active');
            }
        });

        // State observers
        this.state.subscribe(({ eventType, data }) => {
            switch (eventType) {
                case 'conversationsChanged':
                    this.sidebarComponent.renderConversationList();
                    break;
                case 'activeConversationChanged':
                    if (data) {
                        this.loadConversation(data);
                    } else {
                        this.chatComponent.showWelcomeScreen();
                        const title = this.uiUtils.getElement('main-header-title');
                        if (title) title.textContent = 'Welcome';
                    }
                    break;
            }
        });
    }

    initiateRename(id, currentName) {
        this.state.renameTargetId = id;
        const renameInput = this.uiUtils.getElement('rename-input');
        if (renameInput) {
            renameInput.value = currentName;
            this.uiUtils.openModal('rename-modal');
            renameInput.focus();
        }
    }

    saveRename() {
        const renameInput = this.uiUtils.getElement('rename-input');
        const newName = renameInput?.value.trim();

        if (newName && this.state.renameTargetId) {
            this.state.updateConversation(this.state.renameTargetId, { name: newName });
            this.sidebarComponent.renderConversationList();

            const title = this.uiUtils.getElement('main-header-title');
            if (title && this.state.renameTargetId === this.state.currentConvId) {
                title.textContent = newName;
            }

            this.uiUtils.closeModal('rename-modal');
            this.uiUtils.showToast('Conversation renamed', 'success');
        }
    }

    exportChat() {
        if (!this.state.currentConvId) {
            this.uiUtils.showToast('No conversation to export', 'warning');
            return;
        }

        const conv = this.state.getCurrentConversation();
        const messages = this.state.getMessages(this.state.currentConvId);

        const text = `# ${conv.name}\n\n${messages
            .map(m => `**${m.role}**: ${m.content}`)
            .join('\n\n')}`;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conv.name}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.uiUtils.showToast('Chat exported successfully', 'success');
    }

    clearChat() {
        if (!this.state.currentConvId) return;

        if (confirm('Are you sure you want to clear all messages in this chat?')) {
            StorageManager.saveMessages(this.state.currentConvId, []);
            this.chatComponent.clearMessages();
            this.chatComponent.showWelcomeScreen();
            this.uiUtils.showToast('Chat cleared', 'success');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TravelPlannerApp();
    await app.initialize();
});
