// In-memory mock database for development without PostgreSQL
import { v4 as uuidv4 } from "uuid";

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  thumbnail?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Drawing {
  id: string;
  projectId: string;
  userId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

class MockDatabase {
  users: Map<string, User> = new Map();
  projects: Map<string, Project> = new Map();
  drawings: Map<string, Drawing> = new Map();

  // User operations
  createUser(email: string, name: string, password: string) {
    const id = uuidv4();
    const user: User = {
      id,
      email,
      name,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(email, user);
    return user;
  }

  findUserByEmail(email: string) {
    return this.users.get(email);
  }

  findUserById(id: string) {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  // Project operations
  createProject(name: string, description: string | undefined, workspaceId: string, ownerId: string) {
    const id = uuidv4();
    const project: Project = {
      id,
      name,
      description,
      workspaceId,
      ownerId,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  getProjectsByOwner(ownerId: string) {
    return Array.from(this.projects.values()).filter((p) => p.ownerId === ownerId);
  }

  getProject(projectId: string) {
    return this.projects.get(projectId);
  }

  updateProject(projectId: string, data: Partial<Project>) {
    const project = this.projects.get(projectId);
    if (project) {
      const updated = { ...project, ...data, updatedAt: new Date() };
      this.projects.set(projectId, updated);
      return updated;
    }
    return null;
  }

  deleteProject(projectId: string) {
    return this.projects.delete(projectId);
  }

  // Drawing operations
  createDrawing(projectId: string, userId: string, drawing: Partial<Drawing>) {
    const id = drawing.id || uuidv4();
    const newDrawing: Drawing = {
      id,
      projectId,
      userId,
      type: drawing.type || "rect",
      x: drawing.x || 0,
      y: drawing.y || 0,
      width: drawing.width || 100,
      height: drawing.height || 100,
      rotation: drawing.rotation || 0,
      fill: drawing.fill || "#000000",
      stroke: drawing.stroke || "#000000",
      strokeWidth: drawing.strokeWidth || 1,
      opacity: drawing.opacity || 1,
      zIndex: drawing.zIndex || 0,
      data: drawing.data || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.drawings.set(id, newDrawing);
    return newDrawing;
  }

  getProjectDrawings(projectId: string) {
    return Array.from(this.drawings.values()).filter((d) => d.projectId === projectId);
  }

  deleteDrawing(drawingId: string) {
    return this.drawings.delete(drawingId);
  }
}

export const mockDb = new MockDatabase();
