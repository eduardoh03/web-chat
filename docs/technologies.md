# Tecnologias Usadas

O LuminaChat foi construído utilizando uma stack moderna e eficiente para aplicações web em tempo real.

## Backend (Servidor)

- **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript server-side, escolhido por sua eficiência em lidar com múltiplas conexões simultâneas (I/O não bloqueante).
- **[Express](https://expressjs.com/)**: Framework web minimalista para Node.js, utilizado para gerenciar rotas e servir arquivos estáticos.
- **[Socket.io](https://socket.io/)**: Biblioteca que possibilita a comunicação bidirecional em tempo real baseada em eventos entre o cliente e o servidor.
- **[Mongoose](https://mongoosejs.com/)**: Biblioteca de modelagem de dados de objetos (ODM) para MongoDB e Node.js, facilitando a interação com o banco de dados.
- **[Dotenv](https://www.npmjs.com/package/dotenv)**: Módulo para carregar variáveis de ambiente de um arquivo `.env`.

## Frontend (Cliente)

- **HTML5**: Estrutura semântica da aplicação.
- **CSS3**: Estilização da interface, incluindo layout responsivo e design visual.
- **JavaScript (Vanilla)**: Lógica do lado do cliente para manipulação do DOM e interação com o servidor via Socket.io Client.
- **Socket.io Client**: Biblioteca cliente para conectar e interagir com o servidor Socket.io.

## Banco de Dados

- **[MongoDB](https://www.mongodb.com/)**: Banco de dados NoSQL orientado a documentos, utilizado para armazenar o histórico de mensagens de forma flexível e escalável.
