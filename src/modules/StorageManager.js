/**
 * Storage Management Module
 * Handles all localStorage operations
 */

import { STORAGE_KEYS } from '../config/constants.js';

export const StorageManager = {
    // Settings
    getSettings() {
        const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return saved ? JSON.parse(saved) : {};
    },
    
    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },
    
    // Conversations
    getConversations() {
        const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        return saved ? JSON.parse(saved) : [];
    },
    
    saveConversations(conversations) {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    },
    
    // Active Conversation
    getActiveConversationId() {
        return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    },
    
    setActiveConversationId(id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
    },
    
    clearActiveConversationId() {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    },
    
    // Messages
    getMessages(conversationId) {
        const key = STORAGE_KEYS.CONVERSATION_PREFIX + conversationId;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    },
    
    saveMessages(conversationId, messages) {
        const key = STORAGE_KEYS.CONVERSATION_PREFIX + conversationId;
        localStorage.setItem(key, JSON.stringify(messages));
    },
    
    deleteConversation(conversationId) {
        const key = STORAGE_KEYS.CONVERSATION_PREFIX + conversationId;
        localStorage.removeItem(key);
    }
};
