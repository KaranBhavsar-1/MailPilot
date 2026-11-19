
import api from "./axios";

export const createReplyDraft = (threadId, data = {}) =>
  api.post(`/ai/draft/${threadId}`, data);

export const updateDraft = (id, data) =>
  api.patch(`/drafts/${id}`, data);

export const regenerateDraft = (id, data = {}) =>
  api.post(`/drafts/${id}/regenerate`, data);

export const discardDraft = (id) =>
  api.post(`/drafts/${id}/discard`);

export const approveDraft = (id) =>
  api.post(`/drafts/${id}/approve-send`);
