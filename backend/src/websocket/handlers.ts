import { Socket } from "socket.io";
import prisma from "../db/prisma";
import { verifyToken, extractToken } from "../utils/auth";

interface DrawingData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  zIndex: number;
  data?: any;
}

export const setupWebSocket = (io: any) => {
  // Middleware to authenticate socket connections
  io.use((socket: Socket, next: any) => {
    const token = extractToken(socket.handshake.auth.token);

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error("Invalid token"));
    }

    socket.data.userId = decoded.userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected: ${socket.id}`);

    // Join project room
    socket.on("project:join", (projectId: string) => {
      socket.join(`project:${projectId}`);
      socket.emit("project:joined", { projectId });

      // Broadcast user joined
      socket.to(`project:${projectId}`).emit("user:joined", {
        userId,
        socketId: socket.id,
      });
    });

    // Handle drawing updates
    socket.on("drawing:update", async (data: DrawingData & { projectId: string }) => {
      const { projectId, ...drawing } = data;

      try {
        // Save to database
        await prisma.drawing.upsert({
          where: { id: drawing.id },
          create: {
            id: drawing.id,
            projectId,
            userId,
            type: drawing.type,
            x: drawing.x,
            y: drawing.y,
            width: drawing.width,
            height: drawing.height,
            rotation: drawing.rotation,
            fill: drawing.fill,
            stroke: drawing.stroke,
            strokeWidth: drawing.strokeWidth,
            opacity: drawing.opacity,
            zIndex: drawing.zIndex,
            data: drawing.data || {},
          },
          update: {
            x: drawing.x,
            y: drawing.y,
            width: drawing.width,
            height: drawing.height,
            rotation: drawing.rotation,
            fill: drawing.fill,
            stroke: drawing.stroke,
            strokeWidth: drawing.strokeWidth,
            opacity: drawing.opacity,
            zIndex: drawing.zIndex,
            data: drawing.data || {},
            updatedAt: new Date(),
          },
        });

        // Broadcast to other users in project
        socket.to(`project:${projectId}`).emit("drawing:updated", drawing);
      } catch (error) {
        console.error("Failed to save drawing:", error);
        socket.emit("error", "Failed to save drawing");
      }
    });

    // Handle drawing deletion
    socket.on("drawing:delete", async (data: { projectId: string; drawingId: string }) => {
      const { projectId, drawingId } = data;

      try {
        await prisma.drawing.delete({ where: { id: drawingId } });
        socket.to(`project:${projectId}`).emit("drawing:deleted", { drawingId });
      } catch (error) {
        console.error("Failed to delete drawing:", error);
      }
    });

    // Cursor tracking
    socket.on("cursor:move", (data: { projectId: string; x: number; y: number }) => {
      const { projectId, ...cursorData } = data;
      socket.to(`project:${projectId}`).emit("cursor:moved", {
        userId,
        socketId: socket.id,
        ...cursorData,
      });
    });

    // Comment handling
    socket.on("comment:add", async (data: { projectId: string; content: string; x?: number; y?: number }) => {
      const { projectId, content, x, y } = data;

      try {
        const comment = await prisma.comment.create({
          data: {
            projectId,
            userId,
            content,
            x: x || null,
            y: y || null,
          },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        });

        io.to(`project:${projectId}`).emit("comment:added", comment);
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    });

    // Version creation
    socket.on("version:create", async (data: { projectId: string; name?: string; snapshot: any }) => {
      const { projectId, name, snapshot } = data;

      try {
        const version = await prisma.version.create({
          data: {
            projectId,
            userId,
            name: name || "Snapshot",
            snapshot,
          },
        });

        io.to(`project:${projectId}`).emit("version:created", version);
      } catch (error) {
        console.error("Failed to create version:", error);
      }
    });

    // Leave project
    socket.on("project:leave", (projectId: string) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit("user:left", { userId });
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected: ${socket.id}`);
    });
  });
};
