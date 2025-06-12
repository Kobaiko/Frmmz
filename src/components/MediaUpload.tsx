
import { useState } from "react";
import { Upload, Link, FileText, Image, Music, Video, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaUploadProps {
  onMediaLoad: (url: string, type: string, name: string) => void;
}

export const MediaUpload = ({ onMediaLoad }: MediaUploadProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-400" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-400" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5 text-green-400" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-400" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const supportedTypes = [
        'image/', 'video/', 'audio/', 'application/pdf', 
        'text/', 'application/json', 'application/xml'
      ];
      
      const isSupported = supportedTypes.some(type => file.type.startsWith(type));
      
      if (!isSupported) {
        setError("Please select a supported media file (image, video, audio, PDF, or document)");
        return;
      }
      
      setError("");
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      console.log('📁 File uploaded, blob URL created:', url, 'Type:', file.type);
      setTimeout(() => {
        onMediaLoad(url, file.type, file.name);
        setIsLoading(false);
      }, 500);
    }
  };

  const isValidMediaUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // Block known hosting services that don't allow direct access
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
      
      // Check if it's a direct media file URL
      const mediaExtensions = /\.(mp4|webm|ogg|avi|mov|mkv|m4v|jpg|jpeg|png|gif|webp|svg|mp3|wav|aac|flac|pdf|txt|json|xml)(\?.*)?$/i;
      const isDirectMedia = mediaExtensions.test(url);
      
      // Allow blob URLs (for local files)
      const isBlobUrl = url.startsWith('blob:');
      
      return isDirectMedia || isBlobUrl;
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a media URL");
      return;
    }

    const trimmedUrl = urlInput.trim();
    
    // Check for blocked hosting services first
    const blockedServices = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'facebook.com', 'instagram.com', 'tiktok.com'];
    const isBlockedService = blockedServices.some(service => trimmedUrl.includes(service));
    
    if (isBlockedService) {
      setError("YouTube, Vimeo, and other hosting services are not supported due to CORS restrictions. Please use a direct media file URL or upload a file instead.");
      return;
    }

    if (!isValidMediaUrl(trimmedUrl)) {
      setError("Please enter a direct media file URL (e.g., ending in .mp4, .jpg, .pdf, .mp3)");
      return;
    }

    setError("");
    setIsLoading(true);
    console.log('🌐 Loading media from URL:', trimmedUrl);
    
    // Detect file type from extension
    const extension = trimmedUrl.split('.').pop()?.toLowerCase();
    let mediaType = 'application/octet-stream';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      mediaType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    } else if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension || '')) {
      mediaType = `video/${extension}`;
    } else if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension || '')) {
      mediaType = `audio/${extension}`;
    } else if (extension === 'pdf') {
      mediaType = 'application/pdf';
    } else if (['txt', 'json', 'xml'].includes(extension || '')) {
      mediaType = `text/${extension}`;
    }
    
    try {
      const fileName = trimmedUrl.split('/').pop() || 'media-file';
      onMediaLoad(trimmedUrl, mediaType, fileName);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ URL load failed:', error);
      setError("Unable to load media from this URL. Please try uploading the file directly instead.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-white text-xl">Add Media</CardTitle>
        <p className="text-gray-400 text-sm">Upload images, videos, audio, PDFs, and documents</p>
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
              Media URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 mt-6">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="mx-auto mb-4 text-gray-400" size={40} />
              <p className="text-gray-300 mb-2">
                Drag and drop your media here, or click to browse
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Supports: Images, Videos, Audio, PDFs, Documents
              </p>
              <input
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.txt,.json,.xml"
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
                disabled={isLoading}
              />
              <label htmlFor="media-upload">
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
                  placeholder="https://example.com/media.jpg"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>✅ Supported:</strong> Direct media file URLs (.jpg, .mp4, .mp3, .pdf, etc.)</p>
                <p><strong>❌ Not supported:</strong> YouTube, Vimeo, TikTok, Instagram (CORS restrictions)</p>
                <p><strong>💡 Tip:</strong> For best results, upload your media file directly</p>
                <p><strong>📝 Example:</strong> https://example.com/image.jpg</p>
              </div>
              <Button 
                onClick={handleUrlSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !urlInput.trim()}
              >
                {isLoading ? "Loading Media..." : "Load Media"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
