insert into storage.buckets (id, name, public)
values ('asset_preview', 'asset_preview', true);

create policy "Asset preview images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'asset_preview' );

create policy "Authenticated users can upload asset preview images."
  on storage.objects for insert
  with check ( bucket_id = 'asset_preview' AND auth.uid() is not null );

create policy "Users can update their own asset preview images."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'asset_preview' AND auth.uid() is not null );

create policy "Users can delete their own asset preview images."
  on storage.objects for delete
  using ( auth.uid() = owner AND bucket_id = 'asset_preview' );
