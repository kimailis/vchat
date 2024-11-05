// UI components module
export const ui = {
    elements: {
        queueList: () => document.getElementById('queueMenu'),
        noQueuesText: () => document.getElementById('noQueuesText'),
        messagesContainer: () => document.getElementById('messagesContainer'),
        modal: () => document.getElementById('addMessageModal'),
        modalContent: () => document.querySelector('.modalContent')
    },

    createQueueItem(queueName, onGoClick) {
        const queueItem = document.createElement('li');
        queueItem.className = 'queueItem';
        queueItem.innerText = queueName;

        const goButton = document.createElement('button');
        goButton.className = 'goButton';
        goButton.innerText = 'Go';
        goButton.addEventListener('click', () => onGoClick(queueName));

        queueItem.appendChild(goButton);
        return queueItem;
    },

    displayMessages(messages) {
        const container = this.elements.messagesContainer();
        container.innerHTML = '';
        
        if (!Array.isArray(messages)) {
            this.showWelcomeMessage();
            return;
        }

        if (messages.length === 0) {
            container.innerHTML = '<p>No messages found in this queue.</p>';
            return;
        }

        messages.forEach(message => {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = message.message;
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = '×';
            deleteButton.setAttribute('data-message-id', message.id);
            
            messageCard.appendChild(messageContent);
            messageCard.appendChild(deleteButton);
            container.appendChild(messageCard);
        });
    },

    showWelcomeMessage() {
        const container = this.elements.messagesContainer();
        container.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to Vchat</h2>
                <p>Select a queue to display messages, or click 'Add Message' to post a new message</p>
            </div>
        `;
    },

    resetModalContent(onCancel, onAdd) {
        const content = this.elements.modalContent();
        content.innerHTML = `
            <h2>Add New Message</h2>
            <label for="modalQueueName">Queue Name:</label>
            <input type="text" id="modalQueueName" placeholder="Enter queue name" required>
            <label for="modalMessageContent">Message:</label>
            <textarea id="modalMessageContent" placeholder="Enter message" required></textarea>
            <div class="modalButtons">
                <button id="cancelButton">Cancel</button>
                <button id="addButton">Add</button>
            </div>
            <div id="submitStatus" class="modalStatus"></div>
        `;
        document.getElementById('cancelButton').addEventListener('click', onCancel);
        document.getElementById('addButton').addEventListener('click', onAdd);
    },

    displayModalMessage(message, status, onOk) {
        const content = this.elements.modalContent();
        content.innerHTML = `
            <p class="statusMessage ${status}">${message}</p>
            <button id="okButton" class="okButton ${status}">OK</button>
        `;
        document.getElementById('okButton').addEventListener('click', onOk);
    },

    showModal() {
        this.elements.modal().style.display = 'flex';
    },

    hideModal() {
        this.elements.modal().style.display = 'none';
    }
};