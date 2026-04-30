/**
 * State Manager Module
 * Centralized state management for the application
 */

import { StorageManager } from './StorageManager.js';
import { DEFAULT_SETTINGS } from '../config/constants.js';

export class StateManager {
    constructor() {
        this.conversations = [];
        this.currentConvId = null;
        this.settings = { ...DEFAULT_SETTINGS };
        this.renameTargetId = null;
        this.isLoading = false;
        this.observers = [];
    }

    // Initialization
    async initialize() {
        this.loadSettings();
        this.loadConversations();
    }

    // Settings Management
    loadSettings() {
        const saved = StorageManager.getSettings();
        this.settings = { ...this.settings, ...saved };
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        StorageManager.saveSettings(this.settings);
        this.notify('settingsChanged', this.settings);
    }

    // Conversations Management
    loadConversations() {
        this.conversations = StorageManager.getConversations();
        this.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
        
        const activeId = StorageManager.getActiveConversationId();
        if (activeId && this.conversations.find(c => c.id === activeId)) {
            this.currentConvId = activeId;
        }
    }

    saveConversations() {
        StorageManager.saveConversations(this.conversations);
        this.notify('conversationsChanged', this.conversations);
    }

    createConversation() {
        const id = 'conv_' + Date.now();
        const newConv = {
            id,
            name: 'New Trip Plan',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.conversations.unshift(newConv);
        this.saveConversations();
        StorageManager.saveMessages(id, []);
        this.setActiveConversation(id);
        this.notify('conversationCreated', newConv);
        
        return newConv;
    }

    setActiveConversation(id) {
        this.currentConvId = id;
        StorageManager.setActiveConversationId(id);
        this.notify('activeConversationChanged', id);
    }

    deleteConversation(id) {
        this.conversations = this.conversations.filter(c => c.id !== id);
        this.saveConversations();
        StorageManager.deleteConversation(id);

        if (this.currentConvId === id) {
            this.currentConvId = null;
            StorageManager.clearActiveConversationId();
            this.notify('activeConversationChanged', null);
        }

        this.notify('conversationDeleted', id);
    }

    updateConversation(id, updates) {
        const conv = this.conversations.find(c => c.id === id);
        if (conv) {
            Object.assign(conv, updates, { updatedAt: Date.now() });
            this.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
            this.saveConversations();
            this.notify('conversationUpdated', conv);
        }
    }

    getCurrentConversation() {
        return this.conversations.find(c => c.id === this.currentConvId);
    }

    // Messages
    getMessages(conversationId) {
        return StorageManager.getMessages(conversationId || this.currentConvId);
    }

    addMessage(conversationId, content, role) {
        const messages = this.getMessages(conversationId);
        const message = {
            content,
            role,
            timestamp: Date.now()
        };

        messages.push(message);
        StorageManager.saveMessages(conversationId, messages);

        // Update conversation
        if (role === 'user' && messages.length === 1) {
            this.updateConversation(conversationId, {
                name: content.substring(0, 30) + (content.length > 30 ? '...' : '')
            });
        } else {
            const conv = this.conversations.find(c => c.id === conversationId);
            if (conv) conv.updatedAt = Date.now();
        }

        this.notify('messageAdded', message);
        return message;
    }

    // Utility
    setLoading(state) {
        this.isLoading = state;
        this.notify('loadingChanged', state);
    }

    // Observer Pattern
    subscribe(callback) {
        this.observers.push(callback);
        return () => {
            this.observers = this.observers.filter(cb => cb !== callback);
        };
    }

    notify(eventType, data) {
        this.observers.forEach(callback => {
            callback({ eventType, data });
        });
    }
}
