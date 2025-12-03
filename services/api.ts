import { apiClient } from '../config/api';

// Authentication
export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    apiClient.post('/auth/signup', { email, password, name }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  getMe: () => apiClient.get('/auth/me'),
};

// Projects
export const projectAPI = {
  getAll: () => apiClient.get('/projects'),

  getById: (id: string) => apiClient.get(`/projects/${id}`),

  create: (name: string) => apiClient.post('/projects', { name }),

  update: (id: string, data: { name?: string; nodes?: any; edges?: any }) =>
    apiClient.put(`/projects/${id}`, data),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};

// Content Extraction
export const contentAPI = {
  transcribe: (url: string) =>
    apiClient.post('/api/transcribe', { url }),

  scrape: (url: string) =>
    apiClient.post('/api/scrape', { url }),
};

// AI Chat
export const chatAPI = {
  sendMessage: (
    message: string,
    history: { role: 'user' | 'model'; text: string }[] = [],
    contextSources: { type: string; title?: string; content: string }[] = [],
    systemInstruction?: string
  ) =>
    apiClient.post('/api/chat/completions', {
      message,
      history,
      contextSources,
      systemInstruction,
    }),
};
