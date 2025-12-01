const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Cria o servidor HTTP
const io = new Server(server); // Acopla o Socket.io ao servidor HTTP

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota principal (opcional, o express.static já serve o index.html por padrão)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Armazena os usuários conectados: { socketId: username }
const users = {};

// Lógica do WebSocket
io.on('connection', (socket) => {
    console.log('Um utilizador conectou-se (ID: ' + socket.id + ')');

    // Evento para definir o nome de usuário
    socket.on('set username', (username) => {
        users[socket.id] = username;
        console.log(`Usuário definido: ${username} (${socket.id})`);
        // Avisa a todos que alguém entrou
        io.emit('system message', `${username} entrou no chat`);
    });

    // O servidor fica a "ouvir" o evento 'chat message' vindo deste cliente
    socket.on('chat message', (msg) => {
        const username = users[socket.id];
        if (username) {
            console.log(`Mensagem de ${username}: ${msg}`);
            // Envia objeto com nome e mensagem
            io.emit('chat message', { username: username, msg: msg });
        }
    });

    // Evento de "Digitando..."
    socket.on('typing', () => {
        const username = users[socket.id];
        if (username) {
            // Envia para todos EXCETO quem está digitando
            socket.broadcast.emit('typing', { username: username });
        }
    });

    // Evento padrão de desconexão
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            console.log(`${username} desconectou-se`);
            io.emit('system message', `${username} saiu do chat`);
            delete users[socket.id];
        } else {
            console.log('Utilizador desconhecido desconectou-se');
        }
    });
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
    console.log('Servidor a rodar em http://localhost:3000');
});