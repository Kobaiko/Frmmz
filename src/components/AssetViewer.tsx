
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Settings } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { AdvancedVideoPlayer } from "./AdvancedVideoPlayer";
import { SimpleVideoPlayer } from "./SimpleVideoPlayer";
import { CommentPanel } from "./CommentPanel";

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
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [annotations, setAnnotations] = useState(true); // Default to true
  const playerControlsRef = useRef<{ seek: (time: number) => void; togglePlayPause: () => void; } | null>(null);

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

  const handleCommentClick = (timestamp: number) => {
    if (playerControlsRef.current) {
      playerControlsRef.current.seek(timestamp);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
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
      <div className="h-screen bg-black text-white flex items-center justify-center">
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
    <div className="h-screen bg-black text-white flex">
      {/* Main Video Player Area - Takes full width minus sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Minimal Top Bar */}
        <div className="h-12 bg-black/90 border-b border-gray-800/30 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-400 hover:text-white h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-white font-medium">{asset.name}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 px-2 text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 px-2 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 px-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Full-Screen Video Player */}
        <div className="flex-1 bg-black relative">
          {asset.file_type === 'video' ? (
            <AdvancedVideoPlayer
              src={asset.file_url}
              comments={comments}
              isDrawingMode={isDrawingMode}
              onDrawingModeChange={setIsDrawingMode}
              annotations={annotations}
              setAnnotations={setAnnotations}
              assetId={asset.id}
              onReady={(controls) => playerControlsRef.current = controls}
              onTimeUpdate={setCurrentTime}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Preview not available for {asset.file_type} files</p>
                <Button 
                  onClick={() => window.open(asset.file_url, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Open File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Narrow Comments Sidebar - Frame.io Style */}
      {asset.file_type === 'video' && (
        <div className="w-72 bg-gray-900 border-l border-gray-800/50 flex flex-col">
          <CommentPanel
            comments={comments.map(comment => ({
              id: comment.id,
              text: comment.content,
              author: comment.author,
              timestamp: comment.timestamp,
              createdAt: comment.createdAt,
              isInternal: false,
              parentId: undefined
            }))}
            currentTime={currentTime}
            onCommentClick={handleCommentClick}
            onDeleteComment={(commentId) => {
              setComments(prev => prev.filter(comment => comment.id !== commentId));
            }}
            onReplyComment={(parentId, text) => {
              console.log('Reply to:', parentId, text);
            }}
            onAddComment={(text) => handleAddComment(currentTime, text)}
            onStartDrawing={() => setIsDrawingMode(!isDrawingMode)}
            isDrawingMode={isDrawingMode}
          />
        </div>
      )}
    </div>
  );
};
