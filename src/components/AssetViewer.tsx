
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentPanel } from "./CommentPanel";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MoreHorizontal, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  MessageSquare,
  Eye,
  Clock,
  User,
  Calendar,
  FileVideo,
  FileImage,
  FileAudio,
  FileText,
  File
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  duration?: string;
  fileSize: string;
  format: string;
  resolution?: string;
  uploadedBy: string;
  uploadedAt: Date;
  lastModified: Date;
  status: 'processing' | 'ready' | 'needs_review' | 'approved' | 'rejected';
  comments: number;
  views: number;
  description?: string;
  tags: string[];
  version: string;
}

interface Comment {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  createdAt: Date;
  parentId?: string;
  attachments?: Array<{ url: string; type: string; name: string }>;
  isInternal?: boolean;
  hasDrawing?: boolean;
}

interface AssetViewerProps {
  assetId: string;
  onBack: () => void;
}

export const AssetViewer = ({ assetId, onBack }: AssetViewerProps) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockAssets: { [key: string]: Asset } = {
      '1': {
        id: '1',
        name: 'hero_video_final_v3.mp4',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: '/placeholder.svg',
        duration: '2:34',
        fileSize: '524 MB',
        format: 'MP4',
        resolution: '4K (3840x2160)',
        uploadedBy: 'Alex Chen',
        uploadedAt: new Date('2024-06-12'),
        lastModified: new Date('2024-06-12'),
        status: 'approved',
        comments: 8,
        views: 23,
        description: 'Final version of the hero video for the main campaign. Includes all approved changes from the client review.',
        tags: ['hero', 'final', 'approved', 'campaign'],
        version: 'v3'
      },
      '2': {
        id: '2',
        name: 'product_demo_rough_cut.mov',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: '/placeholder.svg',
        duration: '1:45',
        fileSize: '156 MB',
        format: 'MOV',
        resolution: '1080p (1920x1080)',
        uploadedBy: 'Sarah Kim',
        uploadedAt: new Date('2024-06-11'),
        lastModified: new Date('2024-06-11'),
        status: 'needs_review',
        comments: 3,
        views: 12,
        description: 'Rough cut of the product demonstration video. Needs review for pacing and transitions.',
        tags: ['demo', 'rough', 'product'],
        version: 'v1'
      },
      '3': {
        id: '3',
        name: 'campaign_hero_image.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&h=800&fit=crop',
        fileSize: '2.1 MB',
        format: 'JPEG',
        resolution: '1920x1080',
        uploadedBy: 'Mike Johnson',
        uploadedAt: new Date('2024-06-10'),
        lastModified: new Date('2024-06-10'),
        status: 'ready',
        comments: 5,
        views: 18,
        description: 'Hero image for the main campaign landing page.',
        tags: ['hero', 'campaign', 'landing'],
        version: 'v2'
      }
    };

    const foundAsset = mockAssets[assetId];
    if (foundAsset) {
      setAsset(foundAsset);
      
      // Mock comments
      setComments([
        {
          id: '1',
          timestamp: 15.5,
          text: 'The transition here feels a bit abrupt. Can we smooth it out?',
          author: 'Sarah Kim',
          createdAt: new Date('2024-06-12T10:30:00'),
        },
        {
          id: '2',
          timestamp: 45.2,
          text: 'Love the color grading in this section!',
          author: 'Mike Johnson',
          createdAt: new Date('2024-06-12T11:15:00'),
        },
        {
          id: '3',
          timestamp: -1,
          text: 'Overall looking great! Just a few minor tweaks needed.',
          author: 'Alex Chen',
          createdAt: new Date('2024-06-12T14:20:00'),
        }
      ]);
    }
  }, [assetId]);

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-600';
      case 'ready': return 'bg-blue-600';
      case 'needs_review': return 'bg-orange-600';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
    }
  };

  const getFileIcon = (type: Asset['type']) => {
    switch (type) {
      case 'video': return <FileVideo className="h-5 w-5" />;
      case 'image': return <FileImage className="h-5 w-5" />;
      case 'audio': return <FileAudio className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const handleAddComment = (text: string, attachments?: Array<{ url: string; type: string; name: string }>, isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: attachTime ? currentTime : -1,
      text,
      author: "Current User",
      createdAt: new Date(),
      attachments,
      isInternal: isInternal || false,
      hasDrawing: hasDrawing || false,
    };
    
    setComments([...comments, newComment]);
  };

  const handleReplyComment = (parentId: string, text: string, attachments?: Array<{ url: string; type: string; name: string }>, isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: attachTime ? currentTime : -1,
      text,
      author: "Current User",
      createdAt: new Date(),
      parentId,
      attachments,
      isInternal: isInternal || false,
      hasDrawing: hasDrawing || false,
    };
    
    setComments([...comments, newComment]);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId && comment.parentId !== commentId));
  };

  const handleCommentClick = (timestamp: number) => {
    if (timestamp >= 0 && asset?.type === 'video') {
      setCurrentTime(timestamp);
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video) {
        video.currentTime = timestamp;
      }
    }
  };

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
  };

  const renderMediaViewer = () => {
    if (!asset) return null;

    switch (asset.type) {
      case 'video':
        return (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              src={asset.url}
              className="w-full aspect-video"
              controls
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={asset.url}
              alt={asset.name}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3">
              <FileAudio className="h-12 w-12 text-green-400" />
              <div>
                <h3 className="text-xl font-medium text-white">{asset.name}</h3>
                <p className="text-gray-400">{asset.format} • {asset.fileSize}</p>
              </div>
            </div>
            <audio
              src={asset.url}
              controls
              className="w-full max-w-md"
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
            />
          </div>
        );
      
      case 'document':
        return (
          <div className="bg-white rounded-lg overflow-hidden" style={{ height: '60vh' }}>
            <iframe
              src={asset.url}
              className="w-full h-full"
              title={asset.name}
            />
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-6">
            <File className="h-16 w-16 text-gray-400" />
            <div className="text-center">
              <h3 className="text-xl font-medium text-white mb-2">{asset.name}</h3>
              <p className="text-gray-400 mb-4">{asset.format} • {asset.fileSize}</p>
              <Button onClick={() => window.open(asset.url, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        );
    }
  };

  if (!asset) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Asset not found</h2>
          <p className="text-gray-400 mb-4">The requested asset could not be loaded.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${showComments ? 'mr-96' : ''}`}>
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                {getFileIcon(asset.type)}
                <div>
                  <h1 className="text-2xl font-bold text-white">{asset.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{asset.format}</span>
                    <span>•</span>
                    <span>{asset.fileSize}</span>
                    {asset.resolution && (
                      <>
                        <span>•</span>
                        <span>{asset.resolution}</span>
                      </>
                    )}
                    {asset.duration && (
                      <>
                        <span>•</span>
                        <span>{asset.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={`${getStatusColor(asset.status)} text-white`}>
                {asset.status.replace('_', ' ')}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({comments.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Media Viewer */}
        <div className="flex-1 p-6">
          {renderMediaViewer()}
        </div>

        {/* Asset Details */}
        <div className="border-t border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-white mb-3">Description</h3>
              <p className="text-gray-300 mb-4">
                {asset.description || 'No description provided.'}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-gray-600 text-gray-400"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400">Uploaded by</p>
                    <p className="text-white">{asset.uploadedBy}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-white">{asset.uploadedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400">Modified</p>
                    <p className="text-white">{asset.lastModified.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400">Views</p>
                    <p className="text-white">{asset.views}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700">
          <CommentPanel
            comments={comments}
            currentTime={currentTime}
            onCommentClick={handleCommentClick}
            onDeleteComment={handleDeleteComment}
            onReplyComment={handleReplyComment}
            onAddComment={handleAddComment}
            onStartDrawing={handleStartDrawing}
            isDrawingMode={isDrawingMode}
          />
        </div>
      )}
    </div>
  );
};
