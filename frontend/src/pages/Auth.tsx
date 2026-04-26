import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers3 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/Toast";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(email, password);
      toast(mode === "login" ? "ยินดีต้อนรับกลับมา" : "สมัครสำเร็จ เช็กอีเมลยืนยันถ้าระบบเปิดใช้งานไว้");
      navigate("/dashboard");
    } catch (error) {
      toast(error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream p-4 soft-grid">
      <Card className="w-full max-w-md">
        <div className="mb-6 grid place-items-center gap-3 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-mint text-emerald-700">
            <Layers3 />
          </div>
          <div>
            <h1 className="text-2xl font-black">{mode === "login" ? "เข้าสู่ Money Buddy" : "สมัคร Money Buddy"}</h1>
            <p className="text-sm text-cocoa/65">เก็บข้อมูลจริง ปลอดภัย และกลับมาใช้งานต่อได้เสมอ</p>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="อีเมล">
            <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="รหัสผ่าน">
            <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
          </Field>
          <Button disabled={loading}>{mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-cocoa/70">
          {mode === "login" ? "ยังไม่มีบัญชี?" : "มีบัญชีแล้ว?"}{" "}
          <Link className="font-bold text-rose-600" to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "สมัครเลย" : "เข้าสู่ระบบ"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
