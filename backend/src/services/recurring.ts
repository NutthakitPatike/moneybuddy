import { supabaseAdmin } from "./supabase.js";

function nextDate(date: string, frequency: string) {
  const next = new Date(`${date}T00:00:00.000Z`);
  if (frequency === "daily") next.setUTCDate(next.getUTCDate() + 1);
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === "monthly") next.setUTCMonth(next.getUTCMonth() + 1);
  if (frequency === "yearly") next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next.toISOString().slice(0, 10);
}

export async function generateDueRecurring(userId?: string) {
  const today = new Date().toISOString().slice(0, 10);
  let query = supabaseAdmin
    .from("recurring_transactions")
    .select("*")
    .eq("is_active", true)
    .lte("next_run_date", today)
    .limit(500);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw error;

  for (const item of data ?? []) {
    const { error: insertError } = await supabaseAdmin.from("transactions").insert({
      user_id: item.user_id,
      type: item.type,
      title: item.title,
      amount: item.amount,
      category_id: item.category_id,
      transaction_date: item.next_run_date,
      note: item.note
    });
    if (insertError) throw insertError;

    const { error: updateError } = await supabaseAdmin
      .from("recurring_transactions")
      .update({ next_run_date: nextDate(item.next_run_date, item.frequency) })
      .eq("id", item.id);
    if (updateError) throw updateError;
  }

  return { generated: data?.length ?? 0 };
}
