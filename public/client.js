const socket = io();

// Elements
const loginScreen = document.getElementById('login-screen');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');

let myUsername = '';
let typingTimeout;

// Login Logic
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
        myUsername = username;
        socket.emit('set username', username);
        loginScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
        input.focus();
    }
});

// Chat Logic
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

// Typing Indicator Logic
input.addEventListener('input', () => {
    socket.emit('typing');
});

// Socket Events

socket.on('chat message', (data) => {
    const item = document.createElement('div');
    item.classList.add('message');

    // Check if message is from me or others
    if (data.username === myUsername) {
        item.classList.add('sent');
    } else {
        item.classList.add('received');
        const userSpan = document.createElement('span');
        userSpan.classList.add('username');
        userSpan.textContent = data.username;
        item.appendChild(userSpan);
    }

    const textSpan = document.createElement('div');
    textSpan.textContent = data.msg;
    item.appendChild(textSpan);

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;

    // Clear typing indicator if the sender was typing
    typingIndicator.textContent = '';
});

socket.on('system message', (msg) => {
    const item = document.createElement('div');
    item.classList.add('system-message');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('typing', (data) => {
    typingIndicator.textContent = `${data.username} está digitando...`;

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 1000);
});
