create type public.asset_status as enum ('Active', 'Draft', 'Archived');

create table if not exists public.assets (
  id uuid not null default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 3) not null,
  preview_images text[] not null default '{}',
  creator_id uuid references public.profiles(id) on delete cascade not null,
  status public.asset_status not null default 'Draft',
  attachment_path text not null,
  created_at timestamp with time zone not null default now(),
  constraint assets_pkey primary key (id)
);

alter table public.assets enable row level security;

create policy "Public assets are viewable by everyone."
  on public.assets for select
  using ( status = 'Active' );

create policy "Users can see all their own assets."
  on public.assets for select
  using ( auth.uid() = creator_id );

create policy "Users can insert their own assets."
  on public.assets for insert
  with check ( auth.uid() = creator_id );

create policy "Users can update their own assets."
  on public.assets for update
  using ( auth.uid() = creator_id );

create policy "Users can delete their own assets."
  on public.assets for delete
  using ( auth.uid() = creator_id );

