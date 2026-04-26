import type { Category, Transaction } from "../types/database";

export function formatMoney(value: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);
}

export function categoryName(categories: Category[], id: string | null) {
  return categories.find((item) => item.id === id)?.name ?? "ไม่ระบุ";
}

export function categoryColor(categories: Category[], id: string | null) {
  return categories.find((item) => item.id === id)?.color ?? "#94a3b8";
}

export function spendingByCategory(transactions: Transaction[], categories: Category[]) {
  const map = new Map<string, { name: string; value: number; color: string }>();
  transactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      const name = categoryName(categories, item.category_id);
      const current = map.get(name) ?? { name, value: 0, color: categoryColor(categories, item.category_id) };
      current.value += Number(item.amount);
      map.set(name, current);
    });
  return [...map.values()].sort((a, b) => b.value - a.value);
}

export function monthlyTrend(transactions: Transaction[]) {
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - index), 1);
    return { key: date.toISOString().slice(0, 7), label: date.toLocaleDateString("th-TH", { month: "short" }), income: 0, expense: 0 };
  });

  transactions.forEach((item) => {
    const row = months.find((month) => item.transaction_date.startsWith(month.key));
    if (row) row[item.type] += Number(item.amount);
  });

  return months;
}
