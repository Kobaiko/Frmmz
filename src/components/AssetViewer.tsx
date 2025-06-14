import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DrawingCanvas } from "./DrawingCanvas";
import { CommentPanel } from "./CommentPanel";
import { EnhancedVideoTimeline } from "./EnhancedVideoTimeline";
import { VideoControls } from "./VideoControls";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { supabase } from "@/integrations/supabase/client";
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
  file_type: string;
  file_url: string;
  thumbnail_url?: string;
  duration?: string;
  file_size: number;
  resolution?: string;
  status: string;
  created_at: string;
  updated_at: string;
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
  const [userName, setUserName] = useState<string>('Kivaiko');
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [guides, setGuides] = useState({
    enabled: false,
    ratio: '16:9',
    mask: false
  });
  const [zoom, setZoom] = useState('fit');
  const [encodeComments, setEncodeComments] = useState(false);

  // Use the comprehensive video player hook
  const {
    videoRef,
    previewVideoRef,
    duration,
    isPlaying,
    volume,
    playbackSpeed,
    quality,
    availableQualities,
    maxQuality,
    isLooping,
    timeFormat,
    setTimeFormat,
    togglePlayPause,
    toggleLoop,
    handleSpeedChange,
    handleVolumeToggle,
    handleVolumeChange,
    handleQualityChange
  } = useVideoPlayer({
    src: asset?.file_url || '',
    currentTime,
    onTimeUpdate: setCurrentTime,
    onDurationChange: (dur) => console.log('Duration:', dur)
  });

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('id', assetId)
          .single();

        if (error) throw error;
        setAsset(data as Asset);
        
        // Fetch comments for this asset
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('asset_id', assetId)
          .order('created_at', { ascending: true });

        if (!commentsError && commentsData) {
          const formattedComments: Comment[] = commentsData.map(comment => ({
            id: comment.id,
            timestamp: comment.timestamp_seconds || -1,
            text: comment.content,
            author: 'Kivaiko',
            createdAt: new Date(comment.created_at),
            parentId: comment.parent_id || undefined
          }));
          setComments(formattedComments);
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-600';
      case 'ready': return 'bg-blue-600';
      case 'needs_review': return 'bg-orange-600';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const handleAddComment = async (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    if (!asset) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            asset_id: asset.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            content: text,
            timestamp_seconds: attachTime ? currentTime : null,
            is_internal: isInternal || false,
            has_drawing: hasDrawing || false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id: data.id,
        timestamp: data.timestamp_seconds || -1,
        text: data.content,
        author: userName,
        createdAt: new Date(data.created_at),
      };
      
      setComments([...comments, newComment]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReplyComment = async (parentId: string, text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    if (!asset) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            asset_id: asset.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            content: text,
            parent_id: parentId,
            timestamp_seconds: attachTime ? currentTime : null,
            is_internal: isInternal || false,
            has_drawing: hasDrawing || false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id: data.id,
        timestamp: data.timestamp_seconds || -1,
        text: data.content,
        author: userName,
        createdAt: new Date(data.created_at),
        parentId
      };
      
      setComments([...comments, newComment]);
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSeekToComment = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGuidesToggle = () => {
    setGuides(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleGuidesRatioChange = (ratio: string) => {
    setGuides(prev => ({ ...prev, ratio }));
  };

  const handleGuidesMaskToggle = () => {
    setGuides(prev => ({ ...prev, mask: !prev.mask }));
  };

  const handleSetFrameAsThumb = () => {
    console.log('Set frame as thumbnail at:', currentTime);
  };

  const handleDownloadStill = () => {
    console.log('Download still frame at:', currentTime);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileVideo className="h-5 w-5 text-white animate-pulse" />
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
    <div className="fixed inset-0 bg-black text-white flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b border-gray-800 px-6 py-4 bg-black flex-shrink-0">
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
                  <h1 className="text-sm font-medium text-white text-left">{asset.name}</h1>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{asset.file_type.toUpperCase()}</span>
                    <span>•</span>
                    <span>{Math.round(asset.file_size / 1024 / 1024)} MB</span>
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
                onClick={() => window.open(asset.file_url, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {asset.file_type === 'video' ? (
            <div className="w-full h-full max-w-full max-h-full relative">
              {/* Debug info overlay */}
              <div className="absolute top-4 left-4 z-20 bg-black/80 text-white p-2 rounded text-xs">
                <div>Video URL: {asset.file_url ? 'Valid' : 'Missing'}</div>
                <div>Ready State: {videoRef.current?.readyState || 0}/4</div>
                <div>Video Size: {videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}</div>
                <div>Element Size: {videoRef.current?.clientWidth || 0}x{videoRef.current?.clientHeight || 0}</div>
                <div>Error: {videoError ? 'Yes' : 'No'}</div>
              </div>

              {/* Main video element - FIXED: Proper CSS styling without !important */}
              <video
                ref={videoRef}
                src={asset.file_url}
                className="block w-full h-full"
                style={{ 
                  display: 'block',
                  visibility: 'visible',
                  opacity: 1,
                  position: 'relative',
                  zIndex: 1,
                  objectFit: 'contain',
                  backgroundColor: '#000000',
                  minWidth: '300px',
                  minHeight: '200px',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                playsInline
                preload="metadata"
                controls={false}
                autoPlay={false}
                muted={false}
                crossOrigin="anonymous"
                onLoadStart={() => {
                  console.log('🚀 Video load started');
                  setVideoError(false);
                }}
                onLoadedMetadata={() => {
                  console.log('✅ Video metadata loaded');
                  console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
                }}
                onCanPlay={() => {
                  console.log('▶️ Video can play');
                  setVideoError(false);
                }}
                onLoadedData={() => {
                  console.log('📊 Video data loaded');
                }}
                onError={(e) => {
                  console.error('❌ Video error:', e);
                  setVideoError(true);
                  const target = e.target as HTMLVideoElement;
                  if (target?.error) {
                    console.error('Video error details:', {
                      code: target.error.code,
                      message: target.error.message,
                      src: target.src,
                      currentSrc: target.currentSrc
                    });
                  }
                }}
              />

              {/* Hidden preview video for timeline */}
              <video
                ref={previewVideoRef}
                src={asset.file_url}
                muted
                playsInline
                preload="metadata"
                className="hidden"
                crossOrigin="anonymous"
              />
              
              {/* Drawing canvas overlay */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <DrawingCanvas
                  currentTime={currentTime}
                  videoRef={videoRef}
                  isDrawingMode={isDrawingMode}
                  annotations={annotations}
                />
              </div>

              {/* Loading/Error indicator */}
              {(videoError || !videoRef.current?.videoWidth || videoRef.current?.readyState < 2) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-30">
                  <div className="text-center">
                    {videoError ? (
                      <>
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileVideo className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-white mb-2">Video failed to load</p>
                        <p className="text-gray-400 text-sm">Check the video file and try again</p>
                        <Button 
                          onClick={() => {
                            setVideoError(false);
                            if (videoRef.current) {
                              videoRef.current.load();
                            }
                          }}
                          className="mt-4 bg-pink-600 hover:bg-pink-700"
                        >
                          Retry
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white">Loading video...</p>
                        <p className="text-gray-400 text-sm mt-2">Source: {asset.file_url.split('/').pop()}</p>
                        <p className="text-gray-300 text-xs mt-1">
                          Ready State: {videoRef.current?.readyState || 0}/4
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : asset.file_type === 'image' ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={asset.file_url}
                alt={asset.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <FileVideo className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                <Button
                  onClick={() => window.open(asset.file_url, '_blank')}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Video Controls - Fixed at bottom */}
        {asset.file_type === 'video' && (
          <div className="bg-gray-900 border-t border-gray-700 p-4 flex-shrink-0">
            {/* Enhanced Timeline */}
            <div className="mb-4">
              <EnhancedVideoTimeline
                currentTime={currentTime}
                duration={duration}
                comments={comments}
                onTimeClick={handleSeek}
                previewVideoRef={previewVideoRef}
                timeFormat={timeFormat}
                frameRate={30}
                onHover={(time) => {
                  if (time !== null && previewVideoRef.current) {
                    previewVideoRef.current.currentTime = time;
                  }
                }}
              />
            </div>
            
            {/* Comprehensive Video Controls */}
            <VideoControls
              isPlaying={isPlaying}
              onTogglePlayPause={togglePlayPause}
              isLooping={isLooping}
              onToggleLoop={toggleLoop}
              playbackSpeed={playbackSpeed}
              onSpeedChange={handleSpeedChange}
              volume={volume}
              onVolumeToggle={handleVolumeToggle}
              onVolumeChange={handleVolumeChange}
              currentTime={currentTime}
              duration={duration}
              timeFormat={timeFormat}
              onTimeFormatChange={setTimeFormat}
              quality={quality}
              availableQualities={availableQualities}
              onQualityChange={handleQualityChange}
              guides={guides}
              onGuidesToggle={handleGuidesToggle}
              onGuidesRatioChange={handleGuidesRatioChange}
              onGuidesMaskToggle={handleGuidesMaskToggle}
              zoom={zoom}
              onZoomChange={setZoom}
              encodeComments={encodeComments}
              setEncodeComments={setEncodeComments}
              annotations={annotations}
              setAnnotations={setAnnotations}
              onSetFrameAsThumb={handleSetFrameAsThumb}
              onDownloadStill={handleDownloadStill}
              onToggleFullscreen={handleToggleFullscreen}
              formatTime={formatTime}
            />
          </div>
        )}
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="w-80 border-l border-gray-700 bg-gray-900 flex-shrink-0">
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
