import { httpClient } from "../config/AxiosHelper";

export const createRoomApi = async (roomId) => {
  const response = await httpClient.post(`/api/v1/rooms`, { roomId }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const joinChatApi = async (roomId) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
  return response.data;
};

export const getMessagess = async (roomId, size = 50, page = 0) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`
  );
  return response.data;
};

export const loginApi = async (username, password) => {
  const response = await httpClient.post(`/api/v1/auth/login`, {
    username,
    password,
  });
  return response.data;
};

export const registerApi = async (username, password) => {
  const response = await httpClient.post(`/api/v1/auth/register`, {
    username,
    password,
  });
  return response.data;
};