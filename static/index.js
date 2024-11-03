document.addEventListener("DOMContentLoaded", () => {
    loadQueues();
    document.getElementById("addMessageButton").addEventListener("click", openModal);
    document.getElementById("cancelButton").addEventListener("click", closeModal);
    document.getElementById("addButton").addEventListener("click", addMessage);
});

async function loadQueues() {
    const queueList = document.getElementById("queueMenu");
    queueList.innerHTML = ""; // Clear existing queue items

    try {
        const response = await fetch("/api/queues");

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const queues = await response.json();
            console.log("Queues data:", queues); // Log the data received

            if (Array.isArray(queues)) { // Check if queues is an array
                if (queues.length === 0) {
                    document.getElementById("noQueuesText").style.display = "block";
                } else {
                    document.getElementById("noQueuesText").style.display = "none";
                    queues.forEach(queue => createQueueItem(queue));
                }
            } else {
                console.error("Expected an array, but got:", queues);
            }
        } else {
            throw new Error("Expected JSON response but got something else");
        }
    } catch (error) {
        console.error("Error loading queues:", error);
        document.getElementById("noQueuesText").innerText = "Error loading queues.";
    }
}


function createQueueItem(queueName) {
    const queueItem = document.createElement("li");
    queueItem.className = "queueItem";
    queueItem.innerText = queueName;

    const goButton = document.createElement("button");
    goButton.className = "goButton";
    goButton.innerText = "Go";
    goButton.addEventListener("click", () => fetchQueueMessages(queueName));

    queueItem.appendChild(goButton);
    document.getElementById("queueMenu").appendChild(queueItem);
}


function fetchQueueMessages(queueName) {
    fetch(`/api/${queueName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // This should parse the JSON response
        })
        .then(messages => {
            // Clear the current messages displayed
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.innerHTML = ''; // Clear previous messages

            // Check if messages are returned and handle empty case
            if (messages.length === 0) {
                messagesContainer.innerHTML = '<p>No messages found in this queue.</p>';
                return;
            }

            // Create a card for each message and append it to the container
            messages.forEach(message => {
                const messageCard = document.createElement('div');
                messageCard.className = 'message-card';
                messageCard.textContent = message; // This should correctly set the message text
                messagesContainer.appendChild(messageCard);
            });
        })
        .catch(error => {
            console.error('Error fetching queue messages:', error);
        });
}


function openModal() {
    document.getElementById("addMessageModal").style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("addMessageModal");
    const modalContent = document.querySelector(".modalContent");
    modal.style.display = "none";
    modalContent.innerHTML = `
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
    document.getElementById("cancelButton").addEventListener("click", closeModal);
    document.getElementById("addButton").addEventListener("click", addMessage);
}

async function addMessage() {
    const queueName = document.getElementById("modalQueueName").value;
    const messageContent = document.getElementById("modalMessageContent").value;
    const modalContent = document.querySelector(".modalContent");

    if (!queueName || !messageContent) {
        displayModalMessage("Queue name and message cannot be empty.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/${queueName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: messageContent })
        });

        // Check response status and handle accordingly
        if (response.ok) {
            displayModalMessage("Message posted", "success");
            loadQueues();  // Reload the queue list
        } else {
            const contentType = response.headers.get("content-type");
            let errorMessage = "Error submitting message.";
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            }
            displayModalMessage(errorMessage, "error");
        }
    } catch (error) {
        displayModalMessage("Network error.", "error");
        console.error("Error adding message:", error);
    }
}


function displayModalMessage(message, status) {
    const modalContent = document.querySelector(".modalContent");
    modalContent.innerHTML = `
        <p class="statusMessage ${status}">${message}</p>
        <button id="okButton" class="okButton ${status}">OK</button>
    `;
    document.getElementById("okButton").addEventListener("click", closeModal);
}
