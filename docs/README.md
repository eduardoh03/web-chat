# LuminaChat Documentation

Bem-vindo à documentação do **LuminaChat**, uma aplicação de chat em tempo real moderna e interativa.

## Visão Geral

O LuminaChat é uma plataforma de mensagens instantâneas construída para facilitar a comunicação em tempo real entre usuários. O projeto utiliza tecnologias web modernas para oferecer uma experiência fluida e responsiva.

## Estrutura da Documentação

Esta pasta `docs` contém informações detalhadas sobre o projeto:

- **[Features](features.md)**: Uma lista completa das funcionalidades disponíveis na aplicação.
- **[Tecnologias](technologies.md)**: Detalhes sobre as tecnologias, frameworks e bibliotecas utilizadas.
- **[Sockets](sockets.md)**: Documentação técnica dos eventos WebSocket e como eles funcionam.

## Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.
- [MongoDB](https://www.mongodb.com/) rodando localmente ou uma URI de conexão válida.

### Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione a sua string de conexão do MongoDB:
     ```env
     MONGO_URI=mongodb://localhost:27017/luminachat
     ```

### Execução

Para iniciar o servidor:

```bash
node server.js
```

Acesse a aplicação em `http://localhost:3000`.
