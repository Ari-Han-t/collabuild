import { Request, Response } from "express";
import { generateToken, hashPassword, comparePassword } from "../utils/auth";
import { mockDb } from "../db/mock";

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const existingUser = mockDb.findUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "User already exists" });
        return;
      }

      const hashedPassword = await hashPassword(password);

      const user = mockDb.createUser(email, name, hashedPassword);

      const token = generateToken(user.id);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Missing email or password" });
        return;
      }

      const user = mockDb.findUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = generateToken(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  },

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = mockDb.findUserById(userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  },
};
