-- =========================================================
-- ENABLE RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.scrap_categories enable row level security;
alter table public.scrap_prices enable row level security;
alter table public.pickup_orders enable row level security;
alter table public.pickup_order_items enable row level security;
alter table public.pickup_order_images enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;


-- =========================================================
-- PROFILES
-- =========================================================

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
);


-- =========================================================
-- ADDRESSES
-- =========================================================

create policy "Users can manage own addresses"
on public.addresses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- =========================================================
-- SCRAP CATEGORIES
-- Public readable reference data
-- =========================================================

create policy "Authenticated users can view scrap categories"
on public.scrap_categories
for select
to authenticated
using (true);


-- =========================================================
-- SCRAP PRICES
-- Public readable reference data
-- =========================================================

create policy "Authenticated users can view scrap prices"
on public.scrap_prices
for select
to authenticated
using (true);


-- =========================================================
-- PICKUP ORDERS - SELLER
-- =========================================================

create policy "Sellers can view own orders"
on public.pickup_orders
for select
using (auth.uid() = seller_id);

create policy "Sellers can create own orders"
on public.pickup_orders
for insert
with check (auth.uid() = seller_id);


-- =========================================================
-- PICKUP ORDERS - ADMIN
-- =========================================================

create policy "Admins can view all orders"
on public.pickup_orders
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy "Admins can update all orders"
on public.pickup_orders
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- PICKUP ORDER ITEMS - SELLER
-- Needed by create_pickup_order()
-- =========================================================

create policy "Sellers can view own order items"
on public.pickup_order_items
for select
using (
  exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.seller_id = auth.uid()
  )
);

create policy "Sellers can create items for own orders"
on public.pickup_order_items
for insert
with check (
  exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.seller_id = auth.uid()
  )
);


-- =========================================================
-- PICKUP ORDER ITEMS - ADMIN
-- =========================================================

create policy "Admins can view all order items"
on public.pickup_order_items
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy "Admins can update all order items"
on public.pickup_order_items
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- PICKUP ORDER IMAGES - SELLER
-- Needed by create_pickup_order()
-- =========================================================

create policy "Sellers can view own order images"
on public.pickup_order_images
for select
using (
  exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.seller_id = auth.uid()
  )
);

create policy "Sellers can create images for own orders"
on public.pickup_order_images
for insert
with check (
  exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.seller_id = auth.uid()
  )
);


-- =========================================================
-- PICKUP ORDER IMAGES - ADMIN
-- =========================================================

create policy "Admins can view all order images"
on public.pickup_order_images
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- ORDER STATUS HISTORY - SELLER
-- Needed by create_pickup_order()
-- =========================================================

create policy "Sellers can view own order status history"
on public.order_status_history
for select
using (
  exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.seller_id = auth.uid()
  )
);

create policy "Sellers can create initial order status history"
on public.order_status_history
for insert
with check (
  changed_by = auth.uid()
  and old_status is null
  and new_status = 'pending'
  and exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.seller_id = auth.uid()
  )
);


-- =========================================================
-- ORDER STATUS HISTORY - ADMIN
-- =========================================================

create policy "Admins can view all order status history"
on public.order_status_history
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

create policy "Admins can create order status history"
on public.order_status_history
for insert
with check (
  changed_by = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- REVIEWS
-- =========================================================

create policy "Sellers can view own reviews"
on public.reviews
for select
using (auth.uid() = seller_id);

create policy "Sellers can create own reviews"
on public.reviews
for insert
with check (auth.uid() = seller_id);

create policy "Admins can view all reviews"
on public.reviews
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- TRANSACTIONS
-- =========================================================

create policy "Sellers can view own transactions"
on public.transactions
for select
using (auth.uid() = seller_id);

create policy "Admins can view all transactions"
on public.transactions
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create policy "Users can view own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

create policy "Users can update own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);