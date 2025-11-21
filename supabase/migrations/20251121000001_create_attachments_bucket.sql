insert into storage.buckets (id, name, file_size_limit, allowed_mime_types, public)
values ('asset_attachments', 'asset_attachments', 1024 * 1024 * 1024, ARRAY['application/zip', 'application/x-7z-compressed'], false);

create policy "Authenticated users can upload asset attachments"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'asset_attachments' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Authenticated users can update their own asset attachments"
on storage.objects for update
to authenticated
using ( bucket_id = 'asset_attachments' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Authenticated users can delete their own asset attachments"
on storage.objects for delete
to authenticated
using ( bucket_id = 'asset_attachments' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can view their own asset attachments"
on storage.objects for select
to authenticated
using ( bucket_id = 'asset_attachments' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Allow public access if needed? No, requirements say "users can upload". 
-- Usually purchased assets should be downloadable by the buyer. 
-- For now, let's stick to "creator can read/write" and we might need a policy for "buyer can read" later.
-- The prompt says "users can upload a zip file".
-- I will stick to creator access for now.
