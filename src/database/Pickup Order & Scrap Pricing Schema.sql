-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- =========================
-- ENUMS
-- =========================

create type user_role as enum (
  'seller',
  'admin'
);

create type order_status as enum (
  'pending',
  'confirmed',
  'rejected',
  'on_the_way',
  'completed',
  'cancelled'
);

create type scrap_unit as enum (
  'kg',
  'item'
);

create type notification_type as enum (
  'order_confirmed',
  'order_rejected',
  'order_status_updated',
  'price_updated',
  'general'
);

-- =========================
-- USERS / PROFILES
-- =========================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  avatar_url text,
  role user_role not null default 'seller',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- ADDRESSES
-- MVP uses one selected address per order.
-- This table still supports saving addresses later.
-- =========================

create table public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient_name text,
  phone text,
  address_line text not null,
  ward text,
  district text,
  city text,
  latitude double precision,
  longitude double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================
-- SCRAP CATEGORIES
-- Examples: iron, aluminum, copper, paper, plastic, electronics
-- =========================

create table public.scrap_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  unit scrap_unit not null default 'kg',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- PRICE TABLE
-- Price can be global or area-specific.
-- =========================

create table public.scrap_prices (
  id uuid primary key default uuid_generate_v4(),
  scrap_category_id uuid not null references public.scrap_categories(id) on delete cascade,
  area_code text,
  price_min numeric(12, 2) not null,
  price_max numeric(12, 2),
  currency text not null default 'VND',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),

  constraint valid_price_range check (
    price_max is null or price_max >= price_min
  )
);

-- =========================
-- PICKUP ORDERS
-- =========================

create table public.pickup_orders (
  id uuid primary key default uuid_generate_v4(),

  seller_id uuid not null references public.profiles(id) on delete cascade,
  assigned_admin_id uuid references public.profiles(id),

  status order_status not null default 'pending',

  scheduled_date date not null,
  scheduled_time_from time,
  scheduled_time_to time,

  address_id uuid references public.addresses(id),
  address_snapshot jsonb not null,

  note text,
  admin_note text,
  rejection_reason text,

  estimated_total numeric(12, 2),
  final_total numeric(12, 2),

  confirmed_at timestamptz,
  rejected_at timestamptz,
  on_the_way_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_pickup_time check (
    (
      scheduled_time_from is null
      and scheduled_time_to is null
    )
    or (
      scheduled_time_from is not null
      and scheduled_time_to is not null
      and scheduled_time_to > scheduled_time_from
    )
  )
);

-- =========================
-- ORDER ITEMS
-- A single order can contain multiple scrap types.
-- =========================

create table public.pickup_order_items (
  id uuid primary key default uuid_generate_v4(),

  order_id uuid not null references public.pickup_orders(id) on delete cascade,
  scrap_category_id uuid not null references public.scrap_categories(id),

  estimated_quantity numeric(12, 2),
  final_quantity numeric(12, 2),

  unit scrap_unit not null default 'kg',

  price_snapshot jsonb,
  estimated_subtotal numeric(12, 2),
  final_subtotal numeric(12, 2),

  created_at timestamptz not null default now()
);

-- =========================
-- ORDER IMAGES
-- Store files in Supabase Storage, save URLs/paths here.
-- =========================

create table public.pickup_order_images (
  id uuid primary key default uuid_generate_v4(),

  order_id uuid not null references public.pickup_orders(id) on delete cascade,
  storage_path text not null,
  public_url text,
  created_at timestamptz not null default now()
);

-- =========================
-- ORDER STATUS HISTORY
-- Useful for tracking and admin audit.
-- =========================

create table public.order_status_history (
  id uuid primary key default uuid_generate_v4(),

  order_id uuid not null references public.pickup_orders(id) on delete cascade,
  old_status order_status,
  new_status order_status not null,

  changed_by uuid references public.profiles(id),
  note text,

  created_at timestamptz not null default now()
);

-- =========================
-- REVIEWS
-- Seller reviews collector/order after completion.
-- =========================

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),

  order_id uuid not null unique references public.pickup_orders(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid references public.profiles(id),

  rating int not null check (rating >= 1 and rating <= 5),
  comment text,

  created_at timestamptz not null default now()
);

-- =========================
-- TRANSACTIONS
-- MVP can support cash/manual payment first.
-- =========================

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),

  order_id uuid not null unique references public.pickup_orders(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),

  amount numeric(12, 2) not null,
  currency text not null default 'VND',
  payment_method text not null default 'cash',
  paid_at timestamptz,

  created_at timestamptz not null default now()
);

-- =========================
-- NOTIFICATIONS
-- =========================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),

  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.pickup_orders(id) on delete cascade,

  type notification_type not null,
  title text not null,
  body text,
  is_read boolean not null default false,

  created_at timestamptz not null default now()
);

-- =========================
-- INDEXES
-- =========================

create index idx_profiles_role on public.profiles(role);
create index idx_addresses_user_id on public.addresses(user_id);
create index idx_scrap_prices_category on public.scrap_prices(scrap_category_id);
create index idx_scrap_prices_active on public.scrap_prices(is_active);
create index idx_orders_seller_id on public.pickup_orders(seller_id);
create index idx_orders_assigned_admin_id on public.pickup_orders(assigned_admin_id);
create index idx_orders_status on public.pickup_orders(status);
create index idx_orders_scheduled_date on public.pickup_orders(scheduled_date);
create index idx_order_items_order_id on public.pickup_order_items(order_id);
create index idx_order_images_order_id on public.pickup_order_images(order_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);