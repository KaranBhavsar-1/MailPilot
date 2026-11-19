// import api from "./axios";

// export const getThreads = (params = {}) =>
//   api.get("/threads", { params });

// export const getThreadById = (id) =>
//   api.get(`/threads/${id}`);

// export const updateThread = (id, data) =>
//   api.patch(`/threads/${id}`, data);  


// import api from "./axios";

// export const getThreads = (params = {}) =>
//   api.get("/threads", { params });

// export const getThreadById = (id) =>
//   api.get(`/threads/${id}`);

// export const updateThread = (id, data) =>
//   api.patch(`/threads/${id}`, data);

// export const getThreadStats = () =>
//   api.get("/threads/stats");


import api from "./axios";

export const getThreads = (params = {}) =>
  api.get("/threads", { params });

export const getThreadById = (id) =>
  api.get(`/threads/${id}`);

export const updateThread = (id, data) =>
  api.patch(`/threads/${id}`, data);

export const getThreadStats = () =>
  api.get("/threads/stats");

export const updateThreadClassification = (id, data) =>
  api.patch(`/threads/${id}/classification`, data);

export const resetThreadClassification = (id) =>
  api.patch(`/threads/${id}/classification/reset`);

// Run AI analysis on a conversation.
export const analyzeThread = (id) =>
  api.post(`/threads/${id}/analyze`);

export const simulateIncomingEmail = (data) =>
  api.post("/threads/simulate-incoming", data);

export const getUpcomingDates = () =>
  api.get("/threads/upcoming-dates");