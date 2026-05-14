create or replace function public.create_pickup_order(
  p_scheduled_date date,
  p_scheduled_time_from time,
  p_scheduled_time_to time,
  p_address_id uuid,
  p_address_snapshot jsonb,
  p_note text,
  p_items jsonb,
  p_image_paths text[]
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_path text;
begin
  insert into public.pickup_orders (
    seller_id,
    scheduled_date,
    scheduled_time_from,
    scheduled_time_to,
    address_id,
    address_snapshot,
    note,
    status
  )
  values (
    auth.uid(),
    p_scheduled_date,
    p_scheduled_time_from,
    p_scheduled_time_to,
    p_address_id,
    p_address_snapshot,
    p_note,
    'pending'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.pickup_order_items (
      order_id,
      scrap_category_id,
      estimated_quantity,
      unit
    )
    values (
      v_order_id,
      (v_item->>'scrap_category_id')::uuid,
      nullif(v_item->>'estimated_quantity', '')::numeric,
      (v_item->>'unit')::scrap_unit
    );
  end loop;

  if p_image_paths is not null then
    foreach v_path in array p_image_paths
    loop
      insert into public.pickup_order_images (
        order_id,
        storage_path
      )
      values (
        v_order_id,
        v_path
      );
    end loop;
  end if;

  insert into public.order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    note
  )
  values (
    v_order_id,
    null,
    'pending',
    auth.uid(),
    'Order created'
  );

  return v_order_id;
end;
$$;