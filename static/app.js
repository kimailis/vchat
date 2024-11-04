// State management
let currentQueue = null;
let queues = [];

// DOM Elements
const queueNameInput = document.getElementById('queueName');
const messageInput = document.getElementById('message');
const queueList = document.getElementById('queueList');
const messageList = document.getElementById('messageList');
const createQueueForm = document.getElementById('createQueueForm');
const messageForm = document.getElementById('messageForm');
const currentQueueDisplay = document.getElementById('currentQueue');

// Fetch all queues from the server
async function fetchQueues() {
    try {
        const response = await fetch('/api/queues');
        if (!response.ok) throw new Error('Failed to fetch queues');
        queues = await response.json();
        renderQueues();
    } catch (error) {
        console.error('Error fetching queues:', error);
    }
}

// Fetch messages for a specific queue
async function fetchMessages(queueName) {
    try {
        const response = await fetch(`/api/${queueName}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const messages = await response.json();
        renderMessages(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Add a new message to a queue
async function addMessage(queueName, content) {
    try {
        const response = await fetch(`/api/${queueName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
        
        if (!response.ok) throw new Error('Failed to add message');
        
        // Refresh messages after adding new one
        await fetchMessages(queueName);
        messageInput.value = '';
    } catch (error) {
        console.error('Error adding message:', error);
    }
}

// Render the queue list
function renderQueues() {
    queueList.innerHTML = '';
    queues.forEach(queue => {
        const li = document.createElement('li');
        li.className = `queue-item ${currentQueue === queue ? 'active' : ''}`;
        li.textContent = queue;
        li.onclick = () => selectQueue(queue);
        queueList.appendChild(li);
    });
}

// Render messages for the current queue
function renderMessages(messages) {
    messageList.innerHTML = '';
    messages.forEach(message => {
        const li = document.createElement('li');
        li.className = 'message-item';
        li.textContent = message;
        messageList.appendChild(li);
    });
}

// Select a queue and load its messages
function selectQueue(queueName) {
    currentQueue = queueName;
    currentQueueDisplay.textContent = `Current Queue: ${queueName}`;
    fetchMessages(queueName);
    renderQueues(); // Update active state in queue list
    messageForm.style.display = 'block';
}

// Event Listeners
createQueueForm.onsubmit = async (e) => {
    e.preventDefault();
    const queueName = queueNameInput.value.trim();
    if (!queueName) return;

    // Add message to create new queue
    await addMessage(queueName, 'Queue created');
    queueNameInput.value = '';
    await fetchQueues();
};

messageForm.onsubmit = async (e) => {
    e.preventDefault();
    if (!currentQueue) return;
    
    const content = messageInput.value.trim();
    if (!content) return;
    
    await addMessage(currentQueue, content);
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchQueues();
    messageForm.style.display = 'none';
});