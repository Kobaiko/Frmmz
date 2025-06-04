
import { useState } from "react";
import { Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface VideoUploadProps {
  onVideoLoad: (url: string) => void;
}

export const VideoUpload = ({ onVideoLoad }: VideoUploadProps) => {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a valid video file");
        return;
      }
      
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        onVideoLoad(url);
        setIsLoading(false);
        toast.success("Video uploaded successfully!");
      }, 500);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a video URL");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onVideoLoad(urlInput);
      setIsLoading(false);
      toast.success("Video loaded successfully!");
    }, 500);
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-white text-xl">Add Video</CardTitle>
      </CardHeader>
      <CardContent>
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
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Button 
                onClick={handleUrlSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !urlInput.trim()}
              >
                {isLoading ? "Loading..." : "Load Video"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
