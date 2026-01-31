import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (email: string, password: string, name: string) =>
    api.post("/api/auth/register", { email, password, name }),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  getProfile: () => api.get("/api/auth/profile"),
};

export const projectService = {
  list: () => api.get("/api/projects"),
  create: (name: string, description: string, isPublic: boolean) =>
    api.post("/api/projects", { name, description, isPublic }),
  get: (projectId: string) => api.get(`/api/projects/${projectId}`),
  update: (projectId: string, data: any) =>
    api.put(`/api/projects/${projectId}`, data),
  delete: (projectId: string) => api.delete(`/api/projects/${projectId}`),
};

export default api;
