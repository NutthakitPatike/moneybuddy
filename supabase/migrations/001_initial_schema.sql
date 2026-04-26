create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense', 'both')),
  icon text not null default 'Circle',
  color text not null default '#93c5fd',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name, type)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null,
  amount numeric(14,2) not null check (amount >= 0),
  category_id uuid references public.categories(id) on delete set null,
  transaction_date date not null default current_date,
  note text,
  receipt_url text,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  total_budget numeric(14,2) not null default 0 check (total_budget >= 0),
  category_id uuid references public.categories(id) on delete cascade,
  category_budget numeric(14,2) check (category_budget is null or category_budget >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, category_id)
);

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(14,2) not null check (amount >= 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) on delete set null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_run_date date not null,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete cascade,
  file_path text not null,
  public_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  currency text not null default 'THB',
  language text not null default 'th',
  theme text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index if not exists idx_transactions_category on public.transactions(category_id);
create index if not exists idx_budgets_user_month on public.budgets(user_id, month);
create unique index if not exists idx_budgets_one_total_per_month on public.budgets(user_id, month) where category_id is null;
create unique index if not exists idx_budgets_one_category_per_month on public.budgets(user_id, month, category_id) where category_id is not null;
create index if not exists idx_recurring_due on public.recurring_transactions(next_run_date) where is_active = true;
create index if not exists idx_ai_history_user_created on public.ai_chat_history(user_id, created_at);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at before update on public.transactions for each row execute function public.set_updated_at();
drop trigger if exists budgets_updated_at on public.budgets;
create trigger budgets_updated_at before update on public.budgets for each row execute function public.set_updated_at();
drop trigger if exists recurring_updated_at on public.recurring_transactions;
create trigger recurring_updated_at before update on public.recurring_transactions for each row execute function public.set_updated_at();
drop trigger if exists receipts_updated_at on public.receipts;
create trigger receipts_updated_at before update on public.receipts for each row execute function public.set_updated_at();
drop trigger if exists user_settings_updated_at on public.user_settings;
create trigger user_settings_updated_at before update on public.user_settings for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.receipts enable row level security;
alter table public.ai_chat_history enable row level security;
alter table public.user_settings enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = user_id);

create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);

create policy "recurring_select_own" on public.recurring_transactions for select using (auth.uid() = user_id);
create policy "recurring_insert_own" on public.recurring_transactions for insert with check (auth.uid() = user_id);
create policy "recurring_update_own" on public.recurring_transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recurring_delete_own" on public.recurring_transactions for delete using (auth.uid() = user_id);

create policy "receipts_select_own" on public.receipts for select using (auth.uid() = user_id);
create policy "receipts_insert_own" on public.receipts for insert with check (auth.uid() = user_id);
create policy "receipts_update_own" on public.receipts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "receipts_delete_own" on public.receipts for delete using (auth.uid() = user_id);

create policy "ai_chat_select_own" on public.ai_chat_history for select using (auth.uid() = user_id);
create policy "ai_chat_insert_own" on public.ai_chat_history for insert with check (auth.uid() = user_id);
create policy "ai_chat_delete_own" on public.ai_chat_history for delete using (auth.uid() = user_id);

create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings_delete_own" on public.user_settings for delete using (auth.uid() = user_id);

create or replace function public.create_default_categories(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    (target_user, 'Food', 'expense', 'Utensils', '#fb7185', true),
    (target_user, 'Transport', 'expense', 'Bus', '#38bdf8', true),
    (target_user, 'Shopping', 'expense', 'ShoppingBag', '#f472b6', true),
    (target_user, 'Bills', 'expense', 'ReceiptText', '#f59e0b', true),
    (target_user, 'Education', 'expense', 'GraduationCap', '#818cf8', true),
    (target_user, 'Entertainment', 'expense', 'Gamepad2', '#c084fc', true),
    (target_user, 'Health', 'expense', 'HeartPulse', '#34d399', true),
    (target_user, 'Rent', 'expense', 'Home', '#fb923c', true),
    (target_user, 'Travel', 'expense', 'Plane', '#22d3ee', true),
    (target_user, 'Other', 'expense', 'Sparkles', '#94a3b8', true),
    (target_user, 'Salary', 'income', 'Wallet', '#2dd4bf', true),
    (target_user, 'Freelance', 'income', 'Laptop', '#60a5fa', true),
    (target_user, 'Gift', 'income', 'Gift', '#f9a8d4', true),
    (target_user, 'Investment', 'income', 'TrendingUp', '#a3e635', true),
    (target_user, 'Business', 'income', 'BriefcaseBusiness', '#facc15', true),
    (target_user, 'Other', 'income', 'CircleDollarSign', '#a78bfa', true)
  on conflict do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      avatar_url = excluded.avatar_url;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  perform public.create_default_categories(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "receipts_storage_select_own" on storage.objects
for select using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "receipts_storage_insert_own" on storage.objects
for insert with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "receipts_storage_update_own" on storage.objects
for update using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "receipts_storage_delete_own" on storage.objects
for delete using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
