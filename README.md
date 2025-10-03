Chat em Tempo Real (NestJS + NATS + Next.js)

Projeto de chat em tempo real com NestJS, NATS (pub/sub e presença), Next.js e MongoDB.

🚀 Funcionalidades

Autenticação de usuários (registro/login com JWT)

Chat 1–1 em tempo real via NATS

Presença (online/offline) usando heartbeats via NATS

Notificações sonoras de novas mensagens no frontend

Interface responsiva (Tailwind opcional)

Testes unitários (Jest) e E2E (Jest/Supertest)

🔧 Tecnologias
Backend

NestJS

NATS (client @nats-io/nats)

MongoDB (Mongoose)

Passport/JWT

Multer (upload de arquivos, opcional)

Frontend

Next.js

nats.ws (ou cliente NATS via API do backend, conforme sua implementação)

Axios / Fetch

Tailwind CSS (opcional)

Arquitetura atual: Frontend (local) ↔ Backend (local) ↔ NATS (Docker) ↔ MongoDB (local ou remoto, a seu critério).

📋 Pré-requisitos

Node.js 18+

MongoDB (local ou remoto)

Docker (para o NATS)

🛠️ Configuração
Variáveis de Ambiente

Backend (./backend/.env)

# API
PORT=4000
FRONTEND_URL=http://localhost:3000

# Mongo
MONGO_URI=mongodb://localhost:27017/chat-db

# JWT
JWT_SECRET=supersecret
JWT_EXPIRES=1d


# Comunicação com o backend
NEXT_PUBLIC_API_URL=http://localhost:4000

# Caso use nats.ws diretamente (apenas se seu NATS habilitar websocket sem TLS):
NEXT_PUBLIC_NATS_WS_URL=ws://localhost:9222


Dica: mantenha apenas uma estratégia de conexão do frontend (via backend ou direto nats.ws). Em produção, recomendo usar o backend como gateway.

▶️ Execução
1) Subir o NATS no Docker

Você pode escolher docker-compose (recomendado) ou docker run.

Opção A — docker-compose (arquivo docker-compose.yml):

services:
  nats:
    image: nats:2
    container_name: nats-local
    command: ["-c", "/etc/nats/nats.conf"]
    ports:
      - "4222:4222"
      - "8222:8222"
      - "9222:9222"   # WebSocket opcional
    volumes:
      - ./nats.conf:/etc/nats/nats.conf:ro
    restart: unless-stopped


Arquivo nats.conf (exemplo com token e websocket sem TLS, apenas para DEV):

port: 4222
http: 8222

websocket {
  port: 9222
  no_tls: true
}

authorization {
  token: "meu_token_supersecreto"
}


Subir o NATS:
docker compose up -d


Logs (opcional):
docker logs -f nats-local


Opção B — docker run:

docker run -d --name nats-local \
  -p 4222:4222 -p 8222:8222 -p 9222:9222 \
  -v $(pwd)/nats.conf:/etc/nats/nats.conf:ro \
  nats:latest -c /etc/nats/nats.conf


⚠️ Se a porta 4222 já estiver em uso, verifique com:
sudo lsof -i :4222 -P -n e finalize o processo conflitando.

2) Rodar o Backend (local)
cd backend
npm install
npm run start:dev


Disponível em http://localhost:4000.

3) Rodar o Frontend (local)
cd frontend
npm install
npm run dev


Disponível em http://localhost:3000.

🧪 Testes
Backend — Unit
cd backend
Para testar os handlers
npm run test:handlers
Para testar os controllers
npm test -- src/**/controllers/*.spec.ts

Backend — E2E
cd backend
npm run test:e2e -- --runInBand --detectOpenHandles


Dicas:

Garanta um MongoDB de teste (ex.: MONGO_URI apontando para DB separado).

Para E2E, suba o NATS antes dos testes ou use um mock client nos testes.

Use --runInBand para evitar condições de corrida com NATS/Mongo.

📝 Fluxo (Diagrama de Sequência)
sequenceDiagram
    participant U as Usuário
    participant F as Frontend (Next.js)
    participant B as Backend (NestJS)
    participant N as NATS (pub/sub)
    participant D as MongoDB

    U->>F: Entra no app / login
    F->>B: POST /auth/login (JWT)
    B-->>F: token JWT (cookie/header)

    U->>F: Abre tela de chat
    F->>B: GET /users /chats (lista, histórico)
    B->>D: Consulta histórico
    D-->>B: Mensagens anteriores
    B-->>F: Retorna histórico

    F->>N: publish presence.heartbeat.<user>
    N-->>B: presence.heartbeat.* (backend processa)
    B-->>F: GET /presence (online/offline)

    U->>F: Envia mensagem
    F->>B: POST /chat (ou publish via gateway)
    B->>N: publish chat.direct.<toUser>
    N-->>B: subscribe chat.direct.<toUser>
    B->>D: Salva mensagem
    D-->>B: OK
    B-->>F: Notifica destinatário (SSE/WebSocket/HTTP push)

📁 Estrutura do Projeto
Backend (NestJS)
backend/
  src/
    auth/          # módulos de auth (JWT/Passport)
    users/         # usuários
    chat/          # use-cases de chat (publish/subscribe)
    presence/      # heartbeats, status online/offline
    nats/          # client/factory de conexão NATS
    common/        # filtros, guards, dtos, utils
    main.ts
  test/
    unit/          # testes unitários (Jest)
    e2e/           # testes de integração/e2e

Frontend (Next.js)
frontend/
  app/ ou pages/   # conforme sua escolha de roteamento
  components/      # componentes UI
  lib/
    api.ts         # chamadas ao backend
    nats.ts        # (opcional) cliente nats.ws para DEV
  styles/          # CSS / Tailwind

🧰 Comandos Úteis

Parar/remover NATS (Docker):

docker compose -f nats/docker-compose.yml down
# ou
docker rm -f nats-local


Limpar imagens não utilizadas:

docker image prune -a


Verificar portas:

sudo lsof -i :4222 -P -n
sudo lsof -i :8222 -P -n
sudo lsof -i :9222 -P -n

👤 Contribuição

Faça fork

git checkout -b feature/nome-da-feature

git commit -m "feat: adiciona X"

git push origin feature/nome-da-feature

Abra um Pull Request

📄 Autor
Francisco de Freitas Kemle
