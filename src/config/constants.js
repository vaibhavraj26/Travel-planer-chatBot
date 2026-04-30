/**
 * Application Configuration & Constants
 */

export const API_CONFIG = {
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
    SYSTEM_PROMPT: `You are Global Travel Pro, an expert AI travel planner. Provide highly detailed, practical, and structured travel plans. Structure your responses using Markdown headers (##), bullet points, and bold text. 
When asked for a trip plan, always include:
## 🗺️ Trip Overview
Destination, duration, and a compelling summary.
## 📅 Detailed Itinerary
Day-by-day breakdown with activities and locations.
## 🛂 Visa & Documents
Specific visa requirements based on origin/destination.
## 💰 Budget & Tips
Estimated costs, cultural etiquette, and safety tips.

Be engaging, accurate, and format everything beautifully using Markdown.`
};

export const STORAGE_KEYS = {
    SETTINGS: 'gtp_settings',
    CONVERSATIONS: 'gtp_conversations',
    ACTIVE_CONVERSATION: 'gtp_activeConversation',
    CONVERSATION_PREFIX: 'gtp_'
};

export const DEFAULT_SETTINGS = {
    apiKey: '',
    theme: 'dark'
};

export const DOM_IDS = {
    // Layout
    sidebar: 'sidebar',
    sidebarOverlay: 'sidebar-overlay',
    btnSidebarToggle: 'btn-sidebar-toggle',
    
    // Main Content
    chatArea: 'chat-area',
    welcomeScreen: 'welcome-screen',
    messagesContainer: 'messages-container',
    headerTitle: 'main-header-title',
    
    // Input
    userInput: 'user-input',
    charCount: 'char-count',
    btnSend: 'btn-send',
    
    // Sidebar
    btnNewChat: 'btn-new-chat',
    searchConversations: 'search-conversations',
    conversationList: 'conversation-list',
    
    // Header
    btnTripBuilder: 'btn-trip-builder',
    btnExport: 'btn-export',
    btnClearChat: 'btn-clear-chat',
    btnShortcuts: 'btn-shortcuts',
    shortcutsMenu: 'shortcuts-menu',
    
    // Trip Builder
    tripBuilder: 'trip-builder',
    btnGenerateTrip: 'btn-generate-trip',
    btnCancelTrip: 'btn-cancel-trip',
    
    // Modals
    btnSettings: 'btn-settings',
    settingsModal: 'settings-modal',
    inputApiKey: 'settings-api-key',
    btnSaveSettings: 'btn-save-settings',
    renameModal: 'rename-modal',
    renameInput: 'rename-input',
    btnSaveRename: 'btn-save-rename',
    
    // Global
    toastContainer: 'toast-container'
};
