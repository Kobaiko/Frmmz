
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
      new URL(url);
      // Check if it's a common video URL pattern
      const videoExtensions = /\.(mp4|webm|ogg|avi|mov|mkv|m4v)(\?.*)?$/i;
      const commonVideoSites = /(youtube|vimeo|dailymotion|wistia)/i;
      
      return videoExtensions.test(url) || commonVideoSites.test(url) || url.includes('blob:');
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError("Please enter a video URL");
      return;
    }

    if (!isValidVideoUrl(urlInput.trim())) {
      setError("Please enter a valid video URL (e.g., .mp4, .webm, or streaming service)");
      return;
    }

    setError("");
    setIsLoading(true);
    console.log('🌐 Loading video from URL:', urlInput.trim());
    
    // Test if the URL is accessible
    const testVideo = document.createElement('video');
    testVideo.crossOrigin = 'anonymous';
    
    const handleSuccess = () => {
      console.log('✅ URL video test successful');
      onVideoLoad(urlInput.trim());
      setIsLoading(false);
    };

    const handleError = () => {
      console.error('❌ URL video test failed');
      setError("Unable to load video from this URL. Please check if the URL is correct and accessible.");
      setIsLoading(false);
    };

    testVideo.addEventListener('loadedmetadata', handleSuccess);
    testVideo.addEventListener('error', handleError);
    
    // Set a timeout as fallback
    setTimeout(() => {
      if (isLoading) {
        console.log('⏰ URL test timeout, proceeding anyway');
        onVideoLoad(urlInput.trim());
        setIsLoading(false);
      }
    }, 3000);

    testVideo.src = urlInput.trim();
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
              <p className="text-xs text-gray-500">
                Supports direct video URLs (.mp4, .webm, etc.) and some streaming services
              </p>
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
