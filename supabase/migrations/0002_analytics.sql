-- ============================================================
-- KORASELECT · Migración 0002 · Analítica
-- Tablas: page_views (conteo diario por URL), event_clicks
-- RLS: solo lectura pública; escrituras vía funciones security definer
-- ============================================================

-- ------------------------------------------------------------------
-- TABLA: page_views
-- ------------------------------------------------------------------
create table if not exists public.page_views (
  page text not null,
  view_date date not null default current_date,
  views integer not null default 0,
  primary key (page, view_date)
);

create index if not exists page_views_view_date_idx on public.page_views (view_date desc);

-- ------------------------------------------------------------------
-- TABLA: event_clicks
-- ------------------------------------------------------------------
create table if not exists public.event_clicks (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  slug text,
  product_id text,
  product_asin text,
  product_title text,
  destination_url text,
  created_at timestamptz not null default now()
);

create index if not exists event_clicks_created_at_idx on public.event_clicks (created_at desc);
create index if not exists event_clicks_event_idx on public.event_clicks (event);
create index if not exists event_clicks_slug_idx on public.event_clicks (slug);

-- ------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------
alter table public.page_views enable row level security;
alter table public.event_clicks enable row level security;

create policy "page_views public read"
  on public.page_views for select using (true);

create policy "event_clicks public read"
  on public.event_clicks for select using (true);

-- Solo lectura pública: las escrituras se hacen solo vía las funciones security definer.
revoke insert, update, delete, truncate, references, trigger
  on public.page_views from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.event_clicks from anon, authenticated;

-- ------------------------------------------------------------------
-- FUNCIÓN: increment_page_view (suma 1 vista por página/día)
-- ------------------------------------------------------------------
create or replace function public.increment_page_view(p_page text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_page is null or btrim(p_page) = '' then
    return;
  end if;
  insert into public.page_views (page, view_date, views)
  values (btrim(p_page), current_date, 1)
  on conflict (page, view_date)
  do update set views = public.page_views.views + 1;
end;
$$;

-- ------------------------------------------------------------------
-- FUNCIÓN: log_event (registra un clic/evento de producto)
-- ------------------------------------------------------------------
create or replace function public.log_event(
  p_event text,
  p_slug text default null,
  p_product_id text default null,
  p_product_asin text default null,
  p_product_title text default null,
  p_destination_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event is null or btrim(p_event) = '' then
    return;
  end if;
  insert into public.event_clicks (event, slug, product_id, product_asin, product_title, destination_url)
  values (btrim(p_event), nullif(p_slug, ''), nullif(p_product_id, ''), nullif(p_product_asin, ''), nullif(p_product_title, ''), nullif(p_destination_url, ''));
end;
$$;

-- ------------------------------------------------------------------
-- Permisos de ejecución sobre las funciones
-- ------------------------------------------------------------------
revoke all on function public.increment_page_view(text) from public;
revoke all on function public.log_event(text, text, text, text, text, text) from public;

grant execute on function public.increment_page_view(text) to anon, authenticated;
grant execute on function public.log_event(text, text, text, text, text, text) to anon, authenticated;