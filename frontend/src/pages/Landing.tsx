import { ArrowRight, Bot, LineChart, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

export function Landing() {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="min-h-screen bg-cream soft-grid text-cocoa">
      <header className="mx-auto flex max-w-7xl items-center justify-between p-5">
        <div className="text-2xl font-black">Money Buddy</div>
        <Link to="/login">
          <Button variant="secondary">เข้าสู่ระบบ</Button>
        </Link>
      </header>
      <main className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">
          <p className="w-fit rounded-full bg-mint px-4 py-2 text-sm font-bold text-emerald-800">Cute finance planner with real Supabase data</p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">Money Buddy</h1>
          <p className="max-w-2xl text-lg text-cocoa/72">บันทึกรายรับรายจ่าย วางงบ ดูรายงาน และคุยกับ AI ผู้ช่วยการเงินภาษาไทยที่วิเคราะห์ข้อมูลจริงของคุณอย่างปลอดภัย</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={signInWithGoogle}>
              เริ่มด้วย Google <ArrowRight size={18} />
            </Button>
            <Link to="/register">
              <Button variant="secondary">สมัครด้วยอีเมล</Button>
            </Link>
          </div>
        </motion.section>
        <section className="grid gap-4">
          <Card className="bg-white">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-cocoa/60">ยอดคงเหลือเดือนนี้</p>
                <p className="text-4xl font-black">฿42,800</p>
              </div>
              <div className="rounded-2xl bg-blush p-3 text-rose-600">
                <WalletCards />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {["อาหาร", "เดินทาง", "ออม"].map((item, index) => (
                <div key={item} className={["rounded-2xl p-4", "bg-mint", "bg-skysoft", "bg-blush"][index]}>
                  <p className="font-bold">{item}</p>
                  <p className="text-cocoa/70">{[62, 35, 78][index]}%</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "RLS ปลอดภัย" },
              { icon: LineChart, title: "รายงานจริง" },
              { icon: Bot, title: "DeepSeek AI" }
            ].map((item) => (
              <Card key={item.title} className="grid gap-3">
                <item.icon className="text-rose-500" />
                <p className="font-bold">{item.title}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
