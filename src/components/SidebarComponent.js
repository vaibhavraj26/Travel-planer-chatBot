/**
 * Sidebar Component Handler
 * Manages sidebar conversations and navigation
 */

export class SidebarComponent {
    constructor(state, uiUtils) {
        this.state = state;
        this.uiUtils = uiUtils;
    }

    renderConversationList(searchQuery = '') {
        const list = this.uiUtils.getElement('conversation-list');
        if (!list) return;

        list.innerHTML = '';

        const filtered = this.state.conversations.filter(conv =>
            conv.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach(conv => {
            const item = document.createElement('div');
            item.className = `conv-item ${conv.id === this.state.currentConvId ? 'active' : ''}`;
            item.dataset.id = conv.id;
            item.innerHTML = `
                <div class="conv-item-content">
                    <div class="conv-item-name">${conv.name}</div>
                    <div class="conv-item-date">${this.formatDate(conv.updatedAt)}</div>
                </div>
                <div class="conv-item-actions">
                    <button class="conv-item-rename" data-id="${conv.id}" title="Rename">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="conv-item-delete" data-id="${conv.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            item.addEventListener('click', () => this.state.setActiveConversation(conv.id));
            list.appendChild(item);
        });
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }
}
