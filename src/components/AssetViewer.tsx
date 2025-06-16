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
    <div className="h-screen bg-black flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-white font-medium">{asset.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div 
          className="flex-1 relative bg-black flex items-center justify-center"
          onMouseMove={handleMouseMove}
        >
          {asset.file_type === 'video' ? (
            <>
              <video
                ref={videoRef}
                src={asset.file_url}
                className="max-w-full max-h-full object-contain"
                playsInline
                controls={false}
              />
              
              {/* Video Controls Overlay */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="p-6">
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-2 bg-gray-700 rounded-full mb-4 cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-pink-500 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      
                      <div className="text-white text-lg font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="text-white text-sm opacity-75">
                      {Math.round(progress)}% complete
                    </div>
                  </div>
                </div>
              </div>
            </>
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

      {/* Comments Panel - Clean professional design */}
      {asset.file_type === 'video' && (
        <div className="w-80 border-l border-gray-700 flex-shrink-0">
          <VideoReviewInterface
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentTime={currentTime}
            onCommentClick={handleCommentClick}
          />
        </div>
      )}
    </div>
  );
};
