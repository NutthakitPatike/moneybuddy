import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, Input, Select } from "../components/ui/Input";
import { TransactionModal } from "../components/TransactionModal";
import { deleteTransaction } from "../services/moneyService";
import type { Transaction } from "../types/database";
import { useMoneyData } from "../hooks/useMoneyData";
import { categoryName, formatMoney } from "../utils/money";
import { useToast } from "../components/ui/Toast";

export function Transactions() {
  const data = useMoneyData();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("newest");

  const rows = useMemo(() => {
    return data.transactions
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      .filter((item) => !type || item.type === type)
      .filter((item) => !category || item.category_id === category)
      .filter((item) => !payment || (item.payment_method ?? "").toLowerCase().includes(payment.toLowerCase()))
      .filter((item) => !from || item.transaction_date >= from)
      .filter((item) => !to || item.transaction_date <= to)
      .filter((item) => !min || Number(item.amount) >= Number(min))
      .filter((item) => !max || Number(item.amount) <= Number(max))
      .sort((a, b) => {
        if (sort === "amount") return Number(b.amount) - Number(a.amount);
        if (sort === "oldest") return a.transaction_date.localeCompare(b.transaction_date);
        return b.transaction_date.localeCompare(a.transaction_date);
      });
  }, [category, data.transactions, from, max, min, payment, query, sort, to, type]);

  async function remove(item: Transaction) {
    if (!window.confirm(`ลบรายการ "${item.title}" ใช่ไหม?`)) return;
    try {
      await deleteTransaction(item.id);
      toast("ลบรายการแล้ว");
      data.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "ลบไม่สำเร็จ", "error");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">รายการเงินเข้าออก</h1>
          <p className="text-cocoa/65">ค้นหา กรอง แก้ไข และอัปโหลดใบเสร็จได้จากที่นี่</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus size={18} /> เพิ่มรายการ</Button>
      </div>

      <Card className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="ค้นหา"><div className="relative"><Search className="absolute left-3 top-3 text-cocoa/40" size={16} /><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} /></div></Field>
          <Field label="ประเภท"><Select value={type} onChange={(e) => setType(e.target.value)}><option value="">ทั้งหมด</option><option value="income">รายรับ</option><option value="expense">รายจ่าย</option></Select></Field>
          <Field label="หมวดหมู่"><Select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">ทั้งหมด</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
          <Field label="เรียง"><Select value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">ใหม่สุด</option><option value="oldest">เก่าสุด</option><option value="amount">จำนวนเงิน</option></Select></Field>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="จากวันที่"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="ถึงวันที่"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Field label="ขั้นต่ำ"><Input type="number" value={min} onChange={(e) => setMin(e.target.value)} /></Field>
          <Field label="สูงสุด"><Input type="number" value={max} onChange={(e) => setMax(e.target.value)} /></Field>
          <Field label="วิธีจ่าย"><Input value={payment} onChange={(e) => setPayment(e.target.value)} /></Field>
        </div>
      </Card>

      <div className="grid gap-3">
        {rows.map((item) => (
          <Card key={item.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-cocoa/60">{categoryName(data.categories, item.category_id)} · {item.transaction_date} · {item.payment_method ?? "ไม่ระบุวิธีจ่าย"}</p>
              {item.receipt_url && <a className="text-xs font-bold text-rose-600" href={item.receipt_url} target="_blank" rel="noreferrer">ดูใบเสร็จ</a>}
            </div>
            <div className="flex items-center gap-2">
              <p className={item.type === "income" ? "min-w-32 text-right font-black text-emerald-600" : "min-w-32 text-right font-black text-rose-600"}>{item.type === "income" ? "+" : "-"}{formatMoney(Number(item.amount))}</p>
              <Button variant="secondary" size="icon" onClick={() => setEditing(item)} aria-label="Edit"><Edit3 size={16} /></Button>
              <Button variant="danger" size="icon" onClick={() => remove(item)} aria-label="Delete"><Trash2 size={16} /></Button>
            </div>
          </Card>
        ))}
      </div>
      <TransactionModal open={adding || !!editing} transaction={editing} categories={data.categories} onClose={() => { setAdding(false); setEditing(null); }} onSaved={data.refresh} />
    </div>
  );
}
