import { Bot, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/ui/Button";
import { Card, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { TransactionModal } from "../components/TransactionModal";
import { useMoneyData } from "../hooks/useMoneyData";
import { useState } from "react";
import type { MoneyType } from "../types/database";
import { formatMoney, monthlyTrend, spendingByCategory, categoryName } from "../utils/money";

export function Dashboard() {
  const data = useMoneyData();
  const [modal, setModal] = useState<MoneyType | null>(null);
  if (data.loading) return <Loading />;

  const pie = spendingByCategory(data.monthTransactions, data.categories);
  const trend = monthlyTrend(data.transactions);
  const budgetUsed = data.totals.totalBudget ? Math.min(100, Math.round((data.totals.expenses / data.totals.totalBudget) * 100)) : 0;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">สวัสดี วันนี้เงินเป็นยังไงบ้าง</h1>
          <p className="text-cocoa/65">แดชบอร์ดนี้ใช้ข้อมูลจริงจาก Supabase ของคุณ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModal("income")}><Plus size={18} /> รายรับ</Button>
          <Button variant="secondary" onClick={() => setModal("expense")}><Plus size={18} /> รายจ่าย</Button>
          <Link to="/ai"><Button variant="secondary"><Bot size={18} /> ถาม AI</Button></Link>
        </div>
      </div>

      {data.monthTransactions.length === 0 && <EmptyState title="ยังไม่มีรายการเดือนนี้" text="เพิ่มรายรับหรือรายจ่ายแรก แล้ว Money Buddy จะเริ่มคำนวณภาพรวมให้ทันที" />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "รายรับเดือนนี้", value: data.totals.income, icon: TrendingUp, tone: "bg-mint text-emerald-700" },
          { label: "รายจ่ายเดือนนี้", value: data.totals.expenses, icon: TrendingDown, tone: "bg-blush text-rose-700" },
          { label: "คงเหลือ", value: data.totals.balance, icon: Wallet, tone: "bg-skysoft text-sky-700" },
          { label: "งบคงเหลือ", value: data.totals.remainingBudget, icon: Wallet, tone: "bg-amber-100 text-amber-700" },
          { label: "อัตราการออม", value: data.totals.savingsRate, percent: true, icon: TrendingUp, tone: "bg-violet-100 text-violet-700" }
        ].map((item) => (
          <Card key={item.label}>
            <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${item.tone}`}><item.icon size={20} /></div>
            <p className="text-sm text-cocoa/60">{item.label}</p>
            <p className="text-2xl font-black">{item.percent ? `${item.value}%` : formatMoney(item.value)}</p>
          </Card>
        ))}
      </div>

      {data.totals.totalBudget > 0 && budgetUsed >= 80 && (
        <Card className="border border-amber-200 bg-amber-50">
          <CardTitle>ใกล้เต็มงบแล้วนะ</CardTitle>
          <p className="text-sm text-cocoa/70">ใช้ไป {budgetUsed}% ของงบเดือนนี้ ลองเช็กหมวดที่ใช้เยอะเป็นพิเศษได้เลย</p>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardTitle>ใช้จ่ายตามหมวด</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" outerRadius={95}>
                  {pie.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardTitle>รายรับเทียบรายจ่าย</CardTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Line type="monotone" dataKey="income" stroke="#2dd4bf" strokeWidth={3} />
                <Line type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>รายการล่าสุด</CardTitle>
        <div className="mt-4 grid gap-3">
          {data.transactions.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-cream p-3">
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="text-xs text-cocoa/60">{categoryName(data.categories, item.category_id)} · {item.transaction_date}</p>
              </div>
              <p className={item.type === "income" ? "font-black text-emerald-600" : "font-black text-rose-600"}>
                {item.type === "income" ? "+" : "-"}{formatMoney(Number(item.amount))}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <TransactionModal open={!!modal} defaultType={modal ?? "expense"} categories={data.categories} onClose={() => setModal(null)} onSaved={data.refresh} />
    </div>
  );
}
