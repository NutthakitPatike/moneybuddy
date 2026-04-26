import { Router } from "express";
import { runMine } from "../controllers/recurringController.js";
import { requireAuth } from "../middleware/auth.js";

export const recurringRouter = Router();
recurringRouter.post("/run-due", requireAuth, runMine as never);
