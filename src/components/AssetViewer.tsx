
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdvancedVideoPlayer } from "./AdvancedVideoPlayer";
import { VideoReviewInterface } from "./VideoReviewInterface";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import type { Comment } from "@/pages/Index";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MoreHorizontal, 
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

interface AssetViewerProps {
  assetId: string;
  onBack: () => void;
}

export const AssetViewer = ({ assetId, onBack }: AssetViewerProps) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showComments, setShowComments] = useState(true);

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
      
      // Mock comments using the correct Comment interface
      setComments([
        {
          id: '1',
          timestamp: 15.5,
          text: 'The transition here feels a bit abrupt. We should smooth it out?',
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

  const handleAddComment = (text: string, timestamp: number) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      text,
      author: "Current User",
      createdAt: new Date(),
    };
    
    setComments([...comments, newComment]);
  };

  const handleResolveComment = (commentId: string) => {
    // Mark comment as resolved (this could be added to Comment interface if needed)
    console.log('Resolving comment:', commentId);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleSeekToComment = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  const renderMediaViewer = () => {
    if (!asset) return null;

    switch (asset.type) {
      case 'video':
        return (
          <div className="relative">
            <AdvancedVideoPlayer
              src={asset.url}
              title={asset.name}
              duration={duration}
              comments={comments}
              onAddComment={handleAddComment}
              onSeekToComment={handleSeekToComment}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              onTimeClick={handleSeekToComment}
              isDrawingMode={false}
              onDrawingModeChange={() => {}}
              annotations={true}
              setAnnotations={() => {}}
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '60vh' }}>
            <img
              src={asset.url}
              alt={asset.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="bg-gray-800 rounded-lg p-12 flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-4">
              <FileAudio className="h-16 w-16 text-green-400" />
              <div>
                <h3 className="text-2xl font-medium text-white">{asset.name}</h3>
                <p className="text-gray-400 text-lg">{asset.format} • {asset.fileSize}</p>
              </div>
            </div>
            <audio
              src={asset.url}
              controls
              className="w-full max-w-lg"
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
            />
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-800 rounded-lg p-12 flex flex-col items-center space-y-6">
            <File className="h-20 w-20 text-gray-400" />
            <div className="text-center">
              <h3 className="text-2xl font-medium text-white mb-3">{asset.name}</h3>
              <p className="text-gray-400 text-lg mb-6">{asset.format} • {asset.fileSize}</p>
              <Button 
                onClick={() => window.open(asset.url, '_blank')}
                className="bg-pink-600 hover:bg-pink-700"
              >
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
          <Button onClick={onBack} variant="outline" className="border-gray-600 text-gray-300">
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
      <div className={`flex-1 flex flex-col ${showComments ? 'mr-80' : ''}`}>
        {/* Header */}
        <div className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
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
                <div className="text-pink-500">
                  {getFileIcon(asset.type)}
                </div>
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
              <Badge className={`${getStatusColor(asset.status)} text-white border-0`}>
                {asset.status.replace('_', ' ')}
              </Badge>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Description */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {asset.description || 'No description provided.'}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-gray-600 text-gray-400 hover:border-pink-500 hover:text-pink-400 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Uploaded by</p>
                    <p className="text-white font-medium">{asset.uploadedBy}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Created</p>
                    <p className="text-white">{asset.uploadedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Modified</p>
                    <p className="text-white">{asset.lastModified.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Views</p>
                    <p className="text-white">{asset.views}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Panel for Video */}
      {showComments && asset.type === 'video' && (
        <div className="fixed right-0 top-0 bottom-0 w-80">
          <VideoReviewInterface
            comments={comments}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
            onDeleteComment={handleDeleteComment}
            currentTime={currentTime}
          />
        </div>
      )}
    </div>
  );
};
