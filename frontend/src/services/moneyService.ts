import { supabase } from "../lib/supabase";
import type { Budget, Category, RecurringTransaction, Transaction, UserSettings } from "../types/database";

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("type").order("name");
  if (error) throw error;
  return data as Category[];
}

export async function upsertCategory(input: Partial<Category> & Pick<Category, "name" | "type" | "icon" | "color">, userId: string) {
  const payload = { ...input, user_id: userId };
  const { error } = await supabase.from("categories").upsert(payload);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { count, error: countError } = await supabase.from("transactions").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (countError) throw countError;
  if ((count ?? 0) > 0) throw new Error("Cannot delete a category currently used by transactions.");
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function getTransactions() {
  const { data, error } = await supabase.from("transactions").select("*").order("transaction_date", { ascending: false });
  if (error) throw error;
  return data as Transaction[];
}

export async function upsertTransaction(input: Partial<Transaction> & Pick<Transaction, "type" | "title" | "amount" | "transaction_date">, userId: string) {
  const { error } = await supabase.from("transactions").upsert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadReceipt(userId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? path;
}

export async function getBudgets(month: string) {
  const { data, error } = await supabase.from("budgets").select("*").eq("month", month);
  if (error) throw error;
  return data as Budget[];
}

export async function upsertBudget(input: Partial<Budget> & Pick<Budget, "month" | "total_budget">, userId: string) {
  const base = supabase.from("budgets").select("id").eq("user_id", userId).eq("month", input.month).limit(1);
  const existing = input.category_id ? await base.eq("category_id", input.category_id).maybeSingle() : await base.is("category_id", null).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.id) {
    const { error } = await supabase.from("budgets").update(input).eq("id", existing.data.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("budgets").insert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function getRecurring() {
  const { data, error } = await supabase.from("recurring_transactions").select("*").order("next_run_date");
  if (error) throw error;
  return data as RecurringTransaction[];
}

export async function upsertRecurring(input: Partial<RecurringTransaction> & Pick<RecurringTransaction, "title" | "amount" | "type" | "frequency" | "next_run_date">, userId: string) {
  const { error } = await supabase.from("recurring_transactions").upsert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function deleteRecurring(id: string) {
  const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function getSettings() {
  const { data, error } = await supabase.from("user_settings").select("*").single();
  if (error) throw error;
  return data as UserSettings;
}

export async function updateSettings(input: Partial<UserSettings>) {
  const { error } = await supabase.from("user_settings").update(input).eq("id", input.id);
  if (error) throw error;
}

export async function getChatHistory() {
  const { data, error } = await supabase.from("ai_chat_history").select("*").order("created_at");
  if (error) throw error;
  return data;
}
