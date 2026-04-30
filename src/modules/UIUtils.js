/**
 * UI Utilities Module
 * Handles UI interactions, toasts, and DOM manipulation
 */

export const UIUtils = {
    // Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon fas fa-${this.getIconForType(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    // DOM Queries
    getElement(id) {
        return document.getElementById(id);
    },

    getElements(selector) {
        return document.querySelectorAll(selector);
    },

    // Modal Management
    openModal(modalId) {
        const modal = this.getElement(modalId);
        if (modal) modal.classList.add('active');
    },

    closeModal(modalId) {
        const modal = this.getElement(modalId);
        if (modal) modal.classList.remove('active');
    },

    toggleModal(modalId) {
        const modal = this.getElement(modalId);
        if (modal) modal.classList.toggle('active');
    },

    // Sidebar
    toggleSidebar() {
        const sidebar = this.getElement('sidebar');
        const overlay = this.getElement('sidebar-overlay');
        sidebar?.classList.toggle('active');
        overlay?.classList.toggle('active');
    },

    closeSidebar() {
        const sidebar = this.getElement('sidebar');
        const overlay = this.getElement('sidebar-overlay');
        sidebar?.classList.remove('active');
        overlay?.classList.remove('active');
    },

    // Scroll
    scrollToBottom(element) {
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    },

    // Focus
    focus(id) {
        const element = this.getElement(id);
        if (element) element.focus();
    }
};
