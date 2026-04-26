export type MoneyType = "income" | "expense";
export type CategoryType = MoneyType | "both";
export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export type Profile = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: MoneyType;
  title: string;
  amount: number;
  category_id: string | null;
  transaction_date: string;
  note: string | null;
  receipt_url: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  month: string;
  total_budget: number;
  category_id: string | null;
  category_budget: number | null;
  created_at: string;
  updated_at: string;
};

export type RecurringTransaction = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: MoneyType;
  category_id: string | null;
  frequency: Frequency;
  next_run_date: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  currency: string;
  language: string;
  theme: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
};
