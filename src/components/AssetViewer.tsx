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
  FileVideo,
  AlertCircle,
  RefreshCw,
  ExternalLink
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
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoDebugInfo, setVideoDebugInfo] = useState<any>({});
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [corsError, setCorsError] = useState(false);
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
        
        console.log('✅ Asset fetched successfully:', data);
        console.log('🔗 Video URL:', data.file_url);
        
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
        console.error('❌ Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId]);

  // Enhanced video monitoring with timeout and CORS detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !asset?.file_url) return;

    console.log('🎬 Setting up enhanced video monitoring for:', asset.file_url);
    setLoadingAttempts(prev => prev + 1);
    setCorsError(false);

    // Set timeout for loading
    const loadingTimeout = setTimeout(() => {
      if (!videoLoaded) {
        console.error('⏰ Video loading timeout after 10 seconds');
        setVideoError('Video loading timeout - the file may be corrupted or too large');
      }
    }, 10000);

    const updateDebugInfo = () => {
      const debugInfo = {
        src: video.src,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        ended: video.ended,
        networkState: video.networkState,
        error: video.error ? {
          code: video.error.code,
          message: video.error.message
        } : null,
        crossOrigin: video.crossOrigin,
        loadingAttempts
      };
      
      console.log('📊 Enhanced Video Debug Info:', debugInfo);
      setVideoDebugInfo(debugInfo);
      
      // Enhanced video ready detection
      const hasMetadata = video.readyState >= 1;
      const hasDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      const isReady = hasMetadata && hasDimensions && !video.error;
      
      console.log('🔍 Video readiness check:', {
        hasMetadata,
        hasDimensions,
        hasError: !!video.error,
        readyState: video.readyState,
        isReady
      });
      
      if (isReady && !videoLoaded) {
        console.log('✅ Video is now ready for playback!');
        setVideoLoaded(true);
        setVideoError(null);
        clearTimeout(loadingTimeout);
      }
    };

    const handleLoadStart = () => {
      console.log('🚀 Video load started');
      setVideoLoaded(false);
      setVideoError(null);
      updateDebugInfo();
    };

    const handleLoadedMetadata = () => {
      console.log('📊 Video metadata loaded successfully');
      updateDebugInfo();
    };

    const handleLoadedData = () => {
      console.log('📦 Video data loaded');
      updateDebugInfo();
    };

    const handleCanPlay = () => {
      console.log('▶️ Video can play');
      updateDebugInfo();
    };

    const handleCanPlayThrough = () => {
      console.log('🎯 Video can play through - setting as loaded');
      updateDebugInfo();
      if (!videoLoaded) {
        setVideoLoaded(true);
        setVideoError(null);
        clearTimeout(loadingTimeout);
      }
    };

    const handleError = (e: Event) => {
      console.error('❌ Video error event:', e);
      const target = e.target as HTMLVideoElement;
      
      let errorMsg = 'Unknown video error';
      let isCorsError = false;
      
      if (target && target.error) {
        const errorCode = target.error.code;
        const errorMessage = target.error.message;
        
        console.error('❌ Video error details:', {
          code: errorCode,
          message: errorMessage,
          networkState: target.networkState,
          readyState: target.readyState,
          src: target.src
        });
        
        switch (errorCode) {
          case 1: // MEDIA_ERR_ABORTED
            errorMsg = 'Video loading was aborted';
            break;
          case 2: // MEDIA_ERR_NETWORK
            errorMsg = 'Network error while loading video';
            isCorsError = true;
            break;
          case 3: // MEDIA_ERR_DECODE
            errorMsg = 'Video format not supported or corrupted';
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMsg = 'Video format not supported by browser';
            break;
          default:
            errorMsg = `Video error ${errorCode}: ${errorMessage}`;
        }
        
        if (errorMessage.toLowerCase().includes('cors') || 
            errorMessage.toLowerCase().includes('cross-origin') ||
            isCorsError) {
          setCorsError(true);
        }
      }
      
      setVideoError(errorMsg);
      setVideoLoaded(false);
      clearTimeout(loadingTimeout);
      updateDebugInfo();
    };

    const handleStalled = () => {
      console.warn('⏸️ Video stalled - network issue?');
      updateDebugInfo();
    };

    const handleWaiting = () => {
      console.warn('⏳ Video waiting for data');
      updateDebugInfo();
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          console.log(`📊 Video buffered: ${bufferedPercent.toFixed(1)}%`);
        }
      }
    };

    // Add all event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('progress', handleProgress);

    // Enhanced CORS setup
    try {
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.src = asset.file_url;
      console.log('🔗 Video source set with enhanced CORS configuration');
    } catch (err) {
      console.error('❌ Error setting video source:', err);
      setVideoError('Failed to set video source');
    }

    // Initial debug info
    updateDebugInfo();

    return () => {
      clearTimeout(loadingTimeout);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('progress', handleProgress);
    };
  }, [asset?.file_url, loadingAttempts]);

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

  const handleRetryVideo = () => {
    console.log('🔄 Retrying video load...');
    setVideoError(null);
    setVideoLoaded(false);
    setLoadingAttempts(0);
    setCorsError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleDirectDownload = () => {
    if (asset?.file_url) {
      window.open(asset.file_url, '_blank');
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
                onClick={handleDirectDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
          {asset.file_type === 'video' ? (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Video element */}
              <video
                ref={videoRef}
                src={asset.file_url}
                className="max-w-full max-h-full object-contain"
                playsInline
                preload="metadata"
                controls={false}
                crossOrigin="anonymous"
                style={{ 
                  display: videoLoaded ? 'block' : 'none',
                  backgroundColor: 'transparent'
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
              {videoLoaded && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <DrawingCanvas
                    currentTime={currentTime}
                    videoRef={videoRef}
                    isDrawingMode={isDrawingMode}
                    annotations={annotations}
                  />
                </div>
              )}

              {/* Enhanced Loading overlay with detailed debugging */}
              {!videoLoaded && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
                  <div className="text-center max-w-lg">
                    <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white mb-2">Loading video...</p>
                    <p className="text-gray-400 text-sm mb-6">{asset.name}</p>
                    
                    {/* Enhanced debug information */}
                    <div className="bg-gray-800 rounded p-4 text-xs text-left space-y-2">
                      <p className="text-green-400">✅ Video URL: {asset.file_url.split('/').pop()}</p>
                      <p className="text-blue-400">📊 Ready State: {videoDebugInfo.readyState || 0}/4</p>
                      <p className="text-purple-400">📐 Dimensions: {videoDebugInfo.videoWidth || 0}x{videoDebugInfo.videoHeight || 0}</p>
                      <p className="text-yellow-400">⏱️ Duration: {videoDebugInfo.duration || 'Unknown'}</p>
                      <p className="text-cyan-400">🌐 Network State: {videoDebugInfo.networkState || 0}</p>
                      <p className="text-pink-400">🔄 Attempts: {loadingAttempts}</p>
                      <p className="text-orange-400">🔒 CORS: {videoDebugInfo.crossOrigin || 'anonymous'}</p>
                    </div>
                    
                    {loadingAttempts > 2 && (
                      <div className="mt-4">
                        <Button 
                          onClick={handleRetryVideo}
                          variant="outline"
                          className="border-gray-600 text-gray-300 mr-2"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry Loading
                        </Button>
                        <Button 
                          onClick={handleDirectDownload}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Directly
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Error overlay */}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
                  <div className="text-center max-w-lg">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-white mb-2">Video failed to load</p>
                    <p className="text-gray-400 text-sm mb-4">{videoError}</p>
                    
                    {corsError && (
                      <div className="bg-yellow-900 border border-yellow-600 rounded p-3 mb-4 text-yellow-200">
                        <p className="text-sm">
                          <strong>CORS Error Detected:</strong> The video server may not allow cross-origin requests. 
                          Try opening the video directly or contact your administrator.
                        </p>
                      </div>
                    )}
                    
                    {/* Enhanced debug information */}
                    <div className="bg-gray-800 rounded p-4 text-xs text-left mb-4 space-y-1">
                      <p className="text-red-400">❌ Error: {videoError}</p>
                      <p className="text-gray-400">📁 File: {asset.name}</p>
                      <p className="text-gray-400">🔗 URL: {asset.file_url}</p>
                      <p className="text-gray-400">📏 Size: {Math.round(asset.file_size / 1024 / 1024)} MB</p>
                      <p className="text-gray-400">🔄 Attempts: {loadingAttempts}</p>
                      <p className="text-gray-400">🌐 CORS: {corsError ? 'Blocked' : 'Allowed'}</p>
                    </div>
                    
                    <div className="flex space-x-2 justify-center">
                      <Button 
                        onClick={handleRetryVideo}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                      <Button 
                        onClick={handleDirectDownload}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Directly
                      </Button>
                      <Button 
                        onClick={() => window.open(asset.file_url, '_blank')}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
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
                  onClick={handleDirectDownload}
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
        {asset.file_type === 'video' && videoLoaded && (
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
