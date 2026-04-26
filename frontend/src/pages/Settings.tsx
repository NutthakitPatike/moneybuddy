import { Download, Save, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, Input, Select } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { getSettings, getTransactions, updateSettings } from "../services/moneyService";
import type { UserSettings } from "../types/database";
import { useToast } from "../components/ui/Toast";

export function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => { getSettings().then(setSettings).catch(() => undefined); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    await updateSettings(settings);
    toast("บันทึกการตั้งค่าแล้ว");
  }

  async function exportAll() {
    const rows = await getTransactions();
    const blob = new Blob([JSON.stringify({ user: user?.email, transactions: rows }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "money-buddy-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-black">โปรไฟล์และตั้งค่า</h1><p className="text-cocoa/65">จัดการบัญชี สกุลเงิน ภาษา และข้อมูลส่วนตัว</p></div>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <div className="flex items-center gap-4">
            {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url as string} className="h-16 w-16 rounded-full" alt="" /> : <div className="h-16 w-16 rounded-full bg-blush" />}
            <div className="min-w-0"><p className="truncate text-xl font-black">{user?.user_metadata?.full_name ?? user?.email}</p><p className="truncate text-sm text-cocoa/60">{user?.email}</p><p className="text-xs text-cocoa/50">วิธีเข้าสู่ระบบ: {user?.app_metadata?.provider === "email" ? "อีเมลและรหัสผ่าน" : user?.app_metadata?.provider ?? "อีเมล"}</p></div>
          </div>
        </Card>
        <Card>
          {settings && (
            <form className="grid gap-4" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="สกุลเงิน"><Input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })} /></Field>
                <Field label="ภาษา"><Select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}><option value="th">ไทย</option><option value="en">อังกฤษ</option></Select></Field>
                <Field label="ธีม"><Select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}><option value="light">สว่าง</option><option value="dark">มืด</option></Select></Field>
              </div>
              <Button><Save size={18} /> บันทึก</Button>
            </form>
          )}
        </Card>
      </div>
      <Card className="grid gap-3">
        <h2 className="font-black">ส่งออกข้อมูล</h2>
        <p className="text-sm text-cocoa/65">ดาวน์โหลดข้อมูลรายการทั้งหมดของผู้ใช้ปัจจุบันเป็น JSON</p>
        <Button className="w-fit" variant="secondary" onClick={exportAll}><Download size={18} /> ส่งออกข้อมูลทั้งหมด</Button>
      </Card>
      <Card className="border border-red-200 bg-red-50">
        <div className="flex gap-3"><ShieldAlert className="text-red-600" /><div><h2 className="font-black text-red-700">คำเตือนก่อนลบบัญชี</h2><p className="text-sm text-red-700/80">การลบบัญชีควรทำผ่าน endpoint ฝั่ง backend ที่ยืนยันตัวตนซ้ำก่อนลบจริง เพื่อป้องกันการลบโดยไม่ตั้งใจ</p></div></div>
      </Card>
    </div>
  );
}
