
-- Create the 'assets' storage bucket and make it public.
-- This will not cause an error if the bucket already exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Remove any previous policies on the storage.objects table for the assets bucket to prevent conflicts.
DROP POLICY IF EXISTS "Allow public read access to assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to assets" ON storage.objects;

-- Allow public read access to files in the 'assets' bucket.
-- This allows anyone to view the files, which is necessary for the video player to work.
CREATE POLICY "Allow public read access to assets" 
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

-- Allow authenticated (logged-in) users to upload files to the 'assets' bucket.
-- This ensures that only users of your application can upload new files.
CREATE POLICY "Allow authenticated users to upload to assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'assets' );
