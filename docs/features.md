# Funcionalidades (Features)

O LuminaChat oferece um conjunto de funcionalidades focadas na comunicação em tempo real e usabilidade.

## 1. Chat em Tempo Real
- **Mensagens Instantâneas**: Envio e recebimento de mensagens sem a necessidade de recarregar a página.
- **Baixa Latência**: Utilização de WebSockets para comunicação bidirecional rápida.

## 2. Salas de Bate-papo (Rooms)
- **Múltiplas Salas**: Os usuários podem navegar entre diferentes salas temáticas.
- **Sala Padrão**: Ao entrar, o usuário é direcionado automaticamente para a sala "Geral".
- **Isolamento de Contexto**: Mensagens enviadas em uma sala são visíveis apenas para os participantes daquela sala.

## 3. Mensagens Diretas (DM)
- **Conversas Privadas**: Possibilidade de iniciar conversas privadas com outros usuários conectados.
- **Notificações de DM**: Alerta visual quando um usuário recebe uma nova mensagem direta de alguém com quem não estava conversando.
- **Gerenciamento de DMs**: Interface para listar e fechar conversas privadas ativas.

## 4. Histórico de Mensagens
- **Persistência**: As mensagens são salvas em um banco de dados MongoDB.
- **Recuperação de Histórico**: Ao entrar em uma sala ou DM, as últimas 50 mensagens são carregadas automaticamente, permitindo que o usuário veja o contexto da conversa.

## 5. Indicadores de Atividade
- **"Digitando..."**: Feedback visual em tempo real quando outro usuário está escrevendo uma mensagem na mesma sala.
- **Notificações de Sistema**: Mensagens automáticas informando quando usuários entram ou saem da sala.

## 6. Identificação de Usuário
- **Login Simples**: Sistema de entrada simplificado onde o usuário escolhe um nome de usuário (username) para se identificar na sessão.
