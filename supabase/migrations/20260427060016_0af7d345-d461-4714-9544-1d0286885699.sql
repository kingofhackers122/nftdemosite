-- Fix 1 & 5-8: pin search_path and restrict execute on SECURITY DEFINER functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
-- handle_new_user is called by the trigger only — revoke direct execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Fix 2-4: restrict bucket listing to owner-only folders
DROP POLICY "Public read nfts" ON storage.objects;
DROP POLICY "Public read avatars" ON storage.objects;
DROP POLICY "Public read banners" ON storage.objects;

-- Allow public direct file access via URL (which is what 'public bucket' enables) but restrict LIST queries
-- Public buckets serve files via CDN regardless of RLS; RLS on objects only governs SQL list/select.
-- So we restrict object SELECT to owners only — files remain reachable via their public URL.
CREATE POLICY "Owners list own nfts" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'nfts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners list own avatars" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners list own banners" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);