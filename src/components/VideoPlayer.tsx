import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DrawingCanvas } from "./DrawingCanvas";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Pencil, 
  MessageSquare,
  Settings,
  Maximize,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Comment } from "@/pages/Index";

interface VideoPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  comments: Comment[];
  onTimeClick: (time: number) => void;
}

export const VideoPlayer = ({ 
  src, 
  currentTime, 
  onTimeUpdate, 
  onDurationChange, 
  comments, 
  onTimeClick 
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [quality, setQuality] = useState('1080p');
  const [showGuides, setShowGuides] = useState(false);
  const [zoomLevel, setZoomLevel] = useState('Fit');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      setDuration(videoDuration);
      if (onDurationChange) {
        onDurationChange(videoDuration);
      }
    };

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Set video source
    video.src = src;

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [src, onTimeUpdate, onDurationChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    onTimeClick(0);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const handleVolumeToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (volume > 0) {
      setVolume(0);
      video.volume = 0;
    } else {
      setVolume(1);
      video.volume = 1;
    }
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const time = percentage * duration;
      onTimeClick(time);
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const percentage = hoverX / rect.width;
      const time = percentage * duration;
      setHoverTime(time);
    }
  };

  const getCommentMarkers = () => {
    return comments.filter(comment => !comment.parentId).map(comment => ({
      ...comment,
      position: duration > 0 ? (comment.timestamp / duration) * 100 : 0
    }));
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    // In a real implementation, this would change the video source
    console.log(`Quality changed to: ${newQuality}`);
  };

  const handleGuidesToggle = () => {
    setShowGuides(!showGuides);
    console.log(`Guides ${!showGuides ? 'enabled' : 'disabled'}`);
  };

  const handleZoomChange = (newZoom: string) => {
    setZoomLevel(newZoom);
    console.log(`Zoom changed to: ${newZoom}`);
  };

  const handleViewOnAsset = () => {
    console.log('View on Asset clicked');
    // Implementation for viewing on asset platform
  };

  const handleSetFrameAsThumb = () => {
    console.log('Set Frame as Thumb clicked');
    // Implementation for setting current frame as thumbnail
  };

  const handleDownloadStill = () => {
    console.log('Download Still clicked');
    // Implementation for downloading current frame as image
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-2xl relative">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-auto"
          onClick={togglePlayPause}
        />
        
        {isDrawingMode && (
          <div className="absolute inset-0 pointer-events-none">
            <DrawingCanvas />
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <Button
            size="sm"
            variant={isDrawingMode ? "default" : "outline"}
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className="bg-black/70 border-gray-600 text-white hover:bg-black/90 backdrop-blur-sm"
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>
      
      {/* Custom Control Bar */}
      <div className="bg-black p-4">
        {/* Timeline */}
        <div className="mb-4">
          <div
            ref={timelineRef}
            className="relative h-1 bg-gray-600 rounded cursor-pointer"
            onClick={handleTimelineClick}
            onMouseMove={handleTimelineMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Progress bar */}
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            
            {/* Comment markers */}
            {getCommentMarkers().map((comment) => (
              <div
                key={comment.id}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${comment.position}%` }}
              >
                <div className="w-3 h-3 bg-white rounded-full border-2 border-black" />
              </div>
            ))}
            
            {/* Hover time indicator */}
            {isHovering && (
              <div
                className="absolute -top-8 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded"
                style={{ left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause */}
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlayPause}
              className="text-white hover:bg-gray-800 p-2"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            
            {/* Restart */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRestart}
              className="text-white hover:bg-gray-800 p-2"
            >
              <RotateCcw size={16} />
            </Button>
            
            {/* Speed */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSpeedChange}
              className="text-white hover:bg-gray-800 px-3 py-2 text-sm"
            >
              {playbackSpeed}x
            </Button>
            
            {/* Volume */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleVolumeToggle}
              className="text-white hover:bg-gray-800 p-2"
            >
              <Volume2 size={16} />
            </Button>
          </div>
          
          {/* Time Display */}
          <div className="text-white text-sm font-mono">
            {formatTime(currentTime)}:{formatTime(duration)}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-gray-800 p-2"
                >
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-gray-900 border-gray-700 text-white"
                align="end"
              >
                <DropdownMenuItem 
                  className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleQualityChange(quality === '1080p' ? '720p' : '1080p')}
                >
                  <div className="flex items-center space-x-2">
                    <span>🎬</span>
                    <span>Quality</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">{quality}</span>
                    <span className="text-xs bg-blue-600 px-1 rounded">HD</span>
                    <ChevronRight size={16} />
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                  onClick={handleGuidesToggle}
                >
                  <div className="flex items-center space-x-2">
                    <span>📐</span>
                    <span>Guides</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">{showGuides ? 'On' : 'Off'}</span>
                    <ChevronRight size={16} />
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleZoomChange(zoomLevel === 'Fit' ? '100%' : 'Fit')}
                >
                  <div className="flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Zoom</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">{zoomLevel}</span>
                    <ChevronRight size={16} />
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                  onClick={handleViewOnAsset}
                >
                  <div className="flex items-center space-x-2">
                    <span>📱</span>
                    <span>View on Asset</span>
                  </div>
                  <ChevronRight size={16} />
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-center hover:bg-gray-800 cursor-pointer"
                  onClick={handleSetFrameAsThumb}
                >
                  <div className="flex items-center space-x-2">
                    <span>🖼️</span>
                    <span>Set Frame as Thumb</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-center hover:bg-gray-800 cursor-pointer"
                  onClick={handleDownloadStill}
                >
                  <div className="flex items-center space-x-2">
                    <span>💾</span>
                    <span>Download Still</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* HD */}
            <span className="text-white text-sm font-medium">HD</span>
            
            {/* Fullscreen */}
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-gray-800 p-2"
            >
              <Maximize size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
