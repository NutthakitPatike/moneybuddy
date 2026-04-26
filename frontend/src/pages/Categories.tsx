import { Edit3, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useMoneyData } from "../hooks/useMoneyData";
import { deleteCategory, upsertCategory } from "../services/moneyService";
import type { Category, CategoryType } from "../types/database";
import { useToast } from "../components/ui/Toast";

export function Categories() {
  const data = useMoneyData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [icon, setIcon] = useState("Sparkles");
  const [color, setColor] = useState("#fb7185");

  function start(category?: Category) {
    setEditing(category ?? null);
    setName(category?.name ?? "");
    setType(category?.type ?? "expense");
    setIcon(category?.icon ?? "Sparkles");
    setColor(category?.color ?? "#fb7185");
    setOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    await upsertCategory({ id: editing?.id, name, type, icon, color }, user.id);
    toast("บันทึกหมวดหมู่แล้ว");
    setOpen(false);
    data.refresh();
  }

  async function remove(category: Category) {
    if (!window.confirm(`ลบหมวด "${category.name}" ใช่ไหม?`)) return;
    try {
      await deleteCategory(category.id);
      toast("ลบหมวดหมู่แล้ว");
      data.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "ลบไม่ได้", "error");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-black">หมวดหมู่</h1><p className="text-cocoa/65">จัดระเบียบรายรับรายจ่ายของคุณ</p></div>
        <Button onClick={() => start()}><Plus size={18} /> เพิ่มหมวด</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(["expense", "income"] as const).map((section) => (
          <Card key={section}>
            <h2 className="mb-4 text-xl font-black">{section === "expense" ? "รายจ่าย" : "รายรับ"}</h2>
            <div className="grid gap-3">
              {data.categories.filter((item) => item.type === section || item.type === "both").map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-cream p-3">
                  <div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ background: item.color }} /><div><p className="font-bold">{item.name}</p><p className="text-xs text-cocoa/55">{item.is_default ? "หมวดเริ่มต้น" : "หมวดที่สร้างเอง"} · {item.icon}</p></div></div>
                  <div className="flex gap-2"><Button size="icon" variant="secondary" onClick={() => start(item)}><Edit3 size={16} /></Button><Button size="icon" variant="danger" onClick={() => remove(item)}><Trash2 size={16} /></Button></div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={open} title={editing ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={submit}>
          <Field label="ชื่อ"><Input required value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="ประเภท"><Select value={type} onChange={(e) => setType(e.target.value as CategoryType)}><option value="expense">รายจ่าย</option><option value="income">รายรับ</option><option value="both">ทั้งคู่</option></Select></Field>
          <Field label="ไอคอน lucide"><Input value={icon} onChange={(e) => setIcon(e.target.value)} /></Field>
          <Field label="สี"><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></Field>
          <Button>บันทึก</Button>
        </form>
      </Modal>
    </div>
  );
}
