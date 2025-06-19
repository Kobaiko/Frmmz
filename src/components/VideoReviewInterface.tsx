import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Settings, Play, Pause, Volume2, VolumeX, Maximize, MoreHorizontal } from "lucide-react";
import { VideoTimeline } from "./VideoTimeline";
import { CommentPanel } from "./CommentPanel";
import { CommentInput } from "./CommentInput";
import { DrawingCanvas } from "./DrawingCanvas";
import { VideoSettingsMenu } from "./VideoSettingsMenu";

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor?: string;
  createdAt: Date;
  resolved?: boolean;
  replies?: VideoComment[];
  attachments?: any[];
  hasDrawing?: boolean;
  hasTimestamp?: boolean;
  parentId?: string;
}

interface Asset {
  id: string;
  name: string;
  url: string;
  duration: string;
  size: string;
  resolution: string;
}

interface VideoReviewInterfaceProps {
  asset: Asset;
  comments: VideoComment[];
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
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'timecode' | 'frames' | 'seconds'>('timecode');
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const drawingCanvasRef = useRef<any>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoRef]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);

  const handleAddComment = (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    const timestamp = attachTime ? currentTime : -1;
    onAddComment(timestamp, text, attachments, isInternal, attachTime, hasDrawing);
    setShowCommentInput(false);
  };

  const handleTimelineCommentClick = (timestamp: number, commentId: string) => {
    // Jump to the timestamp
    onCommentClick(timestamp);
    
    // Highlight the comment in the feed
    setHighlightedCommentId(commentId);
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedCommentId(null);
    }, 3000);
  };

  const toggleCommentInput = () => {
    setShowCommentInput(!showCommentInput);
  };

  const handleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleTimeFormatChange = (format: 'timecode' | 'frames' | 'seconds') => {
    setTimeFormat(format);
  };

  return (
    <div className="h-screen w-screen bg-black flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-white font-medium">{asset.name}</h1>
              <p className="text-gray-400 text-sm">
                {asset.duration} • {asset.size} • {asset.resolution}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              {showSettings && (
                <VideoSettingsMenu 
                  onClose={() => setShowSettings(false)}
                  timeFormat={timeFormat}
                  onTimeFormatChange={setTimeFormat}
                />
              )}
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-black" onMouseMove={onMouseMove}>
          {/* Video Element */}
          <video
            ref={videoRef}
            src={asset.url}
            className="w-full h-full object-contain"
            onClick={onTogglePlayPause}
          />

          {/* Drawing Canvas Overlay */}
          <DrawingCanvas
            ref={drawingCanvasRef}
            isActive={isDrawingMode}
            videoRef={videoRef}
            currentTime={currentTime}
          />

          {/* Video Controls Overlay */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="space-y-4">
                {/* Timeline */}
                <VideoTimeline
                  currentTime={currentTime}
                  duration={duration}
                  comments={comments}
                  onTimeClick={onCommentClick}
                  onCommentClick={handleTimelineCommentClick}
                  previewVideoRef={previewVideoRef}
                  timeFormat={timeFormat}
                  assetId={asset.id}
                />

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onTogglePlayPause}
                      className="text-white hover:bg-white/20 w-10 h-10 p-0"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleMute}
                      className="text-white hover:bg-white/20 w-10 h-10 p-0"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 w-10 h-10 p-0"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comment Input Overlay */}
          {showCommentInput && (
            <div className="absolute bottom-20 left-6 right-6 z-50">
              <CommentInput
                onAddComment={handleAddComment}
                onCancel={() => setShowCommentInput(false)}
                currentTime={currentTime}
                onStartDrawing={() => setIsDrawingMode(true)}
                isDrawingMode={isDrawingMode}
                onPauseVideo={() => {
                  if (videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Comments */}
      <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Comments</h2>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              {comments.length}
            </Badge>
          </div>
          <Button
            onClick={() => setShowCommentInput(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Comment
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <CommentPanel
            comments={comments}
            onDeleteComment={onDeleteComment}
            onReplyComment={(commentId, reply) => {
              // Handle reply logic here
              console.log('Reply to comment:', commentId, reply);
            }}
            onAddComment={handleAddComment}
            onStartDrawing={() => setIsDrawingMode(true)}
            isDrawingMode={isDrawingMode}
            currentTime={currentTime}
            onCommentClick={onCommentClick}
            highlightedCommentId={highlightedCommentId}
          />
        </div>
      </div>

      {/* Hidden video element for timeline preview */}
      <video
        ref={previewVideoRef}
        src={asset.url}
        className="hidden"
        muted
        preload="metadata"
      />
    </div>
  );
};
