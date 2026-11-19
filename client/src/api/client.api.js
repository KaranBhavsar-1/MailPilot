// import api from "./axios";

// export const getClientInbox = () =>
//   api.get("/client/inbox");

// export const getClientThreads = () =>
//   api.get("/client/threads");

// export const getClientThreadById = (id) =>
//   api.get(`/client/threads/${id}`);


// export const markClientHandled = (threadId) =>
//   api.patch(`/client/threads/${threadId}/handled`);

// export const requestAssistantHelp = (threadId) =>
//   api.post(`/client/threads/${threadId}/request-help`);

// export const handoffClientThread = (id) =>
//   api.patch(`/client/threads/${id}/handoff`);



import api from "./axios";

export const getClientThreads = () =>
  api.get("/client/threads");

export const getClientThreadById = (id) =>
  api.get(`/client/threads/${id}`);

export const handleClientThread = (id) =>
  api.patch(`/client/threads/${id}/handled`);

export const handoffClientThread = (id) =>
  api.patch(`/client/threads/${id}/handoff`);
