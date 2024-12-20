const form = document.querySelector('#chat-section form')! as HTMLFormElement;
const input = document.querySelector('input#chat-message')! as HTMLInputElement;
const messageTemplate = document.querySelector('#chat-message-template')! as HTMLTemplateElement;

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = input.value.trim();
    if (!message) {
        console.error('Cannot send an empty message.');
        return;
    }

    input.value = '';

    fetch(form.action, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message })
    }).then(response => {
            if (response.status !== 200) {
                console.error('Error:', response);
            }
        });
});

// IIFE
//(() => {
    window.socket.on(
        `message:${window.roomId}`,
        (payload: {
            message: string;
            sender: string;
            timestamp: string,
            gravatar: string}) => {
            const messageElement = messageTemplate.content.cloneNode(true) as HTMLElement;
            messageElement.querySelector("span")!.textContent = payload.message;

            document.querySelector("#chat-section ul")!.appendChild(messageElement);
    })
//})();
