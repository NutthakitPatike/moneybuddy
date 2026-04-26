import type { NextFunction, Request, Response } from "express";
import { supabaseAnon } from "../services/supabase.js";

export type AuthedRequest = Request & {
  user: {
    id: string;
    email?: string;
    token: string;
  };
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const { data, error } = await supabaseAnon.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  (req as AuthedRequest).user = {
    id: data.user.id,
    email: data.user.email ?? undefined,
    token
  };

  next();
}
