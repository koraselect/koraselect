-- ============================================================
-- KORASELECT · Migración inicial (Supabase)
-- Tablas: products, admin_users, app_settings, blog_posts
-- RLS + funciones security definer
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------------
-- TABLA: products
-- ------------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  title text not null,
  subtitle text,
  category text not null,
  price numeric not null,
  original_price numeric,
  rating numeric,
  reviews_count integer,
  amazon_url text not null,
  asin text,
  main_image text,
  badge text,
  dimensions text,
  capacity text,
  gallery_images jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  highlights jsonb default '[]'::jsonb,
  hotspots jsonb default '[]'::jsonb,
  description text,
  a_plus_content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- TABLA: admin_users
-- ------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- TABLA: app_settings
-- ------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- TABLA: blog_posts
-- ------------------------------------------------------------------
create table if not exists public.blog_posts (
  slug text primary key,
  title text not null,
  excerpt text,
  category text,
  date text,
  read_time text,
  cover_image text,
  body jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.app_settings enable row level security;
alter table public.blog_posts enable row level security;

create policy "products public read"
  on public.products for select using (true);

create policy "app_settings public read"
  on public.app_settings for select using (true);

create policy "blog_posts public read"
  on public.blog_posts for select using (true);

-- Solo lectura pública: se revocan escrituras directas al rol anónimo/autenticado.
-- Las escrituras se hacen únicamente vía las funciones security definer de abajo.
revoke insert, update, delete, truncate, references, trigger
  on public.products from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.app_settings from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.admin_users from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.blog_posts from anon, authenticated;

-- ------------------------------------------------------------------
-- FUNCIÓN: verify_admin (valida credenciales, no expone el hash)
-- ------------------------------------------------------------------
create or replace function public.verify_admin(p_username text, p_password text)
returns setof json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  rec public.admin_users%rowtype;
begin
  select * into rec from public.admin_users where username = p_username;
  if not found then
    return;
  end if;
  if rec.password_hash = crypt(p_password, rec.password_hash) then
    return next json_build_object('id', rec.id, 'username', rec.username);
  end if;
  return;
end;
$$;

-- ------------------------------------------------------------------
-- FUNCIÓN: upsert_product
-- ------------------------------------------------------------------
create or replace function public.upsert_product(p_product jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.products (
    id, title, subtitle, category, price, original_price, rating,
    reviews_count, amazon_url, asin, main_image, badge, dimensions,
    capacity, gallery_images, colors, highlights, hotspots, description,
    a_plus_content, updated_at
  ) values (
    coalesce(p_product->>'id', gen_random_uuid()::text),
    p_product->>'title',
    p_product->>'subtitle',
    p_product->>'category',
    coalesce((p_product->>'price')::numeric, 0),
    (p_product->>'original_price')::numeric,
    (p_product->>'rating')::numeric,
    (p_product->>'reviews_count')::integer,
    p_product->>'amazon_url',
    p_product->>'asin',
    p_product->>'main_image',
    p_product->>'badge',
    p_product->>'dimensions',
    p_product->>'capacity',
    coalesce(p_product->'gallery_images', '[]'::jsonb),
    coalesce(p_product->'colors', '[]'::jsonb),
    coalesce(p_product->'highlights', '[]'::jsonb),
    coalesce(p_product->'hotspots', '[]'::jsonb),
    p_product->>'description',
    p_product->'a_plus_content',
    now()
  )
  on conflict (id) do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    category = excluded.category,
    price = excluded.price,
    original_price = excluded.original_price,
    rating = excluded.rating,
    reviews_count = excluded.reviews_count,
    amazon_url = excluded.amazon_url,
    asin = excluded.asin,
    main_image = excluded.main_image,
    badge = excluded.badge,
    dimensions = excluded.dimensions,
    capacity = excluded.capacity,
    gallery_images = excluded.gallery_images,
    colors = excluded.colors,
    highlights = excluded.highlights,
    hotspots = excluded.hotspots,
    description = excluded.description,
    a_plus_content = excluded.a_plus_content,
    updated_at = excluded.updated_at;
end;
$$;

-- ------------------------------------------------------------------
-- FUNCIÓN: delete_product
-- ------------------------------------------------------------------
create or replace function public.delete_product(p_id text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.products where id = p_id;
$$;

-- ------------------------------------------------------------------
-- FUNCIÓN: update_setting
-- ------------------------------------------------------------------
create or replace function public.update_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_settings (key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update set
    value = excluded.value,
    updated_at = excluded.updated_at;
end;
$$;

-- ------------------------------------------------------------------
-- FUNCIÓN: upsert_blog_post
-- ------------------------------------------------------------------
create or replace function public.upsert_blog_post(p_post jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.blog_posts (
    slug, title, excerpt, category, date, read_time, cover_image, body, updated_at
  ) values (
    p_post->>'slug',
    p_post->>'title',
    p_post->>'excerpt',
    p_post->>'category',
    p_post->>'date',
    p_post->>'read_time',
    p_post->>'cover_image',
    coalesce(p_post->'body', '[]'::jsonb),
    now()
  )
  on conflict (slug) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    category = excluded.category,
    date = excluded.date,
    read_time = excluded.read_time,
    cover_image = excluded.cover_image,
    body = excluded.body,
    updated_at = excluded.updated_at;
end;
$$;

-- ------------------------------------------------------------------
-- FUNCIÓN: delete_blog_post
-- ------------------------------------------------------------------
create or replace function public.delete_blog_post(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.blog_posts where slug = p_slug;
$$;

-- ------------------------------------------------------------------
-- Permisos de ejecución sobre las funciones
-- ------------------------------------------------------------------
revoke all on function public.verify_admin(text, text) from public;
revoke all on function public.upsert_product(jsonb) from public;
revoke all on function public.delete_product(text) from public;
revoke all on function public.update_setting(text, jsonb) from public;
revoke all on function public.upsert_blog_post(jsonb) from public;
revoke all on function public.delete_blog_post(text) from public;

grant execute on function public.verify_admin(text, text) to anon, authenticated;
grant execute on function public.upsert_product(jsonb) to anon, authenticated;
grant execute on function public.delete_product(text) to anon, authenticated;
grant execute on function public.update_setting(text, jsonb) to anon, authenticated;
grant execute on function public.upsert_blog_post(jsonb) to anon, authenticated;
grant execute on function public.delete_blog_post(text) to anon, authenticated;

-- ------------------------------------------------------------------
-- SEEDS
-- ------------------------------------------------------------------

-- Admin: neocarvajal (la clave se guarda como hash bcrypt, nunca en texto plano)
insert into public.admin_users (username, password_hash)
values ('neocarvajal', extensions.crypt('Neo KoraSelect32#$', extensions.gen_salt('bf', 10)))
on conflict (username) do nothing;

-- Configuración de afiliado por defecto
insert into public.app_settings (key, value)
values (
  'affiliate_config',
  '{
    "tag": "koraselect-20",
    "currency": "USD",
    "siteName": "KORASELECT",
    "siteTagline": "Ofertas Curadas de Amazon",
    "defaultCommissionRate": 6.0,
    "customBannerText": "Selección Curada de Amazon"
  }'::jsonb
)
on conflict (key) do nothing;