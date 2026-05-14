alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.pickup_orders enable row level security;
alter table public.pickup_order_items enable row level security;
alter table public.pickup_order_images enable row level security;
alter table public.reviews enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Addresses
create policy "Users can manage own addresses"
on public.addresses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Orders: sellers can manage their own orders
create policy "Sellers can view own orders"
on public.pickup_orders for select
using (auth.uid() = seller_id);

create policy "Sellers can create orders"
on public.pickup_orders for insert
with check (auth.uid() = seller_id);

-- Notifications
create policy "Users can view own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "Users can update own notifications"
on public.notifications for update
using (auth.uid() = user_id);