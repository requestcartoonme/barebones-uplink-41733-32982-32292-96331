-- Create storage bucket for CSV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('csv-uploads', 'csv-uploads', false);

-- Create table to track uploaded CSV files
CREATE TABLE public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  row_count INTEGER,
  status TEXT DEFAULT 'uploaded'
);

-- Enable RLS on uploaded_files table
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own files
CREATE POLICY "Users can view their own files"
ON public.uploaded_files
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own files
CREATE POLICY "Users can insert their own files"
ON public.uploaded_files
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON public.uploaded_files
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Storage policies for csv-uploads bucket
CREATE POLICY "Users can upload their own CSV files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'csv-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own CSV files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'csv-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own CSV files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'csv-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);