import api from "./axios";

export const signupUser = (data) =>
  api.post("/auth/signup", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const getCurrentUser = () =>
  api.get("/auth/me");