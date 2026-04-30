/**
 * Chat Component Handler
 * Manages chat messages rendering and interactions
 */

export class ChatComponent {
    constructor(state, uiUtils, apiManager) {
        this.state = state;
        this.uiUtils = uiUtils;
        this.apiManager = apiManager;
    }

    renderMessage(content, role, animated = false) {
        const container = this.uiUtils.getElement('messages-container');
        if (!container) return;

        const message = document.createElement('div');
        message.className = `message ${role}-message`;
        message.innerHTML = `
            <div class="message-avatar">${role === 'user' ? '👤' : '🤖'}</div>
            <div>
                <div class="message-content">${this.formatContent(content)}</div>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;

        container.appendChild(message);

        if (animated) {
            requestAnimationFrame(() => {
                message.classList.add('animated');
            });
        }

        this.uiUtils.scrollToBottom(container);
        // Check if scroll button should be shown
        setTimeout(() => this.checkScrollPosition(), 100);
    }

    formatContent(content) {
        // Basic markdown to HTML conversion
        let html = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
            .replace(/\n/g, '<br>');

        return html;
    }

    clearMessages() {
        const container = this.uiUtils.getElement('messages-container');
        if (container) container.innerHTML = '';
    }

    showTypingIndicator() {
        const container = this.uiUtils.getElement('messages-container');
        if (!container) return;

        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.id = 'typing-indicator';
        typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

        container.appendChild(typing);
        this.uiUtils.scrollToBottom(container);
    }

    removeTypingIndicator() {
        const typing = this.uiUtils.getElement('typing-indicator');
        if (typing) typing.remove();
    }

    showWelcomeScreen() {
        const welcome = this.uiUtils.getElement('welcome-screen');
        const messages = this.uiUtils.getElement('messages-container');
        if (welcome) welcome.style.display = 'flex';
        if (messages) messages.style.display = 'none';
        this.hideScrollButton();
    }

    setupScrollButton() {
        const container = this.uiUtils.getElement('chat-area');
        if (!container) return;

        // Create scroll button if it doesn't exist
        let scrollBtn = this.uiUtils.getElement('scroll-to-bottom-btn');
        if (!scrollBtn) {
            scrollBtn = document.createElement('button');
            scrollBtn.id = 'scroll-to-bottom-btn';
            scrollBtn.className = 'scroll-to-bottom-btn';
            scrollBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            scrollBtn.title = 'Scroll to bottom';
            scrollBtn.addEventListener('click', () => {
                this.uiUtils.scrollToBottom(this.uiUtils.getElement('messages-container'));
                this.hideScrollButton();
            });
            document.body.appendChild(scrollBtn);
        }

        // Setup scroll listener
        const messagesContainer = this.uiUtils.getElement('messages-container');
        if (messagesContainer) {
            messagesContainer.addEventListener('scroll', () => {
                this.checkScrollPosition();
            });
        }
    }

    checkScrollPosition() {
        const messages = this.uiUtils.getElement('messages-container');
        if (!messages) return;

        const isNearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 100;
        if (isNearBottom) {
            this.hideScrollButton();
        } else {
            this.showScrollButton();
        }
    }

    showScrollButton() {
        const btn = this.uiUtils.getElement('scroll-to-bottom-btn');
        if (btn) btn.classList.add('visible');
    }

    hideScrollButton() {
        const btn = this.uiUtils.getElement('scroll-to-bottom-btn');
        if (btn) btn.classList.remove('visible');
    }

    hideWelcomeScreen() {
        const welcome = this.uiUtils.getElement('welcome-screen');
        const messages = this.uiUtils.getElement('messages-container');
        if (welcome) welcome.style.display = 'none';
        if (messages) messages.style.display = 'flex';
        // Show scroll button immediately as a hint that there's content to scroll through
        this.showScrollButton();
    }
}
