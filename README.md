# 💬 BuggyChat — Distributed Real-Time Chat System

![CI](https://github.com/Adarshsingh-07/BuggyChat/actions/workflows/ci.yml/badge.svg)

A production-grade, distributed real-time chat backend built with **Spring Boot**, **Redis Pub/Sub**, **Apache Kafka**, and **WebSocket (STOMP)**. Designed to demonstrate distributed systems concepts relevant to FAANG-level engineering.

---

## 🏗 Architecture

```
Browser (React + SockJS)
        │
        ▼
Spring Boot WebSocket (STOMP)
        │
        ├──► Redis Pub/Sub ──► Instant message fanout to all subscribers
        │
        └──► Kafka Producer ──► Topic: chat-messages
                                        │
                                        ▼
                               Kafka Consumer ──► MongoDB (async persistence)
```

**Why both Redis and Kafka?**
- **Redis** handles instant delivery (sub-millisecond fanout) — users see messages immediately
- **Kafka** handles reliable persistence — MongoDB write happens asynchronously, completely off the critical path
- This decouples latency from durability — a core distributed systems pattern used at Slack, LinkedIn, and Uber

---

## ✨ Features

- 🔴 **Real-time messaging** via WebSocket (STOMP over SockJS)
- 🚀 **Redis Pub/Sub** for instant message delivery across multiple instances
- 📨 **Kafka async persistence** — MongoDB writes are decoupled from message delivery
- 🔐 **JWT Authentication** — stateless, per-user identity with token expiry
- 🛡 **Distributed Rate Limiting** — Redis sliding window algorithm (prevents burst attacks)
- 🏠 **Room-based chat** — create or join named rooms
- 📋 **Paginated message history** — load previous messages on join
- 🔍 **Correlation ID logging** — trace requests across all services
- 🐳 **Fully Dockerized** — 4 services orchestrated with Docker Compose
- ✅ **16 automated tests** — unit + integration tests with JUnit 5 and Mockito
- 🔄 **CI/CD pipeline** — GitHub Actions runs tests on every push

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 4.x |
| Real-time | WebSocket, STOMP, SockJS |
| Messaging | Apache Kafka (KRaft mode) |
| Cache/Pub-Sub | Redis 7.2 |
| Database | MongoDB 7.0 |
| Auth | JWT (jjwt 0.12.6), BCrypt |
| Security | Spring Security, Rate Limiting |
| Frontend | React (Vite), Tailwind CSS |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Testing | JUnit 5, Mockito, MockMvc |

---

## 📂 Project Structure

```
BuggyChat/
├── chat-app-backend/           # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/substring/chat/
│   │       ├── config/         # Kafka, Redis, WebSocket, CORS, Jackson config
│   │       ├── controllers/    # REST + WebSocket controllers
│   │       ├── entities/       # MongoDB documents (Message, Room, User)
│   │       ├── exceptions/     # Global exception handler
│   │       ├── playload/       # Request/Response DTOs
│   │       ├── repositories/   # MongoDB repositories
│   │       ├── security/       # JWT filter, Rate limit filter, Correlation ID filter
│   │       └── service/        # Business logic, Kafka consumer, Redis publisher
│   ├── src/test/               # 16 unit + integration tests
│   ├── Dockerfile              # 2-stage build
│   ├── docker-compose.yml      # 4-service orchestration
│   └── pom.xml
│
└── front-chat/                 # React frontend
    ├── src/
    │   ├── components/         # ChatPage, JoinCreateChat
    │   ├── config/             # Axios, routing
    │   ├── context/            # ChatContext (token, user, room state)
    │   └── services/           # API calls (auth, rooms, messages)
    └── package.json
```

---

## ⚙️ How It Works

1. User registers/logs in → receives JWT token
2. Frontend stores token in localStorage, attaches to every request via Axios interceptor
3. User creates or joins a room
4. Frontend establishes WebSocket connection via SockJS
5. User sends a message → goes to `ChatServiceImpl`
6. Service publishes to Redis channel → all subscribers receive instantly
7. Service publishes to Kafka topic → consumer saves to MongoDB asynchronously
8. All subscribers see the message in real time via Redis → WebSocket → browser

---

## 🔒 Security

- **JWT Authentication** — all REST endpoints require `Authorization: Bearer <token>`
- **BCrypt password hashing** — passwords never stored in plain text
- **Redis sliding window rate limiting** — 60 requests/minute per user, works across multiple instances
- **Correlation ID filter** — every request tagged with a unique ID for tracing
- **Protected frontend routes** — unauthenticated users redirected to login

---

## ▶️ Run Locally with Docker

**Prerequisites:** Docker Desktop

```bash
git clone https://github.com/Adarshsingh-07/BuggyChat.git
cd BuggyChat/chat-app-backend
docker-compose up --build
```

Services start at:
- App: `http://localhost:8080`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- Kafka: `localhost:9092`

**Frontend:**
```bash
cd front-chat
npm install
npm run dev
```
Frontend: `http://localhost:5173`

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |

### Rooms
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/rooms` | ✅ | Create a room |
| GET | `/api/v1/rooms/{roomId}` | ✅ | Get room details |
| GET | `/api/v1/rooms/{roomId}/messages` | ✅ | Get paginated messages |

### WebSocket
| Purpose | Endpoint |
|---------|----------|
| Handshake | `/chat` |
| Send message | `/app/sendMessage/{roomId}` |
| Subscribe | `/topic/room/{roomId}` |

---

## 🧪 Tests

```bash
cd chat-app-backend
mvn test
```

16 tests across 3 test classes:
- `ChatServiceImplTest` — unit tests for message flow, Redis/Kafka publish
- `RoomServiceImplTest` — unit tests for room CRUD and pagination
- `RoomControllerTest` — MockMvc integration tests for REST endpoints

---

## 📊 Design Decisions & Tradeoffs

**Why Redis AND Kafka?**
Redis pub/sub is fire-and-forget — fast but not durable. Kafka is durable but has higher latency. Using both gives instant delivery (Redis) with guaranteed persistence (Kafka).

**Why not save to MongoDB directly?**
Direct MongoDB writes on the message path adds latency. Async via Kafka keeps the critical path fast — the user gets instant feedback while persistence happens in the background.

**Why sliding window rate limiting over fixed window?**
Fixed windows allow burst attacks (60 requests at 00:59 + 60 at 01:00 = 120 in 2 seconds). Sliding window counts requests in the last 60 seconds at any point in time, eliminating bursts.

---

## 👨‍💻 Author

**Adarsh Kumar**
Final-year CSE student | Backend & Distributed Systems

---

## 🚧 Future Improvements

- [ ] Message delivery receipts (✓ sent, ✓✓ delivered)
- [ ] Online presence tracking using Redis Sets
- [ ] Kubernetes deployment with horizontal scaling
- [ ] WebSocket rate limiting per connection
- [ ] End-to-end message encryption
