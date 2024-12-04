// Establish WebSocket connection
const socket = io();

// DOM Elements
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-message");

// Function to send a message
const sendMessage = () => {
  const message = chatInput.value;
  if (message) {
    socket.emit("chat message", message); // Emit the message to the server
    chatInput.value = ""; // Clear the input field
  }
};

// Send message to server when Send button is clicked
sendButton.addEventListener("click", sendMessage);

// Send message to server when Enter key is pressed
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent default behavior (e.g., form submission)
    sendMessage();
  }
});

// Receive and display messages
socket.on("chat message", (msg) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = msg;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom to show the latest message
});
