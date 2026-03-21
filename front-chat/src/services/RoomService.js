// import { httpClient } from "../config/AxiosHelper";

// export const createRoomApi = async (roomDetail) => {
//   const respone = await httpClient.post(`/api/v1/rooms`, roomDetail, {
//     headers: {
//       "Content-Type": "text/plain",
//     },
//   });
//   return respone.data;
// };

// export const joinChatApi = async (roomId) => {
//   const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
//   return response.data;
// };

// export const getMessagess = async (roomId, size = 50, page = 0) => {
//   const response = await httpClient.get(
//     `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`
//   );
//   return response.data;
// };
import { httpClient } from "../config/AxiosHelper";

const API_KEY = "chat-secret-key";

export const createRoomApi = async (roomId) => {
  const response = await httpClient.post(`/api/v1/rooms`, { roomId }, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  return response.data;
};

export const joinChatApi = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}`, {
    headers: {
      "X-API-KEY": API_KEY,
    },
  });
  return response.data;
};

export const getMessagess = async (roomId, size = 50, page = 0) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`,
    {
      headers: {
        "X-API-KEY": API_KEY,
      },
    }
  );
  return response.data;
};