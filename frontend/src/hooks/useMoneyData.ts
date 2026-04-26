import { useCallback, useEffect, useMemo, useState } from "react";
import { getBudgets, getCategories, getTransactions } from "../services/moneyService";
import type { Budget, Category, Transaction } from "../types/database";

export function monthStart(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), 1).toISOString().slice(0, 10);
}

export function useMoneyData(month = monthStart()) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextTransactions, nextCategories, nextBudgets] = await Promise.all([getTransactions(), getCategories(), getBudgets(month)]);
      setTransactions(nextTransactions);
      setCategories(nextCategories);
      setBudgets(nextBudgets);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const monthTransactions = useMemo(() => transactions.filter((item) => item.transaction_date >= month && item.transaction_date < monthStart(new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 1))), [month, transactions]);
  const income = monthTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = monthTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
  const totalBudget = budgets.find((item) => !item.category_id)?.total_budget ?? 0;

  return {
    transactions,
    monthTransactions,
    categories,
    budgets,
    loading,
    refresh,
    totals: {
      income,
      expenses,
      balance: income - expenses,
      totalBudget,
      remainingBudget: totalBudget - expenses,
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
    }
  };
}
