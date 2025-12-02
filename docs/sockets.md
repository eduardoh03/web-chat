# Documentação dos Sockets

Esta página detalha a implementação da comunicação em tempo real via WebSockets utilizando a biblioteca **Socket.io**. A comunicação é baseada em eventos emitidos e ouvidos tanto pelo cliente quanto pelo servidor.

## Estrutura de Dados

### Objeto de Usuário (Memória do Servidor)
O servidor mantém um registro dos usuários conectados em memória:
```javascript
const users = {
    [socketId]: {
        username: String, // Nome do usuário
        room: String      // Sala atual (ex: 'Geral' ou 'user1_user2')
    }
};
```

### Modelo de Mensagem (MongoDB)
```javascript
{
    username: String,
    room: String,
    msg: String,
    timestamp: Date
}
```

---

## Eventos do Servidor (Server-side)

Estes são os eventos que o servidor escuta (`socket.on`) e como ele reage a eles.

### `connection`
- **Descrição**: Disparado automaticamente quando um novo cliente se conecta.
- **Ação**: Loga o ID do socket e prepara os listeners para esse cliente.

### `join`
- **Payload**: `{ username: String, room: String }`
- **Descrição**: Solicitação de um usuário para entrar em uma sala (padrão ou temática).
- **Ações**:
    1. Remove o usuário da sala anterior (se houver) e notifica a saída.
    2. Registra o usuário na nova sala.
    3. Emite `system message` para a nova sala avisando da entrada.
    4. Busca as últimas 50 mensagens dessa sala no MongoDB e as envia apenas para o usuário que entrou.

### `join dm`
- **Payload**: `{ targetUsername: String }`
- **Descrição**: Solicitação para iniciar ou retomar uma conversa privada (Direct Message).
- **Ações**:
    1. Gera um ID de sala único combinando os nomes dos dois usuários em ordem alfabética (ex: `alice_bob`).
    2. Move o usuário solicitante para essa sala privada.
    3. Emite `dm joined` para o solicitante.
    4. Busca o socket do `targetUsername` e emite `dm notification` para ele, avisando que alguém quer conversar.
    5. Carrega o histórico de mensagens dessa DM.

### `chat message`
- **Payload**: `msg: String` (Apenas o texto da mensagem)
- **Descrição**: Usuário enviou uma nova mensagem de texto.
- **Ações**:
    1. Identifica o remetente e a sala atual.
    2. Salva a mensagem no MongoDB.
    3. Reemite o evento `chat message` para **todos** na sala (incluindo o remetente) com o formato `{ username, msg }`.

### `typing`
- **Payload**: `(vazio)`
- **Descrição**: Usuário começou a digitar.
- **Ações**:
    1. Emite o evento `typing` para todos na sala **exceto** o remetente, enviando `{ username }`.

### `disconnect`
- **Descrição**: Disparado quando o usuário fecha a aba ou perde a conexão.
- **Ações**:
    1. Notifica a sala atual com `system message`.
    2. Remove o usuário da lista de usuários em memória.

---

## Eventos do Cliente (Client-side)

Estes são os eventos que o cliente escuta (`socket.on`) para atualizar a interface.

### `chat message`
- **Payload**: `{ username: String, msg: String }`
- **Ação**: Cria um elemento de mensagem na interface. Se `username` for o próprio usuário, aplica estilo de "enviada", caso contrário, "recebida".

### `system message`
- **Payload**: `msg: String`
- **Ação**: Exibe uma mensagem centralizada e estilizada (geralmente cinza) informando eventos como entrada/saída de usuários.

### `typing`
- **Payload**: `{ username: String }`
- **Ação**: Exibe um indicador "Fulano está digitando..." por alguns segundos. O indicador é removido automaticamente após um timeout ou se uma mensagem for recebida.

### `dm joined`
- **Payload**: `{ room: String, target: String }`
- **Ação**:
    1. Atualiza a variável de sala atual no cliente.
    2. Limpa a área de mensagens.
    3. Adiciona (se não existir) e ativa o item da DM na lista lateral de conversas.

### `dm notification`
- **Payload**: `{ sender: String, room: String }`
- **Ação**: Adiciona o remetente à lista de DMs na barra lateral, permitindo que o usuário clique para entrar na conversa. Pode incluir indicadores visuais de "nova conversa".
