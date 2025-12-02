const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Cria o servidor HTTP
const io = new Server(server); // Acopla o Socket.io ao servidor HTTP

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Definir Schema de Mensagem
const messageSchema = new mongoose.Schema({
    username: String,
    room: String,
    msg: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota principal (opcional, o express.static já serve o index.html por padrão)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Armazena os usuários conectados: { socketId: { username, room } }
const users = {};

// Lógica do WebSocket
io.on('connection', (socket) => {
    console.log('Um utilizador conectou-se (ID: ' + socket.id + ')');

    // Evento para definir o nome de usuário e entrar na sala padrão
    socket.on('join', async ({ username, room }) => {
        // Sai da sala anterior se houver
        if (users[socket.id] && users[socket.id].room) {
            socket.leave(users[socket.id].room);
            io.to(users[socket.id].room).emit('system message', `${users[socket.id].username} saiu da sala`);
        }

        const roomName = room || 'Geral';
        users[socket.id] = { username, room: roomName };

        socket.join(roomName);
        console.log(`${username} entrou na sala ${roomName} (${socket.id})`);

        // Avisa a sala que alguém entrou
        io.to(roomName).emit('system message', `${username} entrou na sala`);

        // Carregar histórico de mensagens
        try {
            const messages = await Message.find({ room: roomName }).sort({ timestamp: 1 }).limit(50);
            messages.forEach(msg => {
                socket.emit('chat message', { username: msg.username, msg: msg.msg });
            });
        } catch (err) {
            console.error('Erro ao carregar mensagens:', err);
        }
    });

    // Evento para entrar em DM
    socket.on('join dm', async ({ targetUsername }) => {
        const user = users[socket.id];
        if (!user) return;

        const myUsername = user.username;
        // Lógica de DM: Ordenar nomes alfabeticamente
        const dmRoomName = [myUsername, targetUsername].sort().join('_');

        // Sai da sala anterior
        if (user.room) {
            socket.leave(user.room);
        }

        user.room = dmRoomName;
        socket.join(dmRoomName);
        console.log(`${myUsername} entrou na DM ${dmRoomName} (${socket.id})`);

        // Emite evento de volta para o cliente saber que entrou na DM
        socket.emit('dm joined', { room: dmRoomName, target: targetUsername });

        // Notificar o usuário alvo que alguém quer falar com ele
        // Precisamos encontrar o socket do targetUsername
        for (const [id, u] of Object.entries(users)) {
            if (u.username === targetUsername) {
                io.to(id).emit('dm notification', { sender: myUsername, room: dmRoomName });
                break;
            }
        }

        // Carregar histórico de mensagens da DM
        try {
            const messages = await Message.find({ room: dmRoomName }).sort({ timestamp: 1 }).limit(50);
            messages.forEach(msg => {
                socket.emit('chat message', { username: msg.username, msg: msg.msg });
            });
        } catch (err) {
            console.error('Erro ao carregar mensagens da DM:', err);
        }
    });

    // O servidor fica a "ouvir" o evento 'chat message' vindo deste cliente
    socket.on('chat message', async (msg) => {
        const user = users[socket.id];
        if (user) {
            console.log(`Mensagem de ${user.username} em ${user.room}: ${msg}`);

            // Salvar no banco de dados
            const newMessage = new Message({
                username: user.username,
                room: user.room,
                msg: msg
            });
            await newMessage.save();

            // Envia objeto com nome e mensagem APENAS para a sala
            io.to(user.room).emit('chat message', { username: user.username, msg: msg });
        }
    });

    // Evento de "Digitando..."
    socket.on('typing', () => {
        const user = users[socket.id];
        if (user) {
            // Envia para todos na sala EXCETO quem está digitando
            socket.to(user.room).emit('typing', { username: user.username });
        }
    });

    // Evento padrão de desconexão
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            console.log(`${user.username} desconectou-se`);
            io.to(user.room).emit('system message', `${user.username} saiu do chat`);
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