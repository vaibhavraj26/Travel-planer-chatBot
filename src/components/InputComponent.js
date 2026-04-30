/**
 * Input Component Handler
 * Manages input area and text input
 */

export class InputComponent {
    constructor(state, uiUtils, apiManager, chatComponent) {
        this.state = state;
        this.uiUtils = uiUtils;
        this.apiManager = apiManager;
        this.chatComponent = chatComponent;
    }

    async sendMessage() {
        const input = this.uiUtils.getElement('user-input');
        const content = input.value.trim();

        if (!content) return;

        if (!this.state.settings.apiKey) {
            this.uiUtils.showToast('Please set your API key in settings first', 'error');
            this.uiUtils.openModal('settings-modal');
            return;
        }

        if (!this.state.currentConvId) {
            this.state.createConversation();
            // Ensure UI is updated for new conversation
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Reset input
        input.value = '';
        input.style.height = 'auto';
        this.uiUtils.getElement('char-count').textContent = '0';
        this.uiUtils.getElement('btn-send').disabled = true;

        // Hide welcome screen and show chat (this also shows scroll button)
        this.chatComponent.hideWelcomeScreen();

        // Add user message
        this.chatComponent.renderMessage(content, 'user');
        this.state.addMessage(this.state.currentConvId, content, 'user');

        // Get messages for API
        const messages = this.state.getMessages(this.state.currentConvId);

        this.chatComponent.showTypingIndicator();
        this.state.setLoading(true);

        try {
            const reply = await this.apiManager.sendChatMessage(
                messages,
                this.state.settings.systemPrompt || 'You are a helpful AI assistant.',
                this.state.settings.apiKey
            );

            this.chatComponent.removeTypingIndicator();
            this.chatComponent.renderMessage(reply, 'assistant', true);
            this.state.addMessage(this.state.currentConvId, reply, 'assistant');
        } catch (error) {
            this.chatComponent.removeTypingIndicator();
            this.uiUtils.showToast(error.message, 'error');
        } finally {
            this.state.setLoading(false);
        }
    }

    setupAutoResize() {
        const input = this.uiUtils.getElement('user-input');
        if (!input) return;

        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 150) + 'px';
            this.uiUtils.getElement('char-count').textContent = input.value.length;
            this.uiUtils.getElement('btn-send').disabled = input.value.trim().length === 0;
        });
    }
}
