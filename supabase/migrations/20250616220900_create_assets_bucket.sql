
-- Create the assets storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 52428800, ARRAY['image/*', 'video/*'])
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to insert files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assets');

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'assets');

-- Create policy to allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'assets');
