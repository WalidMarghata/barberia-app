-- ============================================================
-- La Barberia Hassan — Supabase Schema
-- Paste this in the Supabase SQL Editor and click RUN
-- ============================================================

-- Appointments table
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  barber_id text not null,
  barber_name text not null,
  service_id text not null,
  service_name text not null,
  service_price integer not null,
  service_duration integer not null,
  date date not null,
  time text not null,
  customer_name text not null,
  customer_phone text not null,
  notes text default '',
  status text default 'confirmed',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.appointments enable row level security;

-- Allow anyone to insert (new booking)
create policy "Anyone can insert appointments"
  on public.appointments for insert
  with check (true);

-- Allow anyone to read (to check availability)
create policy "Anyone can read appointments"
  on public.appointments for select
  using (true);

-- Allow anyone to update (e.g. cancel)
create policy "Anyone can update appointments"
  on public.appointments for update
  using (true);
