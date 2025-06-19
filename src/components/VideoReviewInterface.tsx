
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Settings, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { VideoCollaborationPanel } from "./VideoCollaborationPanel";
import { DrawingCanvas } from "./DrawingCanvas";

interface VideoReviewInterfaceProps {
  asset: any;
  comments: any[];
  onAddComment: (timestamp: number, content: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onDeleteComment: (commentId: string) => void;
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onBack: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isMuted: boolean;
  showControls: boolean;
  onMouseMove: () => void;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

export const VideoReviewInterface = ({
  asset,
  comments,
  onAddComment,
  onDeleteComment,
  currentTime,
  onCommentClick,
  onBack,
  videoRef,
  isPlaying,
  duration,
  volume,
  isMuted,
  showControls,
  onMouseMove,
  onTogglePlayPause,
  onToggleMute,
  onSeek,
  formatTime,
  progress
}: VideoReviewInterfaceProps) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [hasDrawingOnCurrentFrame, setHasDrawingOnCurrentFrame] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartDrawing = useCallback(() => {
    setIsDrawingMode(true);
    // Pause video when entering drawing mode
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying, videoRef]);

  const handleStopDrawing = useCallback(() => {
    setIsDrawingMode(false);
  }, []);

  const handleDrawingStateChange = useCallback((hasDrawing: boolean) => {
    console.log('Drawing state changed:', hasDrawing);
    setHasDrawingOnCurrentFrame(hasDrawing);
  }, []);

  const handleAddComment = useCallback((content: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    // Use the actual drawing state for the current frame
    const actualHasDrawing = hasDrawing || hasDrawingOnCurrentFrame;
    console.log('Adding comment with drawing state:', actualHasDrawing);
    onAddComment(currentTime, content, attachments, isInternal, attachTime, actualHasDrawing);
  }, [onAddComment, currentTime, hasDrawingOnCurrentFrame]);

  const handlePauseVideo = useCallback(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
    }
  }, [videoRef, isPlaying]);

  return (
    <div className="flex h-screen w-screen bg-black text-white">
      {/* Video Container */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="ghost" className="text-white hover:bg-gray-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{asset.filename}</h1>
              <p className="text-sm text-gray-400">{asset.metadata?.resolution || 'N/A'} • {formatTime(duration)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" className="text-white hover:bg-gray-700">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-gray-700">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-gray-700">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Debug indicator for drawing state */}
        <div className="bg-red-600 text-white p-2 text-center font-bold">
          DEBUG: Has drawing on current frame: {hasDrawingOnCurrentFrame.toString()}
        </div>

        {/* Video Player Container */}
        <div 
          ref={containerRef}
          className="flex-1 relative bg-black flex items-center justify-center"
          onMouseMove={onMouseMove}
        >
          <video
            ref={videoRef}
            src={asset.file_url}
            className="max-w-full max-h-full object-contain"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
          
          {/* Drawing Canvas */}
          <DrawingCanvas
            currentTime={currentTime}
            videoRef={videoRef}
            isDrawingMode={isDrawingMode}
            annotations={true}
            onDrawingStateChange={handleDrawingStateChange}
          />

          {/* Video Controls Overlay */}
          {showControls && (
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={onTogglePlayPause}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <div className="flex-1">
                  <div
                    className="h-2 bg-gray-600 rounded cursor-pointer"
                    onClick={onSeek}
                  >
                    <div
                      className="h-full bg-pink-500 rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <Button
                    onClick={onToggleMute}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Panel */}
      <div className="w-96 border-l border-gray-700 bg-gray-900 flex flex-col">
        <VideoCollaborationPanel
          assetId={asset.id}
          comments={comments}
          onAddComment={handleAddComment}
          onDeleteComment={onDeleteComment}
          currentTime={currentTime}
          onCommentClick={onCommentClick}
          onStartDrawing={handleStartDrawing}
          onStopDrawing={handleStopDrawing}
          isDrawingMode={isDrawingMode}
          onPauseVideo={handlePauseVideo}
        />
      </div>
    </div>
  );
};
