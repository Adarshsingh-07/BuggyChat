import { Stomp } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MdAttachFile, MdSend } from "react-icons/md";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper";
import { timeAgo } from "../config/helper";
import useChatContext from "../context/ChatContext";
import { getMessagess } from "../services/RoomService";

const ChatPage = () => {
  const {
    roomId, currentUser, connected,
    setConnected, setRoomId, setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const stompClientRef = useRef(null);
  const onlineCount = [...new Set(messages.map(m => m.sender))].length;

  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await getMessagess(roomId);
        setMessages(msgs);
      } catch {}
    }
    if (connected) loadMessages();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!connected) return;

    const sock = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(sock);
    client.debug = () => {};

    client.connect({}, () => {
      stompClientRef.current = client;
      toast.success("Connected to room");
     client.subscribe(`/topic/room/${roomId}`, (message) => {
  const newMessage = JSON.parse(message.body);
  console.log("RAW:", JSON.stringify(newMessage));
  setMessages((prev) => [...prev, newMessage]);
});
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
        stompClientRef.current = null;
      }
    };
  }, [roomId]);

  const sendMessage = () => {
    if (stompClientRef.current && connected && input.trim()) {
      const message = { sender: currentUser, content: input, roomId };
      stompClientRef.current.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
    }
  };

  function handleLogout() {
    if (stompClientRef.current) stompClientRef.current.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  const getAvatar = (name) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1,ec4899,3b82f6&backgroundType=gradientLinear`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .chat-root {
          height: 100vh;
          background: #080b14;
          display: flex;
          flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }
        .chat-bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .chat-bg-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          top: -200px; right: -100px;
        }
        .chat-bg-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%);
          bottom: -100px; left: -100px;
        }
        .chat-header {
          position: relative;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 64px;
          background: rgba(10, 14, 25, 0.95);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .room-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          padding: 6px 14px;
        }
        .room-dot {
          width: 7px; height: 7px;
          background: #4ade80;
          border-radius: 50%;
          box-shadow: 0 0 6px #4ade80;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .room-badge-text {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #818cf8;
          letter-spacing: 0.3px;
        }
        .online-pill {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 4px 10px;
        }
        .header-center { display: flex; align-items: center; gap: 8px; }
        .user-avatar-sm {
          width: 30px; height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(99,102,241,0.4);
        }
        .header-username {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }
        .leave-btn {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          padding: 7px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .leave-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: rgba(239,68,68,0.5);
          transform: translateY(-1px);
        }
        .messages-area {
          position: relative;
          z-index: 1;
          flex: 1;
          overflow-y: auto;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
        .messages-inner {
          max-width: 760px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .msg-row {
          display: flex;
          gap: 10px;
          padding: 2px 0;
          animation: msgIn 0.25s ease both;
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-row.own { flex-direction: row-reverse; }
        .msg-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.08);
          margin-top: 2px;
        }
        .msg-content { max-width: 65%; display: flex; flex-direction: column; gap: 4px; }
        .msg-row.own .msg-content { align-items: flex-end; }
        .msg-sender {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          padding: 0 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .msg-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }
        .msg-row:not(.own) .msg-bubble {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          border-bottom-left-radius: 4px;
        }
        .msg-row.own .msg-bubble {
          background: linear-gradient(135deg, rgba(99,102,241,0.7), rgba(139,92,246,0.7));
          border: 1px solid rgba(99,102,241,0.3);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .msg-time {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          padding: 0 4px;
        }
        .date-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0 8px; }
        .date-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
        .date-divider-text {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .input-bar {
          position: relative;
          z-index: 100;
          flex-shrink: 0;
          padding: 12px 16px 16px;
          background: rgba(10, 14, 25, 0.95);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .input-inner {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 6px 6px 6px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-inner:focus-within {
          border-color: rgba(99,102,241,0.4);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255,255,255,0.85);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 6px 0;
          caret-color: #818cf8;
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.2); }
        .input-actions { display: flex; gap: 6px; align-items: center; }
        .icon-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .attach-btn { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); }
        .attach-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .send-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          width: 42px; height: 42px;
          border-radius: 12px;
        }
        .send-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); filter: brightness(1.1); }
        .send-btn:active { transform: translateY(0); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: rgba(255,255,255,0.15);
          font-size: 14px;
          padding: 40px;
        }
        .empty-state-icon { font-size: 48px; filter: grayscale(1) opacity(0.3); }
      `}</style>

      <div className="chat-root">
        <div className="chat-bg-orb chat-bg-orb-1" />
        <div className="chat-bg-orb chat-bg-orb-2" />

        <header className="chat-header">
          <div className="header-left">
            <div className="room-badge">
              <div className="room-dot" />
              <span className="room-badge-text"># {roomId}</span>
            </div>
            <span className="online-pill">{onlineCount} {onlineCount === 1 ? "participant" : "participants"}</span>
          </div>
          <div className="header-center">
            <img className="user-avatar-sm" src={getAvatar(currentUser)} alt={currentUser} />
            <span className="header-username">{currentUser}</span>
          </div>
          <button className="leave-btn" onClick={handleLogout}>Leave Room</button>
        </header>

        <main className="messages-area" ref={chatBoxRef}>
          <div className="messages-inner">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <span>No messages yet. Say hello!</span>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.sender === currentUser;
                const showDateDivider = index === 0 ||
                  new Date(messages[index - 1]?.timestamp).toDateString() !==
                  new Date(message.timestamp).toDateString();
                return (
                  <div key={index}>
                    {showDateDivider && (
                      <div className="date-divider">
                        <div className="date-divider-line" />
                        <span className="date-divider-text">
                          {new Date(message.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <div className="date-divider-line" />
                      </div>
                    )}
                    <div className={`msg-row ${isOwn ? "own" : ""}`}>
                      <img className="msg-avatar" src={getAvatar(message.sender)} alt={message.sender} />
                      <div className="msg-content">
                        {!isOwn && <span className="msg-sender">{message.sender}</span>}
                        <div className="msg-bubble">{message.content}</div>
                        <span className="msg-time">{timeAgo(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        <div className="input-bar">
          <div className="input-inner">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={`Message #${roomId}...`}
              type="text"
            />
            <div className="input-actions">
              <button className="icon-btn attach-btn"><MdAttachFile size={18} /></button>
              <button className="icon-btn send-btn" onClick={sendMessage} disabled={!input.trim()}>
                <MdSend size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;