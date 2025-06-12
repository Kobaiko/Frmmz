
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw
} from "lucide-react";

interface Comment {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  createdAt: Date;
  parentId?: string;
  attachments?: any[];
  isInternal?: boolean;
  hasDrawing?: boolean;
}

interface VideoPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  comments: Comment[];
  onTimeClick: (timestamp: number) => void;
  isDrawingMode: boolean;
  onDrawingModeChange: (enabled: boolean) => void;
  annotations: boolean;
  setAnnotations: (enabled: boolean) => void;
}

export const VideoPlayer = ({ 
  src, 
  currentTime,
  onTimeUpdate, 
  onDurationChange,
  comments,
  onTimeClick,
  isDrawingMode,
  onDrawingModeChange,
  annotations,
  setAnnotations
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      onTimeUpdate(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      onDurationChange(videoDuration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const time = value[0];
      videoRef.current.currentTime = time;
      onTimeUpdate(time);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const enterFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = (event: React.MouseEvent<HTMLVideoElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const videoWidth = rect.width;
    const clickTimePercentage = clickX / videoWidth;
    const timestamp = clickTimePercentage * duration;
    onTimeClick(timestamp);
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative group">
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handleVideoClick}
        />
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="bg-black/60 rounded-full p-4">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
        )}

        {/* Timeline Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full mb-3"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-10)}
              className="text-white hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-gray-700"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(10)}
              className="text-white hover:bg-gray-700"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-gray-700"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex items-center space-x-1">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <Button
                  key={rate}
                  variant={playbackRate === rate ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changePlaybackRate(rate)}
                  className={`text-xs ${
                    playbackRate === rate 
                      ? "bg-pink-600 text-white" 
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {rate}x
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={enterFullscreen}
              className="text-white hover:bg-gray-700"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          
          {/* Timeline Markers */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>0:00</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
