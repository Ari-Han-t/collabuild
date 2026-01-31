import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { mockDb } from "../db/mock";

export const projectController = {
  async listProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const projects = mockDb.getProjectsByOwner(userId).map((p) => ({
        ...p,
        owner: mockDb.findUserById(p.ownerId),
      }));

      res.json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  },

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { name, description, workspaceId, isPublic } = req.body;

      if (!name) {
        res.status(400).json({ error: "Project name is required" });
        return;
      }

      const workspace = workspaceId || uuidv4();

      const project = mockDb.createProject(name, description, workspace, userId, isPublic);

      const owner = mockDb.findUserById(userId);
      res.status(201).json({
        ...project,
        owner: { id: owner?.id, name: owner?.name },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create project" });
    }
  },

  async getProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const project = mockDb.getProject(projectId);

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      if (project.ownerId !== userId && !project.isPublic) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const drawings = mockDb.getProjectDrawings(projectId);
      const owner = mockDb.findUserById(project.ownerId);

      res.json({
        ...project,
        owner,
        drawings,
        collaborators: [],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  },

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId;
      const { name, description, isPublic, thumbnail } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const project = mockDb.getProject(projectId);

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      if (project.ownerId !== userId) {
        res.status(403).json({ error: "Only project owner can update" });
        return;
      }

      const updated = mockDb.updateProject(projectId, {
        name,
        description,
        isPublic,
        thumbnail,
      });

      const owner = mockDb.findUserById(updated?.ownerId || "");
      res.json({
        ...updated,
        owner: { id: owner?.id, name: owner?.name },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update project" });
    }
  },

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const project = mockDb.getProject(projectId);

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      if (project.ownerId !== userId) {
        res.status(403).json({ error: "Only project owner can delete" });
        return;
      }

      mockDb.deleteProject(projectId);

      res.json({ message: "Project deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  },
};
