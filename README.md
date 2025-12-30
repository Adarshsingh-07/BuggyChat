# 💬 Real-Time Chat Application

A real-time, room-based chat application built using **Spring Boot WebSocket (STOMP)** and **React (Vite)**.  
This project demonstrates real-time communication, clean frontend–backend separation, and production-style WebSocket handling.

---

## 🚀 Features

- 🔴 Real-time messaging using WebSocket (STOMP)
- 🏠 Room-based chat system
- 🔄 Auto-reconnect WebSocket support
- ⏱ Message timestamps
- 🧹 Clean connect & disconnect handling
- 📱 Responsive UI with Tailwind CSS

---

## 🛠 Tech Stack

### Backend
- Java
- Spring Boot
- Spring WebSocket
- STOMP Protocol
- SockJS
- Maven

### Frontend
- React (Vite)
- Tailwind CSS
- STOMP.js
- SockJS Client
- Axios

---

## 📂 Project Structure

Chat-App/
│
├── chat-app-backend/        # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── README.md
│
├── front-chat/              # React frontend
│   ├── src/
│   ├── package.json
│   └── README.md
│
└── README.md


---

## ⚙️ How It Works

1. Users join or create a chat room
2. Frontend establishes a WebSocket connection using SockJS
3. Messages are sent via STOMP to the backend
4. Backend broadcasts messages to all users in the room
5. Clients receive updates in real time

---

## ▶️ Run Locally

Backend (Spring Boot)

```bash
cd chat-app-backend
mvn spring-boot:run
Backend runs at:
http://localhost:8080

Frontend (React)
cd front-chat
npm install
npm run dev
Frontend runs at:
http://localhost:5173

🌐 WebSocket Endpoints
Purpose	Endpoint
WebSocket handshake	/chat
Send message	/app/sendMessage/{roomId}
Subscribe	/topic/room/{roomId}


🔒 CORS Handling
WebSocket CORS is configured using:
setAllowedOriginPatterns("*")
Required for SockJS handshake (/chat/info)

🧪 Future Improvements

✅ Message delivery status (✓ / ✓✓)

🔐 JWT-secured WebSocket

💤 Offline message storage

🟢 Online user presence using Redis

📦 Docker support

👨‍💻 Author

Adarsh Kumar
Final-year CSE student | Full-stack & Spring Boot developer
