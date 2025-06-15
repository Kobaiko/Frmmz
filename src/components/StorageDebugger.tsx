
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StorageDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testUrl, setTestUrl] = useState("");

  const checkStorageSetup = async () => {
    try {
      console.log('🔍 Checking storage setup...');
      
      // Check if we can list files in the assets bucket
      const { data: files, error: listError } = await supabase.storage
        .from('assets')
        .list();
      
      console.log('📁 Files in assets bucket:', files, 'Error:', listError);
      
      // Get a test file URL
      if (files && files.length > 0) {
        const testFile = files[0];
        const { data: { publicUrl } } = supabase.storage
          .from('assets')
          .getPublicUrl(testFile.name);
        
        setTestUrl(publicUrl);
        console.log('🔗 Test URL:', publicUrl);
        
        // Try to fetch the URL directly
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' });
          console.log('🌐 URL fetch response:', response.status, response.statusText);
          
          setDebugInfo({
            files: files?.length || 0,
            listError: listError?.message || 'None',
            testUrl: publicUrl,
            urlAccessible: response.ok,
            urlStatus: response.status,
            urlHeaders: Object.fromEntries(response.headers.entries())
          });
        } catch (fetchError) {
          console.error('❌ URL fetch error:', fetchError);
          setDebugInfo({
            files: files?.length || 0,
            listError: listError?.message || 'None',
            testUrl: publicUrl,
            urlAccessible: false,
            fetchError: fetchError instanceof Error ? fetchError.message : 'Unknown error'
          });
        }
      } else {
        setDebugInfo({
          files: 0,
          listError: listError?.message || 'No files found',
          testUrl: 'No files to test'
        });
      }
    } catch (error) {
      console.error('❌ Storage check error:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const testVideoUrl = async () => {
    const videoUrl = "https://xuddywlwymdseuuoozcb.supabase.co/storage/v1/object/public/assets/54b224ad-d7d4-43b3-a31e-544eb0fd24a5/1734217799208-kmd5bp3wfi.mp4";
    
    try {
      console.log('🎬 Testing specific video URL:', videoUrl);
      const response = await fetch(videoUrl, { method: 'HEAD' });
      console.log('📺 Video URL response:', response.status, response.statusText);
      
      setDebugInfo(prev => ({
        ...prev,
        specificVideoTest: {
          url: videoUrl,
          accessible: response.ok,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      }));
    } catch (error) {
      console.error('❌ Video URL test error:', error);
      setDebugInfo(prev => ({
        ...prev,
        specificVideoTest: {
          url: videoUrl,
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  useEffect(() => {
    checkStorageSetup();
  }, []);

  return (
    <Card className="bg-gray-800 border-gray-700 text-white m-4">
      <CardHeader>
        <CardTitle>Storage Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={checkStorageSetup} className="bg-blue-600 hover:bg-blue-700">
            Check Storage Setup
          </Button>
          <Button onClick={testVideoUrl} className="bg-green-600 hover:bg-green-700">
            Test Specific Video URL
          </Button>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Results:</h3>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        {testUrl && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Test URL:</p>
            <a 
              href={testUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm break-all"
            >
              {testUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
