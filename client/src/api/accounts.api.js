// import api from "./axios";

// export const getAccounts = () =>
//   api.get("/accounts");

// export const syncAccount = (id) =>
//   api.post(`/accounts/${id}/sync`);


import api from "./axios";

export const getAccounts = async () => {
  const { data } = await api.get("/accounts");
  return data;
};

export const connectAccount = async (provider) => {
  const { data } = await api.post("/accounts/connect", { provider });
  return data;
};

export const syncAccount = async (accountId) => {
  const { data } = await api.post(`/accounts/${accountId}/sync`);
  return data;
};

export const disconnectAccount = async (accountId) => {
  const { data } = await api.patch(
    `/accounts/${accountId}/disconnect`
  );
  return data;
};
