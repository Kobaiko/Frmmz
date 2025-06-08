
import { useState } from "react";
import { Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VideoUploadProps {
  onVideoLoad: (url: string) => void;
}

export const VideoUpload = ({ onVideoLoad }: VideoUploadProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError("Please select a valid video file");
        return;
      }
      
      setError("");
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      console.log('📁 File uploaded, blob URL created:', url);
      setTimeout(() => {
        onVideoLoad(url);
        setIsLoading(false);
      }, 500);
    }
  };

  const isValidVideoUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // Block known video hosting services that don't allow direct access
      const blockedDomains = [
        'youtube.com', 'youtu.be', 'www.youtube.com',
        'vimeo.com', 'www.vimeo.com',
        'dailymotion.com', 'www.dailymotion.com',
        'facebook.com', 'www.facebook.com',
        'instagram.com', 'www.instagram.com',
        'tiktok.com', 'www.tiktok.com'
      ];
      
      if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return false;
      }
      
      // Check if it's a direct video file URL
      const videoExtensions = /\.(mp4|webm|ogg|avi|mov|mkv|m4v)(\?.*)?$/i;
      const isDirectVideo = videoExtensions.test(url);
      
      // Allow blob URLs (for local files)
      const isBlobUrl = url.startsWith('blob:');
      
      return isDirectVideo || isBlobUrl;
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a video URL");
      return;
    }

    const trimmedUrl = urlInput.trim();
    
    // Check for blocked video hosting services first
    const blockedServices = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'facebook.com', 'instagram.com', 'tiktok.com'];
    const isBlockedService = blockedServices.some(service => trimmedUrl.includes(service));
    
    if (isBlockedService) {
      setError("YouTube, Vimeo, and other video hosting services are not supported due to CORS restrictions. Please use a direct video file URL (e.g., ending in .mp4, .webm, .mov) or upload a file instead.");
      return;
    }

    if (!isValidVideoUrl(trimmedUrl)) {
      setError("Please enter a direct video file URL (e.g., https://example.com/video.mp4)");
      return;
    }

    setError("");
    setIsLoading(true);
    console.log('🌐 Loading video from URL:', trimmedUrl);
    
    // Create a simple test to see if we can load the video
    try {
      const response = await fetch(trimmedUrl, { 
        method: 'HEAD',
        mode: 'no-cors' // This will help avoid CORS issues for the test
      });
      
      console.log('✅ URL appears accessible, loading video');
      onVideoLoad(trimmedUrl);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ URL test failed:', error);
      
      // Try loading anyway - some servers block HEAD requests but allow video access
      console.log('🔄 HEAD request failed, trying direct video load...');
      
      const testVideo = document.createElement('video');
      testVideo.crossOrigin = 'anonymous';
      testVideo.preload = 'metadata';
      
      const handleSuccess = () => {
        console.log('✅ Direct video load successful');
        onVideoLoad(trimmedUrl);
        setIsLoading(false);
        testVideo.remove();
      };

      const handleError = (e: Event) => {
        console.error('❌ Direct video load failed:', e);
        setError("Unable to load video from this URL. This might be due to CORS restrictions or the URL not being accessible. Please try uploading the file directly instead.");
        setIsLoading(false);
        testVideo.remove();
      };

      testVideo.addEventListener('loadedmetadata', handleSuccess);
      testVideo.addEventListener('error', handleError);
      
      // Set a timeout as fallback
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log('⏰ Video load timeout');
          setError("Video loading timed out. The URL might not be accessible or may have CORS restrictions. Please try uploading the file directly.");
          setIsLoading(false);
          testVideo.remove();
        }
      }, 10000);

      testVideo.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
      });

      testVideo.addEventListener('error', () => {
        clearTimeout(timeout);
      });

      testVideo.src = trimmedUrl;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-white text-xl">Add Video</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="upload" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Video URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 mt-6">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="mx-auto mb-4 text-gray-400" size={40} />
              <p className="text-gray-300 mb-4">
                Drag and drop your video here, or click to browse
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
                disabled={isLoading}
              />
              <label htmlFor="video-upload">
                <Button 
                  variant="outline" 
                  disabled={isLoading} 
                  asChild
                  className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                >
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Link size={20} className="text-gray-400" />
                <Input
                  placeholder="https://example.com/video.mp4"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setError(""); // Clear error when typing
                  }}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>✅ Supported:</strong> Direct video file URLs (.mp4, .webm, .mov, etc.)</p>
                <p><strong>❌ Not supported:</strong> YouTube, Vimeo, TikTok, Instagram (CORS restrictions)</p>
                <p><strong>💡 Tip:</strong> For best results, upload your video file directly</p>
                <p><strong>📝 Example:</strong> https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4</p>
              </div>
              <Button 
                onClick={handleUrlSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !urlInput.trim()}
              >
                {isLoading ? "Testing URL..." : "Load Video"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
