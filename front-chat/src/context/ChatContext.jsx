import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("username") || "");
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const handleSetCurrentUser = (username) => {
    localStorage.setItem("username", username);
    setCurrentUser(username);
  };

  const handleSetToken = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,
        connected,
        token,
        setRoomId,
        setCurrentUser: handleSetCurrentUser,
        setConnected,
        setToken: handleSetToken,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);
export default useChatContext;