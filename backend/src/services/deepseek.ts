import { env } from "../utils/env.js";

const systemPrompt =
  "You are Money Buddy, a friendly Thai personal finance assistant. Analyze the user's real income, expenses, budgets, and categories. Give practical, concise advice in Thai. Do not provide risky investment advice. Focus on budgeting, saving, and spending awareness.";

export async function askDeepSeek(message: string, financeContext: unknown) {
  const response = await fetch(`${env.DEEPSEEK_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.45,
      max_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `ข้อมูลการเงินจริงของผู้ใช้ในรูปแบบ JSON:\n${JSON.stringify(financeContext)}\n\nคำถามของผู้ใช้:\n${message}`
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek request failed: ${text}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "ขอโทษนะคะ ตอนนี้ Money Buddy ยังตอบไม่ได้ ลองใหม่อีกครั้งได้เลย";
}
