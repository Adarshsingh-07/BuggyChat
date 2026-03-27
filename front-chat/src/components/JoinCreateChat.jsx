import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import chatIcon from "../assets/chat.png";
import useChatContext from "../context/ChatContext";
import { createRoomApi, joinChatApi, loginApi, registerApi } from "../services/RoomService";

const JoinCreateChat = () => {
  const [activeTab, setActiveTab] = useState("login"); // login | register | room
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(null);

  const { setRoomId: setContextRoomId, setCurrentUser, setConnected, setToken } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
  const savedToken = localStorage.getItem("token");
  if (savedToken) {
    setActiveTab("room");
  }
}, []);
  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading("login");
    try {
      const response = await loginApi(username, password);
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setCurrentUser(response.username);
      toast.success("Logged in!");
      setActiveTab("room");
    } catch (error) {
      toast.error(error.response?.status === 401 ? "Invalid credentials" : "Login failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleRegister() {
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading("register");
    try {
      const response = await registerApi(username, password);
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setCurrentUser(response.username);
      toast.success("Account created!");
      setActiveTab("room");
    } catch (error) {
      toast.error(error.response?.status === 409 ? "Username already taken" : "Registration failed");
    } finally {
      setLoading(null);
    }
  }

  async function joinRoom() {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    setLoading("join");
    try {
      const room = await joinChatApi(roomId);
      setContextRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      toast.error("Room not found");
    } finally {
      setLoading(null);
    }
  }

  async function createRoom() {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    setLoading("create");
    try {
      const response = await createRoomApi(roomId);
      setContextRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      toast.error(error.response?.status === 409 ? "Room already exists" : "Error creating room");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .join-root {
          min-height: 100vh;
          background: #080b14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: drift1 8s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation: drift2 10s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(40px,30px); } }
        @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-30px,-40px); } }
        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(15,20,35,0.85);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 24px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.5);
          animation: fadeUp 0.6s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .logo-wrap img {
          width: 72px;
          filter: drop-shadow(0 0 20px rgba(99,102,241,0.6));
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          text-align: center;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .card-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin-bottom: 24px;
        }
        .tabs {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .tab {
          flex: 1;
          padding: 8px 0;
          border: none;
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          background: transparent;
          color: rgba(255,255,255,0.4);
        }
        .tab.active {
          background: rgba(99,102,241,0.2);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,0.3);
        }
        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .field input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .btn {
          width: 100%;
          padding: 13px 0;
          border-radius: 12px;
          border: none;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          margin-top: 8px;
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #ec4899);
          color: #fff;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
          filter: brightness(1.1);
        }
        .btn-secondary {
          background: rgba(99,102,241,0.15);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,0.3);
        }
        .btn-secondary:hover:not(:disabled) {
          background: rgba(99,102,241,0.25);
          transform: translateY(-1px);
        }
        .btn-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: 6px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-group { display: flex; gap: 10px; margin-top: 8px; }
        .btn-group .btn { margin-top: 0; }
        .bottom-note {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
        }
        .bottom-note span { color: rgba(99,102,241,0.7); }
      `}</style>

      <div className="join-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="card">
          <div className="logo-wrap">
            <img src={chatIcon} alt="BuggyChat" />
          </div>
          <h1 className="card-title">BuggyChat</h1>
          <p className="card-subtitle">Real-time messaging, built different</p>

          <div className="tabs">
            <button
              className={`tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >Login</button>
            <button
              className={`tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >Register</button>
            <button
              className={`tab ${activeTab === "room" ? "active" : ""}`}
              onClick={() => setActiveTab("room")}
            >Room</button>
          </div>

          {activeTab === "login" && (
            <>
              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <button className="btn btn-primary" onClick={handleLogin} disabled={loading !== null}>
                {loading === "login" && <span className="btn-spinner" />}
                Login
              </button>
            </>
          )}

          {activeTab === "register" && (
            <>
              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
              </div>
              <button className="btn btn-primary" onClick={handleRegister} disabled={loading !== null}>
                {loading === "register" && <span className="btn-spinner" />}
                Create Account
              </button>
            </>
          )}

          {activeTab === "room" && (
            <>
              <div className="field">
                <label>Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  autoComplete="off"
                />
              </div>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={joinRoom} disabled={loading !== null}>
                  {loading === "join" && <span className="btn-spinner" />}
                  Join Room
                </button>
                <button className="btn btn-primary" onClick={createRoom} disabled={loading !== null}>
                  {loading === "create" && <span className="btn-spinner" />}
                  Create Room
                </button>
              </div>
            </>
          )}

          <p className="bottom-note">
            Powered by <span>Redis</span> · <span>Kafka</span> · <span>WebSocket</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default JoinCreateChat;