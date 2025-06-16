
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, MessageCircle } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { SimpleVideoPlayer } from "./SimpleVideoPlayer";
import { VideoReviewInterface } from "./VideoReviewInterface";
import { StorageDebugger } from "./StorageDebugger";

interface AssetViewerProps {
  assetId: string;
  onBack: () => void;
}

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor: string;
  createdAt: Date;
  resolved?: boolean;
  replies?: VideoComment[];
}

export const AssetViewer = ({ assetId, onBack }: AssetViewerProps) => {
  const { assets, loading } = useAssets();
  const [asset, setAsset] = useState<any>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [showComments, setShowComments] = useState(true);

  // Mock comments for demonstration
  useEffect(() => {
    const mockComments: VideoComment[] = [
      {
        id: "1",
        timestamp: 15.5,
        content: "Great opening shot! The lighting is perfect here.",
        author: "Sarah Chen",
        authorColor: "#FF6B6B",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: "2",
        timestamp: 32.2,
        content: "Can we adjust the audio levels here? The background music is a bit too loud.",
        author: "Mike Johnson",
        authorColor: "#4ECDC4",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: "3",
        timestamp: 45.8,
        content: "This transition looks smooth. Approved!",
        author: "Emma Wilson",
        authorColor: "#45B7D1",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        resolved: true
      }
    ];
    setComments(mockComments);
  }, []);

  useEffect(() => {
    if (assets && assets.length > 0) {
      const foundAsset = assets.find(a => a.id === assetId);
      setAsset(foundAsset);
      console.log('🎬 Asset found:', foundAsset);
    }
  }, [assets, assetId]);

  const handleAddComment = (timestamp: number, content: string) => {
    const newComment: VideoComment = {
      id: Date.now().toString(),
      timestamp,
      content,
      author: "Current User",
      authorColor: "#8B5CF6",
      createdAt: new Date(),
      resolved: false
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleResolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: !comment.resolved }
          : comment
      )
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading asset...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Asset not found</h2>
          <Button onClick={onBack} className="bg-pink-600 hover:bg-pink-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
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
            <div>
              <h1 className="text-xl font-bold">{asset.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span>{asset.file_type}</span>
                <span>•</span>
                <span>{Math.round(asset.file_size / 1024 / 1024)} MB</span>
                <span>•</span>
                <span>Uploaded {new Date(asset.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDebugger(!showDebugger)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
            >
              {showDebugger ? 'Hide' : 'Show'} Debug
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowComments(!showComments)}
              className={`text-sm ${showComments ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments ({comments.length})
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugger && (
        <div className="border-b border-gray-800">
          <StorageDebugger />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Video Player Area */}
        <div className={`flex-1 flex items-center justify-center p-6 ${showComments ? 'pr-3' : ''}`}>
          {asset.file_type === 'video' ? (
            <div className="w-full h-full max-w-5xl bg-gray-900 rounded-lg overflow-hidden">
              <SimpleVideoPlayer
                src={asset.file_url}
                onTimeUpdate={setCurrentTime}
                onError={(error) => console.error('❌ Video player error:', error)}
                onLoad={() => console.log('✅ Video loaded successfully')}
              />
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <p className="text-gray-400">Preview not available for {asset.file_type} files</p>
              <Button 
                onClick={() => window.open(asset.file_url, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Open File
              </Button>
            </div>
          )}
        </div>

        {/* Comments Panel */}
        {showComments && asset.file_type === 'video' && (
          <div className="w-96 border-l border-gray-700 bg-gray-900">
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
    </div>
  );
};
