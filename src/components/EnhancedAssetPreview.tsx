
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Download, 
  Share2, 
  MessageCircle, 
  Eye,
  Clock,
  FileVideo,
  FileImage,
  FileAudio,
  File,
  MoreHorizontal,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  duration?: string;
  size: string;
  format: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error' | 'approved';
  comments: number;
  views: number;
  isStarred?: boolean;
  processingProgress?: number;
}

interface EnhancedAssetPreviewProps {
  asset: Asset;
  onPlay?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  onDownload?: () => void;
}

export const EnhancedAssetPreview = ({ 
  asset, 
  onPlay, 
  onShare, 
  onComment, 
  onDownload 
}: EnhancedAssetPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = (type: Asset['type']) => {
    switch (type) {
      case 'video': return <FileVideo className="h-5 w-5" />;
      case 'image': return <FileImage className="h-5 w-5" />;
      case 'audio': return <FileAudio className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-600';
      case 'processing': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      case 'approved': return 'bg-blue-600';
    }
  };

  const getStatusIcon = (status: Asset['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-3 w-3" />;
      case 'processing': return <Clock className="h-3 w-3" />;
      case 'error': return <AlertCircle className="h-3 w-3" />;
      case 'approved': return <Star className="h-3 w-3" />;
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    onPlay?.();
  };

  return (
    <Card 
      className="bg-gray-800 border-gray-700 hover:border-pink-500 transition-all duration-200 group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Thumbnail/Preview Area */}
        <div className="relative aspect-video bg-gray-700 overflow-hidden">
          {asset.thumbnail ? (
            <img 
              src={asset.thumbnail} 
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              {getFileIcon(asset.type)}
            </div>
          )}

          {/* Overlay Controls */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {asset.type === 'video' && (
              <Button
                onClick={handlePlay}
                className="bg-white/20 hover:bg-white/30 border-0 rounded-full p-3"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white ml-1" />
                )}
              </Button>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getStatusColor(asset.status)} text-white`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(asset.status)}
                <span className="capitalize">{asset.status}</span>
              </div>
            </Badge>
          </div>

          {/* Duration Badge */}
          {asset.duration && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="outline" className="bg-black/60 border-gray-600 text-white">
                {asset.duration}
              </Badge>
            </div>
          )}

          {/* Processing Progress */}
          {asset.status === 'processing' && asset.processingProgress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <Progress value={asset.processingProgress} className="h-2" />
              <div className="text-xs text-white mt-1 text-center">
                Processing... {asset.processingProgress}%
              </div>
            </div>
          )}

          {/* Star Indicator */}
          {asset.isStarred && (
            <div className="absolute top-3 right-3">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            </div>
          )}
        </div>

        {/* Asset Info */}
        <div className="p-4 space-y-3">
          {/* Title and File Info */}
          <div>
            <h3 className="text-white font-medium truncate group-hover:text-pink-400 transition-colors">
              {asset.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
              <span>{asset.format.toUpperCase()}</span>
              <span>•</span>
              <span>{asset.size}</span>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{asset.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{asset.comments}</span>
              </div>
            </div>
            <span>{asset.uploadedAt.toLocaleDateString()}</span>
          </div>

          {/* Uploader */}
          <div className="text-xs text-gray-500">
            Uploaded by {asset.uploadedBy}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onComment}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onShare}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDownload}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
