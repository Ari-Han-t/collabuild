import { Request, Response } from "express";
import prisma from "../db/prisma";
import { v4 as uuidv4 } from "uuid";

export const projectController = {
  async listProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { collaborators: { some: { userId } } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          thumbnail: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      });

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

      const { name, description, workspaceId } = req.body;

      if (!name) {
        res.status(400).json({ error: "Project name is required" });
        return;
      }

      // Get or create default workspace
      let workspace;
      if (workspaceId) {
        workspace = await prisma.workspace.findUnique({
          where: { id: workspaceId },
        });
      } else {
        workspace = await prisma.workspace.findFirst({
          where: {
            members: { some: { userId } },
          },
        });

        if (!workspace) {
          workspace = await prisma.workspace.create({
            data: {
              name: `${name}'s Workspace`,
              slug: `workspace-${uuidv4().slice(0, 8)}`,
              members: {
                create: { userId, role: "admin" },
              },
            },
          });
        }
      }

      if (!workspace) {
        res.status(404).json({ error: "Workspace not found" });
        return;
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          workspaceId: workspace.id,
          ownerId: userId,
        },
        include: {
          owner: { select: { id: true, name: true } },
        },
      });

      res.status(201).json(project);
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

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          collaborators: {
            select: { userId: true, role: true },
          },
          drawings: {
            orderBy: { zIndex: "asc" },
          },
        },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      // Check access
      const hasAccess =
        project.ownerId === userId ||
        project.collaborators.some((c) => c.userId === userId) ||
        project.isPublic;

      if (!hasAccess) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      res.json(project);
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

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      if (project.ownerId !== userId) {
        res.status(403).json({ error: "Only project owner can update" });
        return;
      }

      const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
          name,
          description,
          isPublic,
          thumbnail,
        },
        include: {
          owner: { select: { id: true, name: true } },
        },
      });

      res.json(updated);
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

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      if (project.ownerId !== userId) {
        res.status(403).json({ error: "Only project owner can delete" });
        return;
      }

      await prisma.project.delete({ where: { id: projectId } });

      res.json({ message: "Project deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  },
};
