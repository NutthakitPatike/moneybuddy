import { Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { monthStart, useMoneyData } from "../hooks/useMoneyData";
import { upsertBudget } from "../services/moneyService";
import { categoryName, formatMoney } from "../utils/money";
import { useToast } from "../components/ui/Toast";

export function Budget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [month, setMonth] = useState(monthStart());
  const data = useMoneyData(month);
  const [total, setTotal] = useState("");

  async function saveTotal(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    await upsertBudget({ month, total_budget: Number(total), category_id: null, category_budget: null }, user.id);
    toast("บันทึกงบเดือนนี้แล้ว");
    data.refresh();
  }

  async function saveCategory(categoryId: string, value: string) {
    if (!user || !value) return;
    await upsertBudget({ month, total_budget: 0, category_id: categoryId, category_budget: Number(value) }, user.id);
    toast("บันทึกงบหมวดหมู่แล้ว");
    data.refresh();
  }

  const percent = data.totals.totalBudget ? Math.round((data.totals.expenses / data.totals.totalBudget) * 100) : 0;

  return (
    <div className="grid gap-6">
      <div><h1 className="text-3xl font-black">งบประมาณ</h1><p className="text-cocoa/65">ตั้งงบรวมและงบต่อหมวดสำหรับแต่ละเดือน</p></div>
      <Card>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={saveTotal}>
          <Field label="เดือน"><Input type="date" value={month} onChange={(e) => setMonth(monthStart(new Date(e.target.value)))} /></Field>
          <Field label="งบรวม"><Input type="number" min="0" value={total} placeholder={String(data.totals.totalBudget || "")} onChange={(e) => setTotal(e.target.value)} /></Field>
          <Button><Save size={18} /> บันทึก</Button>
        </form>
      </Card>
      <Card>
        <div className="mb-3 flex justify-between"><h2 className="font-black">ใช้ไป {percent}%</h2><span>{formatMoney(data.totals.expenses)} / {formatMoney(data.totals.totalBudget)}</span></div>
        <div className="h-4 overflow-hidden rounded-full bg-cream"><div className="h-full bg-rose-400" style={{ width: `${Math.min(100, percent)}%` }} /></div>
        <p className="mt-3 text-sm text-cocoa/65">คงเหลือ {formatMoney(data.totals.remainingBudget)}</p>
      </Card>
      <div className="grid gap-3">
        {data.categories.filter((item) => item.type === "expense" || item.type === "both").map((category) => {
          const spent = data.monthTransactions.filter((item) => item.category_id === category.id && item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
          const budget = data.budgets.find((item) => item.category_id === category.id)?.category_budget ?? 0;
          const used = budget ? Math.round((spent / budget) * 100) : 0;
          return (
            <Card key={category.id}>
              <div className="grid gap-3 md:grid-cols-[1fr_160px_auto] md:items-end">
                <div>
                  <p className="font-bold">{categoryName(data.categories, category.id)}</p>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-cream"><div className="h-full" style={{ width: `${Math.min(100, used)}%`, background: category.color }} /></div>
                  <p className="mt-1 text-xs text-cocoa/60">{formatMoney(spent)} / {formatMoney(budget)}</p>
                </div>
                <Input type="number" min="0" id={`budget-${category.id}`} placeholder="งบหมวด" />
                <Button type="button" variant="secondary" onClick={() => saveCategory(category.id, (document.getElementById(`budget-${category.id}`) as HTMLInputElement).value)}>บันทึก</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
