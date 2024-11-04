import { api } from './api.js';
import { ui } from './ui.js';

class MessageQueueApp {
    constructor() {
        this.initialize();
    }

    initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadQueues();
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        document.getElementById('addMessageButton').addEventListener('click', () => this.openModal());
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
            }
        } catch (error) {
            console.error('Error loading queues:', error);
            ui.elements.noQueuesText().innerText = 'Error loading queues.';
        }
    }

    async fetchQueueMessages(queueName) {
        try {
            const messages = await api.fetchQueueMessages(queueName);
            ui.displayMessages(messages);
        } catch (error) {
            console.error('Error fetching queue messages:', error);
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
            ui.displayModalMessage('Message posted', 'success', () => this.closeModal());
            this.loadQueues();
        } catch (error) {
            ui.displayModalMessage(error.message, 'error', () => this.closeModal());
            console.error('Error adding message:', error);
        }
    }
}

// Initialize the application
new MessageQueueApp();