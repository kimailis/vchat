// API service module
export const api = {
    async fetchQueues() {
        const response = await fetch('/api/queues');
        if (!response.ok) throw new Error(`Server returned status ${response.status}`);
        return this.handleJsonResponse(response);
    },

    async fetchQueueMessages(queueName) {
        const response = await fetch(`/api/${queueName}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return this.handleJsonResponse(response);
    },

    async addMessage(queueName, content) {
        const response = await fetch(`/api/${queueName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        if (!response.ok) {
            const errorData = await this.handleJsonResponse(response);
            throw new Error(errorData.error || 'Error submitting message.');
        }
        return response;
    },

    async deleteMessage(messageId) {
        const response = await fetch(`/api/messages/${messageId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorData = await this.handleJsonResponse(response);
            throw new Error(errorData.error || 'Error deleting message.');
        }
        return response;
    },

    async handleJsonResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        throw new Error('Expected JSON response but got something else');
    }
};