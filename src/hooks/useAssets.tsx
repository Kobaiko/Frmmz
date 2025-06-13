
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Asset {
  id: string;
  name: string;
  file_type: string;
  file_url: string;
  file_size: number;
  duration?: string;
  resolution?: string;
  status: string;
  thumbnail_url?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  uploaded_by: string;
}

export const useAssets = (projectId?: string) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAssets = async () => {
    if (!user || !projectId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async (file: File, projectId: string) => {
    if (!user) return null;

    try {
      // Upload file to Supabase storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      // Determine file type
      const getFileType = (type: string): string => {
        if (type.startsWith('video/')) return 'video';
        if (type.startsWith('image/')) return 'image';
        if (type.startsWith('audio/')) return 'audio';
        return 'document';
      };

      // Create asset record in database
      const { data, error } = await supabase
        .from('assets')
        .insert([
          {
            name: file.name,
            file_type: getFileType(file.type),
            file_url: publicUrl,
            file_size: file.size,
            project_id: projectId,
            uploaded_by: user.id,
            status: 'ready'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setAssets(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload asset');
      return null;
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [user, projectId]);

  return {
    assets,
    loading,
    error,
    uploadAsset,
    refetch: fetchAssets
  };
};
