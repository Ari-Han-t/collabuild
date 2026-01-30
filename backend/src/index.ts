import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { config } from "./utils/config";
import { authMiddleware, errorHandler } from "./middleware/auth";
import { setupWebSocket } from "./websocket/handlers";
import { authController } from "./controllers/auth";
import { projectController } from "./controllers/project";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
app.post("/api/auth/register", (req, res) => authController.register(req, res));
app.post("/api/auth/login", (req, res) => authController.login(req, res));
app.get("/api/auth/profile", authMiddleware, (req, res) =>
  authController.getProfile(req, res)
);

// Project routes
app.get("/api/projects", authMiddleware, (req, res) =>
  projectController.listProjects(req, res)
);
app.post("/api/projects", authMiddleware, (req, res) =>
  projectController.createProject(req, res)
);
app.get("/api/projects/:projectId", authMiddleware, (req, res) =>
  projectController.getProject(req, res)
);
app.put("/api/projects/:projectId", authMiddleware, (req, res) =>
  projectController.updateProject(req, res)
);
app.delete("/api/projects/:projectId", authMiddleware, (req, res) =>
  projectController.deleteProject(req, res)
);

// Setup WebSocket handlers
setupWebSocket(io);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready`);
  console.log(`🌐 CORS enabled for ${config.cors.origin}`);
});

export { app, server, io };
