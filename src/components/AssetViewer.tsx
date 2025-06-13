
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VideoPlayer } from "./VideoPlayer";
import { VideoReviewInterface } from "./VideoReviewInterface";
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

// Helper function to convert Comment to VideoComment
const convertToVideoComment = (comment: Comment) => ({
  id: comment.id,
  timestamp: comment.timestamp,
  content: comment.text,
  author: comment.author,
  authorColor: '#FF0080',
  createdAt: comment.createdAt,
  resolved: false,
  replies: []
});

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
      }
    };

    const foundAsset = mockAssets[assetId];
    if (foundAsset) {
      setAsset(foundAsset);
      
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
    console.log('Resolving comment:', commentId);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleSeekToComment = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  // Convert Comment[] to VideoComment[] for VideoReviewInterface
  const videoComments = comments.map(convertToVideoComment);

  // Fix the onAddComment function signature for VideoReviewInterface
  const handleVideoReviewAddComment = (timestamp: number, content: string) => {
    handleAddComment(content, timestamp);
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
        {/* Clean Header */}
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
                  <FileVideo className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">{asset.name}</h1>
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
            </div>
          </div>
        </div>

        {/* Clean Video Player */}
        <div className="flex-1">
          <VideoPlayer
            src={asset.url}
            comments={comments}
            onTimeClick={handleSeekToComment}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            isDrawingMode={false}
            onDrawingModeChange={() => {}}
            annotations={true}
            setAnnotations={() => {}}
          />
        </div>
      </div>

      {/* Clean Comments Panel */}
      {showComments && asset.type === 'video' && (
        <div className="fixed right-0 top-0 bottom-0 w-80">
          <VideoReviewInterface
            comments={videoComments}
            onAddComment={handleVideoReviewAddComment}
            onResolveComment={handleResolveComment}
            onDeleteComment={handleDeleteComment}
            currentTime={currentTime}
          />
        </div>
      )}
    </div>
  );
};
