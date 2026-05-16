-- =========================================================
-- ADMIN WRITE POLICIES FOR SCRAP PRICES
-- =========================================================

drop policy if exists "Admins can create scrap prices" on public.scrap_prices;
create policy "Admins can create scrap prices"
on public.scrap_prices
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "Admins can update scrap prices" on public.scrap_prices;
create policy "Admins can update scrap prices"
on public.scrap_prices
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

drop policy if exists "Admins can delete scrap prices" on public.scrap_prices;
create policy "Admins can delete scrap prices"
on public.scrap_prices
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- ADMIN WRITE POLICIES FOR NOTIFICATIONS
-- =========================================================

drop policy if exists "Admins can create notifications" on public.notifications;
create policy "Admins can create notifications"
on public.notifications
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- =========================================================
-- ADMIN ATOMIC ORDER UPDATE
-- =========================================================

create or replace function public.admin_update_pickup_order(
  p_order_id uuid,
  p_scheduled_date date,
  p_scheduled_time_from time,
  p_scheduled_time_to time,
  p_status public.order_status,
  p_admin_note text,
  p_rejection_reason text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_old_status public.order_status;
  v_old_scheduled_date date;
  v_old_scheduled_time_from time;
  v_old_scheduled_time_to time;
  v_seller_id uuid;
  v_item jsonb;
  v_final_total numeric(12, 2);
  v_notification_type public.notification_type;
  v_notification_title text;
  v_notification_body text;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  ) then
    raise exception 'Only admins can update pickup orders.';
  end if;

  select
    po.status,
    po.scheduled_date,
    po.scheduled_time_from,
    po.scheduled_time_to,
    po.seller_id
  into
    v_old_status,
    v_old_scheduled_date,
    v_old_scheduled_time_from,
    v_old_scheduled_time_to,
    v_seller_id
  from public.pickup_orders po
  where po.id = p_order_id
  for update;

  if v_old_status is null then
    raise exception 'Pickup order not found.';
  end if;

  select sum(
    nullif(item->>'final_subtotal', '')::numeric
  )
  into v_final_total
  from jsonb_array_elements(
    coalesce(p_items, '[]'::jsonb)
  ) as item;

  update public.pickup_orders
  set
    scheduled_date = p_scheduled_date,
    scheduled_time_from = p_scheduled_time_from,
    scheduled_time_to = p_scheduled_time_to,
    status = p_status,
    admin_note = nullif(trim(p_admin_note), ''),
    rejection_reason = case
      when p_status = 'rejected'
        then nullif(trim(p_rejection_reason), '')
      else rejection_reason
    end,
    final_total = v_final_total,
    assigned_admin_id = case
      when p_status in ('confirmed', 'on_the_way', 'completed')
        then coalesce(assigned_admin_id, auth.uid())
      else assigned_admin_id
    end,
    confirmed_at = case
      when p_status = 'confirmed'
        and v_old_status is distinct from p_status
        then coalesce(confirmed_at, now())
      else confirmed_at
    end,
    rejected_at = case
      when p_status = 'rejected'
        and v_old_status is distinct from p_status
        then coalesce(rejected_at, now())
      else rejected_at
    end,
    on_the_way_at = case
      when p_status = 'on_the_way'
        and v_old_status is distinct from p_status
        then coalesce(on_the_way_at, now())
      else on_the_way_at
    end,
    completed_at = case
      when p_status = 'completed'
        and v_old_status is distinct from p_status
        then coalesce(completed_at, now())
      else completed_at
    end,
    cancelled_at = case
      when p_status = 'cancelled'
        and v_old_status is distinct from p_status
        then coalesce(cancelled_at, now())
      else cancelled_at
    end,
    updated_at = now()
  where id = p_order_id;

  for v_item in
    select *
    from jsonb_array_elements(
      coalesce(p_items, '[]'::jsonb)
    )
  loop
    update public.pickup_order_items
    set
      final_quantity =
        nullif(v_item->>'final_quantity', '')::numeric,
      final_subtotal =
        nullif(v_item->>'final_subtotal', '')::numeric
    where id = (v_item->>'id')::uuid
      and order_id = p_order_id;
  end loop;

  if p_status is distinct from v_old_status then
    insert into public.order_status_history (
      order_id,
      old_status,
      new_status,
      changed_by,
      note
    )
    values (
      p_order_id,
      v_old_status,
      p_status,
      auth.uid(),
      p_admin_note
    );
  end if;

  v_notification_type = case
    when p_status = 'confirmed'
      and p_status is distinct from v_old_status
      then 'order_confirmed'::public.notification_type
    when p_status = 'rejected'
      and p_status is distinct from v_old_status
      then 'order_rejected'::public.notification_type
    else 'order_status_updated'::public.notification_type
  end;

  v_notification_title = case
    when p_status = 'confirmed'
      and p_status is distinct from v_old_status
      then 'Đơn hàng đã được xác nhận'
    when p_status = 'rejected'
      and p_status is distinct from v_old_status
      then 'Đơn hàng bị từ chối'
    when p_status = 'on_the_way'
      and p_status is distinct from v_old_status
      then 'Người thu gom sắp tới'
    when p_status = 'completed'
      and p_status is distinct from v_old_status
      then 'Giao dịch thành công'
    when p_scheduled_date is distinct from v_old_scheduled_date
      or p_scheduled_time_from is distinct from v_old_scheduled_time_from
      or p_scheduled_time_to is distinct from v_old_scheduled_time_to
      then 'Lịch thu gom đã được cập nhật'
    else 'Cập nhật đơn hàng'
  end;

  v_notification_body = concat(
    'Đơn #',
    left(p_order_id::text, 8),
    ' đã được cập nhật. Trạng thái: ',
    case p_status
      when 'pending' then 'chờ xác nhận'
      when 'confirmed' then 'đã xác nhận'
      when 'rejected' then 'từ chối'
      when 'on_the_way' then 'đang tới'
      when 'completed' then 'hoàn thành'
      when 'cancelled' then 'đã hủy'
      else p_status::text
    end,
    '.'
  );

  insert into public.notifications (
    user_id,
    order_id,
    type,
    title,
    body
  )
  values (
    v_seller_id,
    p_order_id,
    v_notification_type,
    v_notification_title,
    v_notification_body
  );

  return p_order_id;
end;
$$;


grant execute on function public.admin_update_pickup_order(
  uuid,
  date,
  time,
  time,
  public.order_status,
  text,
  text,
  jsonb
) to authenticated;
