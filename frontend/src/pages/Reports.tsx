import { Download } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useMoneyData } from "../hooks/useMoneyData";
import { formatMoney, monthlyTrend, spendingByCategory } from "../utils/money";

export function Reports() {
  const data = useMoneyData();
  const trend = monthlyTrend(data.transactions);
  const top = spendingByCategory(data.monthTransactions, data.categories).slice(0, 6);
  const thisMonth = trend[trend.length - 1];
  const lastMonth = trend[trend.length - 2];

  function exportCsv() {
    const rows = [["วันที่", "ประเภท", "ชื่อรายการ", "จำนวนเงิน", "วิธีชำระเงิน"], ...data.transactions.map((item) => [item.transaction_date, item.type === "income" ? "รายรับ" : "รายจ่าย", item.title, item.amount, item.payment_method ?? ""])];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "money-buddy-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.text("Money Buddy", 16, 18);
    pdf.text(`Total income: ${data.totals.income}`, 16, 32);
    pdf.text(`Total expenses: ${data.totals.expenses}`, 16, 42);
    pdf.text(`Savings rate: ${data.totals.savingsRate}%`, 16, 52);
    pdf.save("money-buddy-report.pdf");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">รายงาน</h1><p className="text-cocoa/65">สรุปรายเดือน รายปี และแนวโน้มจากข้อมูลจริง</p></div><div className="flex gap-2"><Button variant="secondary" onClick={exportCsv}><Download size={18} /> CSV</Button><Button onClick={exportPdf}><Download size={18} /> PDF</Button></div></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-cocoa/60">เดือนนี้</p><p className="text-2xl font-black">{formatMoney((thisMonth?.income ?? 0) - (thisMonth?.expense ?? 0))}</p></Card>
        <Card><p className="text-sm text-cocoa/60">เดือนก่อน</p><p className="text-2xl font-black">{formatMoney((lastMonth?.income ?? 0) - (lastMonth?.expense ?? 0))}</p></Card>
        <Card><p className="text-sm text-cocoa/60">อัตราการออม</p><p className="text-2xl font-black">{data.totals.savingsRate}%</p></Card>
        <Card><p className="text-sm text-cocoa/60">หมวดจ่ายสูงสุด</p><p className="text-2xl font-black">{top[0]?.name ?? "-"}</p></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><h2 className="mb-4 font-black">แนวโน้มรายจ่าย</h2><div className="h-72"><ResponsiveContainer><AreaChart data={trend}><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(v) => formatMoney(Number(v))} /><Area dataKey="expense" stroke="#fb7185" fill="#ffe4e6" /></AreaChart></ResponsiveContainer></div></Card>
        <Card><h2 className="mb-4 font-black">แนวโน้มรายรับ</h2><div className="h-72"><ResponsiveContainer><AreaChart data={trend}><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(v) => formatMoney(Number(v))} /><Area dataKey="income" stroke="#2dd4bf" fill="#d1fae5" /></AreaChart></ResponsiveContainer></div></Card>
      </div>
      <Card><h2 className="mb-4 font-black">หมวดที่ใช้เงินมากที่สุด</h2><div className="h-72"><ResponsiveContainer><BarChart data={top}><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => formatMoney(Number(v))} /><Bar dataKey="value" fill="#fb7185" radius={[12, 12, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
    </div>
  );
}
