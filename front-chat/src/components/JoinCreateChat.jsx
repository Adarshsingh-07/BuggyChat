// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router";
// import chatIcon from "../assets/chat.png";
// import useChatContext from "../context/ChatContext";
// import { createRoomApi, joinChatApi } from "../services/RoomService";
// const JoinCreateChat = () => {
//   const [detail, setDetail] = useState({
//     roomId: "",
//     userName: "",
//   });

//   const { roomId, userName, setRoomId, setCurrentUser, setConnected } =
//     useChatContext();
//   const navigate = useNavigate();

//   function handleFormInputChange(event) {
//     setDetail({
//       ...detail,
//       [event.target.name]: event.target.value,
//     });
//   }

//   function validateForm() {
//     if (detail.roomId === "" || detail.userName === "") {
//       toast.error("Invalid Input !!");
//       return false;
//     }
//     return true;
//   }

//   async function joinChat() {
//     if (validateForm()) {
//       //join chat

//       try {
//         const room = await joinChatApi(detail.roomId);
//         toast.success("joined..");
//         setCurrentUser(detail.userName);
//         setRoomId(room.roomId);
//         setConnected(true);
//         navigate("/chat");
//       } catch (error) {
//         if (error.status == 400) {
//           toast.error(error.response.data);
//         } else {
//           toast.error("Error in joining room");
//         }
//         console.log(error);
//       }
//     }
//   }

//   async function createRoom() {
//     if (validateForm()) {
//       //create room
//       console.log(detail);
//       // call api to create room on backend
//       try {
//         const response = await createRoomApi(detail.roomId);
//         console.log(response);
//         toast.success("Room Created Successfully !!");
//         //join the room
//         setCurrentUser(detail.userName);
//         setRoomId(response.roomId);
//         setConnected(true);

//         navigate("/chat");

//         //forward to chat page...
//       } catch (error) {
//         console.log(error);
//         if (error.status == 400) {
//           toast.error("Room  already exists !!");
//         } else {
//           toast("Error in creating room");
//         }
//       }
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center ">
//       <div className="p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
//         <div>
//           <img src={chatIcon} className="w-24 mx-auto" />
//         </div>

//         <h1 className="text-2xl font-semibold text-center ">
//           Join Room / Create Room ..
//         </h1>
//         {/* name div */}
//         <div className="">
//           <label htmlFor="name" className="block font-medium mb-2">
//             Your name
//           </label>
//           <input
//             onChange={handleFormInputChange}
//             value={detail.userName}
//             type="text"
//             id="name"
//             name="userName"
//             placeholder="Enter the name"
//             className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* room id div */}
//         <div className="">
//           <label htmlFor="name" className="block font-medium mb-2">
//             Room ID / New Room ID
//           </label>
//           <input
//             name="roomId"
//             onChange={handleFormInputChange}
//             value={detail.roomId}
//             type="text"
//             id="name"
//             placeholder="Enter the room id"
//             className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* button  */}
//         <div className="flex justify-center gap-2 mt-4">
//           <button
//             onClick={joinChat}
//             className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-full"
//           >
//             Join Room
//           </button>
//           <button
//             onClick={createRoom}
//             className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-orange-800 rounded-full"
//           >
//             Create Room
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JoinCreateChat;
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import chatIcon from "../assets/chat.png";
import useChatContext from "../context/ChatContext";
import { createRoomApi, joinChatApi } from "../services/RoomService";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({ roomId: "", userName: "" });
  const [loading, setLoading] = useState(null); // 'join' | 'create' | null
  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({ ...detail, [event.target.name]: event.target.value });
  }

  function validateForm() {
    if (!detail.roomId.trim() || !detail.userName.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;
    setLoading("join");
    try {
      const room = await joinChatApi(detail.roomId);
      toast.success("Joined room!");
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      toast.error(error.status === 400 ? error.response.data : "Room not found");
    } finally {
      setLoading(null);
    }
  }

  async function createRoom() {
    if (!validateForm()) return;
    setLoading("create");
    try {
      const response = await createRoomApi(detail.roomId);
      toast.success("Room created!");
      setCurrentUser(detail.userName);
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      toast.error(error.status === 400 ? "Room already exists" : "Error creating room");
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
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: drift3 12s ease-in-out infinite alternate;
        }

        @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(40px, 30px); } }
        @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-30px, -40px); } }
        @keyframes drift3 { from { transform: translate(-50%,-50%) scale(1); } to { transform: translate(-50%,-50%) scale(1.2); } }

        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(15, 20, 35, 0.85);
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
          margin-bottom: 32px;
        }

        .field {
          margin-bottom: 18px;
        }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
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

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0 24px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .divider-text {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-group {
          display: flex;
          gap: 12px;
        }

        .btn {
          flex: 1;
          padding: 13px 0;
          border-radius: 12px;
          border: none;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-join {
          background: rgba(99,102,241,0.15);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,0.3);
        }
        .btn-join:hover:not(:disabled) {
          background: rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.6);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(99,102,241,0.2);
        }

        .btn-create {
          background: linear-gradient(135deg, #6366f1, #ec4899);
          color: #fff;
          border: none;
        }
        .btn-create:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
          filter: brightness(1.1);
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

        .bottom-note {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
        }
        .bottom-note span {
          color: rgba(99,102,241,0.7);
        }
      `}</style>

      <div className="join-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="card">
          <div className="logo-wrap">
            <img src={chatIcon} alt="BuggyChat" />
          </div>

          <h1 className="card-title">BuggyChat</h1>
          <p className="card-subtitle">Real-time messaging, built different</p>

          <div className="field">
            <label>Your name</label>
            <input
              type="text"
              name="userName"
              value={detail.userName}
              onChange={handleFormInputChange}
              placeholder="e.g. adarsh_dev"
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label>Room ID</label>
            <input
              type="text"
              name="roomId"
              value={detail.roomId}
              onChange={handleFormInputChange}
              placeholder="e.g. general-chat"
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && joinChat()}
            />
          </div>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">choose action</span>
            <div className="divider-line" />
          </div>

          <div className="btn-group">
            <button
              className="btn btn-join"
              onClick={joinChat}
              disabled={loading !== null}
            >
              {loading === "join" && <span className="btn-spinner" />}
              Join Room
            </button>
            <button
              className="btn btn-create"
              onClick={createRoom}
              disabled={loading !== null}
            >
              {loading === "create" && <span className="btn-spinner" />}
              Create Room
            </button>
          </div>

          <p className="bottom-note">
            Powered by <span>Redis</span> · <span>Kafka</span> · <span>WebSocket</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default JoinCreateChat;