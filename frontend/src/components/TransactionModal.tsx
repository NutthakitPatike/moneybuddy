import { FormEvent, useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import { Button } from "./ui/Button";
import { Field, Input, Select, Textarea } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { uploadReceipt, upsertTransaction } from "../services/moneyService";
import type { Category, MoneyType, Transaction } from "../types/database";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./ui/Toast";

export function TransactionModal({
  open,
  transaction,
  defaultType = "expense",
  categories,
  onClose,
  onSaved
}: {
  open: boolean;
  transaction?: Transaction | null;
  defaultType?: MoneyType;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState<MoneyType>(defaultType);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setType(transaction?.type ?? defaultType);
    setTitle(transaction?.title ?? "");
    setAmount(transaction?.amount ? String(transaction.amount) : "");
    setCategoryId(transaction?.category_id ?? "");
    setDate(transaction?.transaction_date ?? new Date().toISOString().slice(0, 10));
    setNote(transaction?.note ?? "");
    setPaymentMethod(transaction?.payment_method ?? "");
    setFile(null);
  }, [defaultType, open, transaction]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    try {
      const receiptUrl = file ? await uploadReceipt(user.id, file) : transaction?.receipt_url ?? null;
      await upsertTransaction(
        {
          id: transaction?.id,
          type,
          title,
          amount: Number(amount),
          category_id: categoryId || null,
          transaction_date: date,
          note: note || null,
          payment_method: paymentMethod || null,
          receipt_url: receiptUrl
        },
        user.id
      );
      toast("บันทึกรายการแล้ว");
      onSaved();
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ", "error");
    }
  }

  const filteredCategories = categories.filter((item) => item.type === type || item.type === "both");

  return (
    <Modal open={open} title={transaction ? "แก้ไขรายการ" : type === "income" ? "เพิ่มรายรับ" : "เพิ่มรายจ่าย"} onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant={type === "income" ? "primary" : "secondary"} onClick={() => setType("income")}>รายรับ</Button>
          <Button type="button" variant={type === "expense" ? "primary" : "secondary"} onClick={() => setType("expense")}>รายจ่าย</Button>
        </div>
        <Field label="ชื่อรายการ"><Input required value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="จำนวนเงิน"><Input required min="0" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field>
          <Field label="วันที่"><Input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="หมวดหมู่">
            <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">ไม่ระบุ</option>
              {filteredCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
          </Field>
          <Field label="วิธีชำระเงิน"><Input value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} placeholder="เงินสด / โอน / บัตร" /></Field>
        </div>
        <Field label="โน้ต"><Textarea value={note} onChange={(event) => setNote(event.target.value)} /></Field>
        <Field label="ใบเสร็จ">
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white p-4">
            <Upload size={18} />
            <Input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>
        </Field>
        {transaction?.receipt_url && <a className="text-sm font-bold text-rose-600" href={transaction.receipt_url} target="_blank" rel="noreferrer">ดูใบเสร็จเดิม</a>}
        <Button><Save size={18} /> บันทึก</Button>
      </form>
    </Modal>
  );
}
