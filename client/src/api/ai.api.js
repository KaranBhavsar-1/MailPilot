import api from "./axios";

export const analyzeThread = (threadId) =>
  api.post(`/ai/analyze/${threadId}`);

export const generateReply = (threadId, data = {}) =>
  api.post(`/ai/draft/${threadId}`, data);

export const chatWithInbox = (question) =>
  api.post("/ai/chat", { question });