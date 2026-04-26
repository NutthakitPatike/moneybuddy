import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth.js";
import { generateDueRecurring } from "../services/recurring.js";

export async function runMine(req: AuthedRequest, res: Response) {
  try {
    const result = await generateDueRecurring(req.user.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not process recurring transactions" });
  }
}
