import { api } from './api.js';
import { ui } from './ui.js';

class MessageQueueApp {
    constructor() {
        this.initialize();
        this.currentQueue = null;
    }

    initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadQueues();
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        document.getElementById('addMessageButton').addEventListener('click', () => this.openModal());
        document.getElementById('messagesContainer').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-button')) {
                const messageId = e.target.getAttribute('data-message-id');
                this.deleteMessage(messageId);
            }
        });
    }

    async loadQueues() {
        const queueList = ui.elements.queueList();
        queueList.innerHTML = '';

        try {
            const queues = await api.fetchQueues();
            if (Array.isArray(queues)) {
                ui.elements.noQueuesText().style.display = queues.length === 0 ? 'block' : 'none';
                queues.forEach(queue => {
                    const queueItem = ui.createQueueItem(queue, (queueName) => this.fetchQueueMessages(queueName));
                    queueList.appendChild(queueItem);
                });

                // Clear messages container if current queue no longer exists
                if (this.currentQueue && !queues.includes(this.currentQueue)) {
                    this.currentQueue = null;
                    ui.elements.messagesContainer().innerHTML = '';
                }
            }
        } catch (error) {
            console.error('Error loading queues:', error);
            ui.elements.noQueuesText().innerText = 'Error loading queues.';
        }
    }

    async fetchQueueMessages(queueName) {
        try {
            this.currentQueue = queueName;
            const messages = await api.fetchQueueMessages(queueName);
            ui.displayMessages(messages);
        } catch (error) {
            console.error('Error fetching queue messages:', error);
            ui.displayMessages([]);
        }
    }

    async deleteMessage(messageId) {
        try {
            await api.deleteMessage(messageId);
            
            // Check if this was the last message in the current queue
            if (this.currentQueue) {
                const messages = await api.fetchQueueMessages(this.currentQueue);
                if (!messages || messages.length === 0) {
                    // If no messages left, clear the current queue
                    this.currentQueue = null;
                    ui.elements.messagesContainer().innerHTML = '';
                } else {
                    // If messages remain, update the display
                    ui.displayMessages(messages);
                }
            }

            // Reload queues to update the menu
            await this.loadQueues();

            ui.showModal();
            ui.displayModalMessage('Message deleted successfully', 'success', () => {
                ui.hideModal();
            });
        } catch (error) {
            ui.showModal();
            ui.displayModalMessage(error.message, 'error', () => ui.hideModal());
        }
    }

    openModal() {
        ui.showModal();
        ui.resetModalContent(
            () => this.closeModal(),
            () => this.addMessage()
        );
    }

    closeModal() {
        ui.hideModal();
    }

    async addMessage() {
        const queueName = document.getElementById('modalQueueName').value;
        const messageContent = document.getElementById('modalMessageContent').value;

        if (!queueName || !messageContent) {
            ui.displayModalMessage('Queue name and message cannot be empty.', 'error', () => this.closeModal());
            return;
        }

        try {
            await api.addMessage(queueName, messageContent);
            ui.displayModalMessage('Message posted', 'success', () => {
                this.closeModal();
                this.loadQueues();
                if (queueName === this.currentQueue) {
                    this.fetchQueueMessages(queueName);
                }
            });
        } catch (error) {
            ui.displayModalMessage(error.message, 'error', () => this.closeModal());
            console.error('Error adding message:', error);
        }
    }
}

// Initialize the application
new MessageQueueApp();