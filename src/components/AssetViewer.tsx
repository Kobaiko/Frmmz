
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DrawingCanvas } from "./DrawingCanvas";
import { CommentPanel } from "./CommentPanel";
import { supabase } from "@/integrations/supabase/client";
import type { Comment } from "@/pages/Index";
import { VideoTimeline } from "./VideoTimeline";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  FileVideo,
  Play,
  Pause,
  Volume2,
  VolumeX
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showComments, setShowComments] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [annotations, setAnnotations] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'timecode' | 'frames' | 'standard'>('timecode');
  const [userName, setUserName] = useState<string>('Kivaiko');
  const [loading, setLoading] = useState(true);

  // Video player ref
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const previewVideoRef = React.useRef<HTMLVideoElement>(null);

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

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      console.log('Video metadata loaded, duration:', video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Set video properties
    video.volume = volume;
    video.playbackRate = playbackSpeed;
    video.loop = isLooping;
    video.muted = false;

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [asset?.id, volume, playbackSpeed, isLooping]);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('❌ Play failed:', error);
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
      videoRef.current.muted = volumeValue === 0;
    }
  };

  const handleVolumeToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.muted || volume === 0) {
      video.muted = false;
      const newVolume = volume === 0 ? 0.5 : volume;
      video.volume = newVolume;
      setVolume(newVolume);
    } else {
      video.muted = true;
      setVolume(0);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimelineSeek = (value: number[]) => {
    const time = (value[0] / 100) * duration;
    handleSeek(time);
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

        {/* Video Container - Takes remaining space */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {asset.file_type === 'video' ? (
            <>
              <video
                ref={videoRef}
                key={asset.id}
                src={asset.file_url}
                className="w-full h-full object-contain"
                style={{ backgroundColor: '#000000' }}
                playsInline
                preload="metadata"
                controls={false}
                autoPlay={false}
                crossOrigin="anonymous"
              />

              <video
                ref={previewVideoRef}
                key={`${asset.id}-preview`}
                src={asset.file_url}
                muted
                playsInline
                preload="metadata"
                className="hidden"
                crossOrigin="anonymous"
              />
              
              {/* Drawing canvas overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <DrawingCanvas
                  currentTime={currentTime}
                  videoRef={videoRef}
                  isDrawingMode={isDrawingMode}
                  annotations={annotations}
                />
              </div>
            </>
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

        {/* Video Controls - Fixed at bottom */}
        {asset.file_type === 'video' && (
          <div className="bg-gray-900 border-t border-gray-700 p-4 flex-shrink-0">
            {/* Timeline */}
            <div className="mb-4">
              <VideoTimeline
                currentTime={currentTime}
                duration={duration}
                comments={comments}
                onTimeClick={handleSeek}
                previewVideoRef={previewVideoRef}
                timeFormat={timeFormat}
                assetId={asset.id}
              />
            </div>
            
            {/* Video Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-gray-700"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVolumeToggle}
                    className="text-white hover:bg-gray-700"
                  >
                    {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                    className="w-20"
                    max={100}
                    step={1}
                  />
                </div>
                
                {/* Time Display */}
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              {/* Timeline Scrubber */}
              <div className="flex-1 mx-6">
                <Slider
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleTimelineSeek}
                  className="w-full"
                  max={100}
                  step={0.1}
                />
              </div>
              
              {/* Speed Control */}
              <div className="text-white text-sm">
                {playbackSpeed}x
              </div>
            </div>
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
