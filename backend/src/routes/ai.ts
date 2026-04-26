import { Router } from "express";
import { chat } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";
import { perUserRateLimit } from "../middleware/rateLimit.js";

export const aiRouter = Router();
aiRouter.post(
  "/chat",
  requireAuth,
  perUserRateLimit({
    windowMs: 10 * 60 * 1000,
    max: 12,
    message: "ถาม AI ได้ชั่วคราว 12 ครั้งต่อ 10 นาที ลองพักสักครู่แล้วค่อยถามใหม่นะ"
  }) as never,
  chat as never
);
