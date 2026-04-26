import cors from "cors";
import express from "express";
import helmet from "helmet";
import { aiRouter } from "./routes/ai.js";
import { recurringRouter } from "./routes/recurring.js";
import { env } from "./utils/env.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, name: "Money Buddy API" }));
app.use("/api/ai", aiRouter);
app.use("/api/recurring", recurringRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
