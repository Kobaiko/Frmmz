
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Download, FileText, Image, Music, Video, File } from "lucide-react";

interface MediaPreviewProps {
  url: string;
  type: string;
  name: string;
  onComment?: (timestamp?: number) => void;
}

export const MediaPreview = ({ url, type, name, onComment }: MediaPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getFileIcon = () => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-400" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-400" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5 text-green-400" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-400" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const getMediaType = () => {
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.startsWith('audio/')) return 'Audio';
    if (type === 'application/pdf') return 'PDF';
    if (type.startsWith('text/')) return 'Document';
    return 'File';
  };

  const renderMedia = () => {
    if (type.startsWith('image/')) {
      return (
        <div className="w-full h-96 flex items-center justify-center bg-black rounded-lg overflow-hidden">
          <img
            src={url}
            alt={name}
            className="max-w-full max-h-full object-contain"
            onClick={() => onComment?.()}
          />
        </div>
      );
    }

    if (type.startsWith('video/')) {
      return (
        <div className="w-full h-96 bg-black rounded-lg overflow-hidden">
          <video
            src={url}
            controls
            className="w-full h-full object-contain"
            onTimeUpdate={(e) => {
              // Could add timestamp tracking here for comments
            }}
          />
        </div>
      );
    }

    if (type.startsWith('audio/')) {
      return (
        <div className="w-full p-8 bg-gray-700 rounded-lg flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <Music className="h-8 w-8 text-green-400" />
            <span className="text-white font-medium">{name}</span>
          </div>
          <audio
            src={url}
            controls
            className="w-full max-w-md"
          />
        </div>
      );
    }

    if (type === 'application/pdf') {
      return (
        <div className="w-full h-96">
          <iframe
            src={url}
            className="w-full h-full rounded-lg border border-gray-600"
            title={name}
          />
        </div>
      );
    }

    if (type.startsWith('text/')) {
      return (
        <div className="w-full h-96 bg-gray-700 rounded-lg overflow-auto">
          <iframe
            src={url}
            className="w-full h-full bg-white rounded"
            title={name}
          />
        </div>
      );
    }

    // Fallback for unsupported types
    return (
      <div className="w-full h-48 bg-gray-700 rounded-lg flex flex-col items-center justify-center space-y-4">
        {getFileIcon()}
        <div className="text-center">
          <p className="text-white font-medium">{name}</p>
          <p className="text-gray-400 text-sm">{getMediaType()}</p>
        </div>
        <Button 
          onClick={() => window.open(url, '_blank')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h3 className="text-white font-medium">{name}</h3>
              <Badge variant="secondary" className="bg-gray-600 text-gray-200">
                {getMediaType()}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onComment?.()}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Add Comment
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(url, '_blank')}
              className="border-gray-600"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {renderMedia()}
      </CardContent>
    </Card>
  );
};
