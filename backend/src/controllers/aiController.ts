import type { Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { askDeepSeek } from "../services/deepseek.js";
import { getFinanceSummary } from "../services/financeSummary.js";
import { supabaseAdmin } from "../services/supabase.js";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(2000)
});

export async function chat(req: AuthedRequest, res: Response) {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const summary = await getFinanceSummary(req.user.id);

    await supabaseAdmin.from("ai_chat_history").insert({
      user_id: req.user.id,
      role: "user",
      message: parsed.data.message
    });

    const answer = await askDeepSeek(parsed.data.message, summary);

    await supabaseAdmin.from("ai_chat_history").insert({
      user_id: req.user.id,
      role: "assistant",
      message: answer
    });

    return res.json({ answer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI assistant is unavailable right now" });
  }
}
