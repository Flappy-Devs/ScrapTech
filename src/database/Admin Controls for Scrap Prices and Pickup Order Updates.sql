-- =========================================================
-- ADMIN WRITE POLICIES FOR SCRAP PRICES
-- =========================================================

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
  v_item jsonb;
  v_final_total numeric(12, 2);
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  ) then
    raise exception 'Only admins can update pickup orders.';
  end if;

  select po.status
  into v_old_status
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