import { Bot, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { getChatHistory } from "../services/moneyService";
import type { ChatMessage } from "../types/database";
import { useToast } from "../components/ui/Toast";

export function AiBuddy() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getChatHistory().then((rows) => setMessages(rows as ChatMessage[])).catch(() => undefined);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), user_id: "", role: "user", message, created_at: new Date().toISOString() };
    setMessages((current) => [...current, userMessage]);
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 429 ? data.error ?? "ถามบ่อยเกินไป ลองพักสักครู่แล้วถามใหม่" : data.error);
      setMessages((current) => [...current, { id: crypto.randomUUID(), user_id: "", role: "assistant", message: data.answer, created_at: new Date().toISOString() }]);
      setMessage("");
    } catch (error) {
      toast(error instanceof Error ? error.message : "AI ยังตอบไม่ได้", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-black">AI Money Buddy</h1><p className="text-cocoa/65">ถามเรื่องงบ รายจ่าย แผนออม และพฤติกรรมการใช้เงินจากข้อมูลจริงของคุณ</p></div>
      <Card className="grid min-h-[65vh] grid-rows-[1fr_auto]">
        <div className="grid content-start gap-3 overflow-auto pr-1">
          {messages.length === 0 && <div className="rounded-2xl bg-mint p-4 text-sm text-emerald-900"><Bot className="mb-2" />ลองถามว่า “เดือนนี้ฉันใช้เงินกับอะไรเยอะที่สุด” หรือ “ช่วยวางแผนออมให้หน่อย”</div>}
          {messages.map((item) => (
            <div key={item.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${item.role === "user" ? "ml-auto bg-rose-400 text-white" : "bg-cream text-cocoa"}`}>
              {item.message}
            </div>
          ))}
          {loading && <div className="w-fit rounded-2xl bg-cream px-4 py-3 text-sm">Money Buddy กำลังคิด...</div>}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={submit}>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="พิมพ์คำถามภาษาไทยได้เลย" />
          <Button disabled={loading || !message.trim()}><Send size={18} /></Button>
        </form>
      </Card>
    </div>
  );
}
