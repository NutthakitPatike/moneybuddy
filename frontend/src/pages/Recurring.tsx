import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/EmptyState";
import { Field, Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../contexts/AuthContext";
import { getCategories, getRecurring, deleteRecurring, upsertRecurring } from "../services/moneyService";
import type { Category, Frequency, MoneyType, RecurringTransaction } from "../types/database";
import { formatMoney, categoryName } from "../utils/money";
import { useToast } from "../components/ui/Toast";

const frequencyLabels: Record<Frequency, string> = {
  daily: "ทุกวัน",
  weekly: "ทุกสัปดาห์",
  monthly: "ทุกเดือน",
  yearly: "ทุกปี"
};

export function Recurring() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [form, setForm] = useState({ title: "", amount: "", type: "expense" as MoneyType, category_id: "", frequency: "monthly" as Frequency, next_run_date: new Date().toISOString().slice(0, 10), note: "" });

  async function refresh() {
    const [nextItems, nextCategories] = await Promise.all([getRecurring(), getCategories()]);
    setItems(nextItems);
    setCategories(nextCategories);
  }

  useEffect(() => { refresh(); }, []);

  function start(item?: RecurringTransaction) {
    setEditing(item ?? null);
    setForm(item ? { title: item.title, amount: String(item.amount), type: item.type, category_id: item.category_id ?? "", frequency: item.frequency, next_run_date: item.next_run_date, note: item.note ?? "" } : { title: "", amount: "", type: "expense", category_id: "", frequency: "monthly", next_run_date: new Date().toISOString().slice(0, 10), note: "" });
    setOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    await upsertRecurring({ id: editing?.id, ...form, amount: Number(form.amount), category_id: form.category_id || null }, user.id);
    toast("บันทึกรายการประจำแล้ว");
    setOpen(false);
    refresh();
  }

  async function runDue() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recurring/run-due`, { method: "POST", headers: { Authorization: `Bearer ${session?.access_token}` } });
    const result = await response.json();
    if (!response.ok) {
      toast(result.error ?? "สร้างรายการครบกำหนดไม่สำเร็จ", "error");
      return;
    }
    toast(`สร้างรายการครบกำหนด ${result.generated ?? 0} รายการ`);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">รายการประจำ</h1><p className="text-cocoa/65">ตั้งรายรับรายจ่ายที่เกิดซ้ำ และให้ระบบสร้างรายการเมื่อถึงกำหนด</p></div><div className="flex gap-2"><Button variant="secondary" onClick={runDue}>สร้างรายการที่ถึงกำหนด</Button><Button onClick={() => start()}><Plus size={18} /> เพิ่ม</Button></div></div>
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-bold">{item.title}</p><p className="text-sm text-cocoa/60">{categoryName(categories, item.category_id)} · {frequencyLabels[item.frequency]} · ครั้งถัดไป {item.next_run_date}</p></div>
            <div className="flex items-center gap-2"><p className={item.type === "income" ? "font-black text-emerald-600" : "font-black text-rose-600"}>{formatMoney(Number(item.amount))}</p><Button size="icon" variant="secondary" onClick={() => upsertRecurring({ ...item, is_active: !item.is_active }, item.user_id).then(refresh)}>{item.is_active ? <Pause size={16} /> : <Play size={16} />}</Button><Button size="icon" variant="danger" onClick={() => deleteRecurring(item.id).then(refresh)}><Trash2 size={16} /></Button></div>
          </Card>
        ))}
        {items.length === 0 && <EmptyState title="ยังไม่มีรายการประจำ" text="เพิ่มค่าเช่า เงินเดือน ค่าสมาชิก หรือรายการที่เกิดซ้ำ แล้วให้ระบบช่วยสร้างรายการเมื่อถึงกำหนด" />}
      </div>
      <Modal open={open} title="รายการประจำ" onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="ชื่อ"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="จำนวน"><Input required type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field><Field label="วันครบกำหนดถัดไป"><Input type="date" value={form.next_run_date} onChange={(e) => setForm({ ...form, next_run_date: e.target.value })} /></Field></div>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="ประเภท"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MoneyType })}><option value="expense">รายจ่าย</option><option value="income">รายรับ</option></Select></Field><Field label="ความถี่"><Select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}><option value="daily">ทุกวัน</option><option value="weekly">ทุกสัปดาห์</option><option value="monthly">ทุกเดือน</option><option value="yearly">ทุกปี</option></Select></Field><Field label="หมวด"><Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}><option value="">ไม่ระบุ</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field></div>
          <Field label="โน้ต"><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
          <Button>บันทึก</Button>
        </form>
      </Modal>
    </div>
  );
}
