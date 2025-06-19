import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Settings, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { VideoReviewInterface } from "./VideoReviewInterface";

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
  attachments?: any[];
  hasDrawing?: boolean;
  hasTimestamp?: boolean;
}

export const AssetViewer = ({ assetId, onBack }: AssetViewerProps) => {
  const { assets, loading } = useAssets();
  const [asset, setAsset] = useState<any>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Remove mock comments - start with empty array
  useEffect(() => {
    setComments([]);
  }, []);

  useEffect(() => {
    if (assets && assets.length > 0) {
      const foundAsset = assets.find(a => a.id === assetId);
      setAsset(foundAsset);
    }
  }, [assets, assetId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [asset]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleAddComment = (timestamp: number, content: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    const newComment: VideoComment = {
      id: Date.now().toString(),
      timestamp: attachTime ? timestamp : -1,
      content,
      author: "Current User",
      authorColor: "#8B5CF6",
      createdAt: new Date(),
      resolved: false,
      hasTimestamp: attachTime === true,
      attachments: attachments || [],
      hasDrawing: hasDrawing === true
    };
    
    setComments(prev => {
      const updated = [...prev, newComment];
      return updated;
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleCommentClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    video.currentTime = newTime;
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-screen w-screen bg-black fixed inset-0 z-50">
      <VideoReviewInterface
        asset={asset}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        currentTime={currentTime}
        onCommentClick={handleCommentClick}
        onBack={onBack}
        videoRef={videoRef}
        isPlaying={isPlaying}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        showControls={showControls}
        onMouseMove={handleMouseMove}
        onTogglePlayPause={togglePlayPause}
        onToggleMute={toggleMute}
        onSeek={handleSeek}
        formatTime={formatTime}
        progress={progress}
      />
    </div>
  );
};
