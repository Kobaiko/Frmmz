
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  MessageCircle,
  Clock,
  Download
} from "lucide-react";

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor: string;
  createdAt: Date;
  resolved?: boolean;
}

interface AdvancedVideoPlayerCoreProps {
  src: string;
  title: string;
  duration?: number;
  comments?: VideoComment[];
  onAddComment?: (timestamp: number, content: string) => void;
  onSeekToComment?: (timestamp: number) => void;
}

export const AdvancedVideoPlayerCore = ({ 
  src, 
  title, 
  duration = 120, 
  comments = [],
  onAddComment,
  onSeekToComment 
}: AdvancedVideoPlayerCoreProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showControls, setShowControls] = useState(true);
  const [showCommentMarkers, setShowCommentMarkers] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      // Video loaded
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackSpeed = (speed: string) => {
    const video = videoRef.current;
    if (!video) return;

    const speedValue = parseFloat(speed);
    video.playbackRate = speedValue;
    setPlaybackSpeed(speedValue);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCommentMarkers = () => {
    return comments.map(comment => ({
      ...comment,
      position: (comment.timestamp / duration) * 100
    }));
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={togglePlay}
      />

      {/* Video Overlay Info */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
          <div className="flex items-center space-x-2">
            <Badge className="bg-black/50 text-white">
              {quality}
            </Badge>
            <Badge className="bg-black/50 text-white">
              {playbackSpeed}x
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-black/50 text-white flex items-center space-x-1">
            <MessageCircle className="h-3 w-3" />
            <span>{comments.length}</span>
          </Badge>
        </div>
      </div>

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        {/* Timeline with Comment Markers */}
        <div className="relative mb-4">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration}
            step={0.1}
            className="w-full"
          />
          
          {/* Comment Markers */}
          {showCommentMarkers && getCommentMarkers().map((comment) => (
            <button
              key={comment.id}
              className="absolute top-0 w-3 h-3 -mt-1.5 cursor-pointer group/marker"
              style={{ left: `${comment.position}%` }}
              onClick={() => onSeekToComment?.(comment.timestamp)}
            >
              <div 
                className="w-full h-full rounded-full border-2 border-white"
                style={{ backgroundColor: comment.authorColor }}
              />
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {formatTime(comment.timestamp)} - {comment.author}
              </div>
            </button>
          ))}
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            {/* Skip Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-20"
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Playback Speed */}
            <Select value={playbackSpeed.toString()} onValueChange={changePlaybackSpeed}>
              <SelectTrigger className="w-20 bg-transparent border-gray-600 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>

            {/* Quality */}
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="w-20 bg-transparent border-gray-600 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="480p">480p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="1440p">1440p</SelectItem>
                <SelectItem value="4K">4K</SelectItem>
              </SelectContent>
            </Select>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
