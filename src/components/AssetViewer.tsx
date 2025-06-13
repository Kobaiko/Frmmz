
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoControls } from "./VideoControls";
import { DrawingCanvas } from "./DrawingCanvas";
import { CommentInput } from "./CommentInput";
import { CommentPanel } from "./CommentPanel";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { useVideoKeyboardShortcuts } from "@/hooks/useVideoKeyboardShortcuts";
import type { Comment } from "@/pages/Index";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  FileVideo
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
  const [showComments, setShowComments] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [annotations, setAnnotations] = useState(true);
  const [guides, setGuides] = useState({
    enabled: false,
    ratio: '16:9',
    mask: false
  });
  const [zoom, setZoom] = useState("Fit");
  const [encodeComments, setEncodeComments] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

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

  const videoPlayer = useVideoPlayer({
    src: asset?.url || '',
    currentTime,
    onTimeUpdate: setCurrentTime,
    onDurationChange: () => {}
  });

  useVideoKeyboardShortcuts({
    videoRef: videoPlayer.videoRef,
    volume: videoPlayer.volume,
    isPlaying: videoPlayer.isPlaying,
    setVolume: (vol) => videoPlayer.handleVolumeChange([vol]),
    onZoomChange: setZoom
  });

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-600';
      case 'ready': return 'bg-blue-600';
      case 'needs_review': return 'bg-orange-600';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
    }
  };

  const handleAddComment = (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: attachTime ? currentTime : -1,
      text,
      author: "Current User",
      createdAt: new Date(),
    };
    
    setComments([...comments, newComment]);
    setShowCommentInput(false);
  };

  const handleReplyComment = (parentId: string, text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: attachTime ? currentTime : -1,
      text,
      author: "Current User",
      createdAt: new Date(),
      parentId
    };
    
    setComments([...comments, newComment]);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleSeekToComment = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

        {/* Video Player Container */}
        <div className="flex-1 relative bg-black">
          {/* Video Element */}
          <video
            ref={videoPlayer.videoRef}
            src={asset.url}
            className="w-full h-full object-contain"
            onClick={() => setShowCommentInput(true)}
          />
          
          {/* Drawing Canvas Overlay */}
          <DrawingCanvas
            currentTime={currentTime}
            videoRef={videoPlayer.videoRef}
            isDrawingMode={isDrawingMode}
            annotations={annotations}
          />
        </div>

        {/* Video Controls */}
        <div className="bg-gray-900 border-t border-gray-700">
          <VideoControls
            isPlaying={videoPlayer.isPlaying}
            onTogglePlayPause={videoPlayer.togglePlayPause}
            isLooping={videoPlayer.isLooping}
            onToggleLoop={videoPlayer.toggleLoop}
            playbackSpeed={videoPlayer.playbackSpeed}
            onSpeedChange={videoPlayer.handleSpeedChange}
            volume={videoPlayer.volume}
            onVolumeToggle={videoPlayer.handleVolumeToggle}
            onVolumeChange={videoPlayer.handleVolumeChange}
            currentTime={currentTime}
            duration={videoPlayer.duration}
            timeFormat={videoPlayer.timeFormat}
            onTimeFormatChange={videoPlayer.setTimeFormat}
            quality={videoPlayer.quality}
            availableQualities={videoPlayer.availableQualities}
            onQualityChange={videoPlayer.handleQualityChange}
            guides={guides}
            onGuidesToggle={() => setGuides(prev => ({ ...prev, enabled: !prev.enabled }))}
            onGuidesRatioChange={(ratio) => setGuides(prev => ({ ...prev, ratio }))}
            onGuidesMaskToggle={() => setGuides(prev => ({ ...prev, mask: !prev.mask }))}
            zoom={zoom}
            onZoomChange={setZoom}
            encodeComments={encodeComments}
            setEncodeComments={setEncodeComments}
            annotations={annotations}
            setAnnotations={setAnnotations}
            onSetFrameAsThumb={() => console.log('Set frame as thumbnail')}
            onDownloadStill={() => console.log('Download still')}
            onToggleFullscreen={() => {
              if (videoPlayer.videoRef.current) {
                videoPlayer.videoRef.current.requestFullscreen();
              }
            }}
            formatTime={formatTime}
          />
        </div>

        {/* Comment Input - Shows at bottom when commenting */}
        {showCommentInput && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <CommentInput
              currentTime={currentTime}
              onAddComment={handleAddComment}
              onCancel={() => setShowCommentInput(false)}
              onStartDrawing={handleStartDrawing}
              isDrawingMode={isDrawingMode}
            />
          </div>
        )}
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="fixed right-0 top-0 bottom-0 w-80">
          <CommentPanel
            comments={comments}
            currentTime={currentTime}
            onCommentClick={handleSeekToComment}
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
