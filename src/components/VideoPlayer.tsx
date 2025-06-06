import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DrawingCanvas } from "./DrawingCanvas";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VideoTimeline } from "./VideoTimeline";
import { VideoControls } from "./VideoControls";
import { VideoGuides } from "./VideoGuides";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { useVideoKeyboardShortcuts } from "@/hooks/useVideoKeyboardShortcuts";
import type { Comment } from "@/pages/Index";

interface VideoPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  comments: Comment[];
  onTimeClick: (time: number) => void;
  isDrawingMode?: boolean;
  onDrawingModeChange?: (enabled: boolean) => void;
  annotations: boolean;
  setAnnotations: (value: boolean) => void;
}

export const VideoPlayer = ({ 
  src, 
  currentTime, 
  onTimeUpdate, 
  onDurationChange, 
  comments, 
  onTimeClick,
  isDrawingMode = false,
  onDrawingModeChange,
  annotations,
  setAnnotations
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState({
    enabled: false,
    ratio: '4:3',
    mask: false
  });
  const [zoom, setZoom] = useState('Fit');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [encodeComments, setEncodeComments] = useState(false);

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
  } = useVideoPlayer({ src, currentTime, onTimeUpdate, onDurationChange });

  // Force pause video immediately when drawing mode is enabled
  useEffect(() => {
    if (isDrawingMode && videoRef.current) {
      console.log('Drawing mode activated - forcing immediate video pause');
      const video = videoRef.current;
      
      // Force pause immediately and repeatedly to ensure it sticks
      const forcePause = () => {
        if (!video.paused) {
          video.pause();
          console.log('Video forcefully paused for drawing mode');
        }
      };
      
      forcePause();
      
      // Set up multiple checks to ensure video stays paused
      const timeouts = [
        setTimeout(forcePause, 50),
        setTimeout(forcePause, 100),
        setTimeout(forcePause, 200),
      ];

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isDrawingMode]);

  // Handle drawing mode change - always pause video when enabling
  const handleDrawingModeChange = (enabled: boolean) => {
    console.log(`Drawing mode change: ${enabled ? 'enabling' : 'disabling'}`);
    
    if (enabled && videoRef.current) {
      console.log('Pausing video for drawing mode');
      const video = videoRef.current;
      
      // Immediate pause
      video.pause();
      
      // Additional safety pauses
      setTimeout(() => {
        if (!video.paused) {
          video.pause();
          console.log('Safety pause executed');
        }
      }, 50);
    }
    
    if (onDrawingModeChange) {
      onDrawingModeChange(enabled);
    }
  };

  // Handle drawing start - pause video and enable drawing mode
  const handleDrawingStart = () => {
    console.log('Drawing start - pausing video immediately');
    
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      console.log('Video paused for drawing start');
    }
    
    handleDrawingModeChange(true);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 10);
    
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds}`;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleGuidesToggle = () => {
    setGuides(prev => ({ ...prev, enabled: !prev.enabled }));
    console.log(`Guides ${!guides.enabled ? 'enabled' : 'disabled'}`);
  };

  const handleGuidesRatioChange = (ratio: string) => {
    setGuides(prev => ({ ...prev, ratio, enabled: true }));
    console.log(`Guides ratio changed to: ${ratio}`);
  };

  const handleGuidesMaskToggle = () => {
    setGuides(prev => ({ ...prev, mask: !prev.mask }));
    console.log(`Guides mask ${!guides.mask ? 'enabled' : 'disabled'}`);
  };

  const handleZoomChange = (newZoom: string) => {
    setZoom(newZoom);
    const video = videoRef.current;
    if (!video) return;

    switch (newZoom) {
      case 'Fit':
        setZoomLevel(1);
        video.style.transform = 'scale(1)';
        video.style.objectFit = 'contain';
        break;
      case 'Fill':
        setZoomLevel(1);
        video.style.transform = 'scale(1)';
        video.style.objectFit = 'cover';
        break;
      case 'Zoom In':
        const newZoomIn = Math.min(zoomLevel * 1.2, 3);
        setZoomLevel(newZoomIn);
        video.style.transform = `scale(${newZoomIn})`;
        video.style.transformOrigin = 'center center';
        break;
      case 'Zoom Out':
        const newZoomOut = Math.max(zoomLevel * 0.8, 0.5);
        setZoomLevel(newZoomOut);
        video.style.transform = `scale(${newZoomOut})`;
        video.style.transformOrigin = 'center center';
        break;
      case '100%':
        setZoomLevel(1);
        video.style.transform = 'scale(1)';
        video.style.objectFit = 'none';
        break;
    }
    console.log(`Zoom changed to: ${newZoom}`);
  };

  const handleSetFrameAsThumb = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        console.log('Frame set as thumbnail');
      }
    }
  };

  const handleDownloadStill = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const link = document.createElement('a');
        link.download = `video-still-${formatTime(currentTime)}.png`;
        link.href = canvas.toDataURL();
        link.click();
        console.log('Still image downloaded');
      }
    }
  };

  useVideoKeyboardShortcuts({
    videoRef,
    volume,
    isPlaying,
    setVolume: (newVolume) => {
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
      }
    },
    onZoomChange: handleZoomChange
  });

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full bg-black flex flex-col relative" ref={containerRef}>
        {/* Main video area - centered */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="relative">
            <video
              ref={videoRef}
              className="max-w-full max-h-full transition-transform duration-200"
              onClick={!isDrawingMode ? togglePlayPause : undefined}
              style={{ 
                display: 'block',
                objectFit: 'contain',
                pointerEvents: isDrawingMode ? 'none' : 'auto'
              }}
            />
            
            {/* Hidden preview video for thumbnails */}
            <video
              ref={previewVideoRef}
              style={{ display: 'none' }}
              muted
            />
            
            <VideoGuides
              videoRef={videoRef}
              containerRef={containerRef}
              guides={guides}
            />
            
            {/* Drawing Canvas - Only show when annotations are enabled */}
            {annotations && (
              <div className="absolute inset-0 pointer-events-auto">
                <DrawingCanvas 
                  currentTime={currentTime} 
                  videoRef={videoRef}
                  isDrawingMode={isDrawingMode}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom control panel */}
        <div className="bg-black border-t border-gray-800 p-6">
          {/* Timeline */}
          <VideoTimeline
            currentTime={currentTime}
            duration={duration}
            comments={comments}
            onTimeClick={onTimeClick}
            previewVideoRef={previewVideoRef}
            timeFormat={timeFormat}
          />
          
          {/* Controls */}
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
            onZoomChange={handleZoomChange}
            encodeComments={encodeComments}
            setEncodeComments={setEncodeComments}
            annotations={annotations}
            setAnnotations={setAnnotations}
            onSetFrameAsThumb={handleSetFrameAsThumb}
            onDownloadStill={handleDownloadStill}
            onToggleFullscreen={toggleFullscreen}
            formatTime={formatTime}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};