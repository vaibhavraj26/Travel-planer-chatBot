/**
 * API Management Module
 * Handles all API calls to Gemini
 */

import { API_CONFIG } from '../config/constants.js';

export const APIManager = {
    async sendChatMessage(messages, systemPrompt, apiKey) {
        if (!apiKey) {
            throw new Error('API key is not configured');
        }

        const requestBody = {
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        };

        try {
            const response = await fetch(`${API_CONFIG.API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errData = await response.json();
                const errorMessage = errData.error?.message || `HTTP Error: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                         'I could not generate a response. Please try again.';
            
            return reply;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    handleError(error) {
        let errorMsg = 'Connection error. Try again.';
        
        if (error.message.includes('API key')) {
            errorMsg = 'Invalid or expired API Key';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMsg = 'Invalid API Key - please check your settings';
        } else if (error.message.includes('429')) {
            errorMsg = 'Rate limit exceeded - please try again later';
        } else if (error.message.includes('500')) {
            errorMsg = 'API server error - please try again later';
        } else if (error.message) {
            errorMsg = error.message;
        }
        
        return new Error(errorMsg);
    }
};
