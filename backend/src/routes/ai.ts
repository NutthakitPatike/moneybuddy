import { Router } from "express";
import { chat } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();
aiRouter.post("/chat", requireAuth, chat as never);
