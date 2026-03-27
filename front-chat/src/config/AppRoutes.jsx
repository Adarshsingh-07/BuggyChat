import { Navigate, Route, Routes } from "react-router";
import App from "../App";
import ChatPage from "../components/ChatPage";
import useChatContext from "../context/ChatContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useChatContext();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<h1>404 Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;