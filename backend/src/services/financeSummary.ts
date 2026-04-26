import { supabaseAdmin } from "./supabase.js";

export async function getFinanceSummary(userId: string) {
  const start = new Date();
  start.setDate(1);
  const monthStart = start.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [transactions, budgets, categories] = await Promise.all([
    supabaseAdmin
      .from("transactions")
      .select("type,title,amount,transaction_date,note,payment_method,category_id")
      .eq("user_id", userId)
      .gte("transaction_date", monthStart)
      .lte("transaction_date", today)
      .order("transaction_date", { ascending: false })
      .limit(250),
    supabaseAdmin.from("budgets").select("month,total_budget,category_budget,category_id").eq("user_id", userId).eq("month", monthStart),
    supabaseAdmin.from("categories").select("id,name,type").eq("user_id", userId)
  ]);

  if (transactions.error) throw transactions.error;
  if (budgets.error) throw budgets.error;
  if (categories.error) throw categories.error;

  const categoryName = new Map(categories.data.map((category) => [category.id, category.name]));
  const rows = transactions.data.map((transaction) => ({
    ...transaction,
    category: transaction.category_id ? categoryName.get(transaction.category_id) ?? "Uncategorized" : "Uncategorized",
    amount: Number(transaction.amount)
  }));

  const totalIncome = rows.filter((row) => row.type === "income").reduce((sum, row) => sum + row.amount, 0);
  const totalExpense = rows.filter((row) => row.type === "expense").reduce((sum, row) => sum + row.amount, 0);
  const byCategory = rows
    .filter((row) => row.type === "expense")
    .reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + row.amount;
      return acc;
    }, {});

  return {
    monthStart,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
    budgets: budgets.data,
    spendingByCategory: byCategory,
    recentTransactions: rows.slice(0, 30)
  };
}
