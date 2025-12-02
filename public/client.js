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
const roomList = document.getElementById('room-list');
const dmList = document.getElementById('dm-list');
const newDmBtn = document.getElementById('new-dm-btn');
const currentRoomName = document.getElementById('current-room-name');

let myUsername = '';
let currentRoom = 'Geral';
let typingTimeout;

// Login Logic
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
        myUsername = username;
        // Join default room
        joinRoom('Geral');

        loginScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
        input.focus();
    }
});

// Room Switching Logic
roomList.addEventListener('click', (e) => {
    if (e.target.classList.contains('room')) {
        const roomName = e.target.getAttribute('data-room');
        if (roomName !== currentRoom) {
            joinRoom(roomName);
        }
    }
});

// DM Switching Logic
dmList.addEventListener('click', (e) => {
    if (e.target.classList.contains('dm-item')) {
        const targetUser = e.target.getAttribute('data-target');
        socket.emit('join dm', { targetUsername: targetUser });
    }
});

// New DM Logic
newDmBtn.addEventListener('click', () => {
    const targetUser = prompt('Digite o nome do usuário para conversar:');
    if (targetUser && targetUser !== myUsername) {
        socket.emit('join dm', { targetUsername: targetUser });
    }
});

function joinRoom(roomName) {
    currentRoom = roomName;
    currentRoomName.textContent = `# ${roomName}`;

    // Update active class in sidebar
    document.querySelectorAll('.room, .dm-item').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('data-room') === roomName) {
            el.classList.add('active');
        }
    });

    // Clear messages
    messages.innerHTML = '';

    // Emit join event
    socket.emit('join', { username: myUsername, room: roomName });
}

// Handle DM Joined
socket.on('dm joined', (data) => {
    currentRoom = data.room;
    currentRoomName.textContent = `@ ${data.target}`;

    // Clear messages
    messages.innerHTML = '';

    // Check if DM is already in list
    let existingDm = document.querySelector(`.dm-item[data-target="${data.target}"]`);
    if (!existingDm) {
        const li = document.createElement('li');
        li.classList.add('dm-item');
        li.setAttribute('data-target', data.target);
        li.setAttribute('data-room', data.room);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `@ ${data.target}`;
        li.appendChild(nameSpan);

        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-dm');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            li.remove();
            if (currentRoom === data.room) {
                joinRoom('Geral');
            }
        };
        li.appendChild(deleteBtn);

        dmList.appendChild(li);
        existingDm = li;
    }

    // Update active class
    document.querySelectorAll('.room, .dm-item').forEach(el => el.classList.remove('active'));
    existingDm.classList.add('active');
});

// Handle DM Notification (when someone else starts a DM with me)
socket.on('dm notification', (data) => {
    // Check if DM is already in list
    let existingDm = document.querySelector(`.dm-item[data-target="${data.sender}"]`);
    if (!existingDm) {
        const li = document.createElement('li');
        li.classList.add('dm-item');
        li.setAttribute('data-target', data.sender);
        li.setAttribute('data-room', data.room);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `@ ${data.sender}`;
        li.appendChild(nameSpan);

        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-dm');
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            li.remove();
        };
        li.appendChild(deleteBtn);

        dmList.appendChild(li);

        // Optional: Add a visual indicator (badge) or sound here
        li.style.fontWeight = 'bold'; // Simple visual cue
        li.style.color = 'var(--primary-color)';
        li.style.borderLeftColor = 'var(--primary-color)';
        li.style.borderLeftWidth = '4px';
        li.style.borderLeftStyle = 'solid';
        li.style.transition = 'all 0.3s ease';
        li.style.cursor = 'pointer';
        li.style.marginTop = '10px';
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
