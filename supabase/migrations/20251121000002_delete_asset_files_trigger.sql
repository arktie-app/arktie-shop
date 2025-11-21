-- Function to delete files from storage when an asset is deleted
create or replace function public.delete_asset_files()
returns trigger
language plpgsql
security definer
as $$
declare
  url text;
  file_path text;
begin
  -- Delete attachment
  -- The attachment_path is stored directly as the path in the bucket
  if old.attachment_path is not null then
    delete from storage.objects
    where bucket_id = 'asset_attachments'
    and name = old.attachment_path;
  end if;

  -- Delete preview images
  -- preview_images is an array of public URLs
  if old.preview_images is not null then
    foreach url in array old.preview_images
    loop
      -- Extract path from URL
      -- Typical URL: https://.../storage/v1/object/public/asset_preview/folder/file.jpg
      -- We want: folder/file.jpg
      -- We look for the part after 'asset_preview/'
      file_path := substring(url from 'asset_preview/(.*)');
      
      if file_path is not null then
        delete from storage.objects
        where bucket_id = 'asset_preview'
        and name = file_path;
      end if;
    end loop;
  end if;

  return old;
end;
$$;

-- Create the trigger
create trigger on_asset_delete
  after delete on public.assets
  for each row execute procedure public.delete_asset_files();
