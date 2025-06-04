import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DrawingCanvas } from "./DrawingCanvas";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Pencil, 
  MessageSquare,
  Settings,
  Maximize,
  ChevronRight,
  Check,
  ZoomIn,
  ZoomOut,
  Image,
  Download,
  Shrink,
  Maximize2,
  Repeat
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
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
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [previewFrame, setPreviewFrame] = useState<string>('');
  const [quality, setQuality] = useState('1080p');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['1080p', '720p', '540p', '360p']);
  const [maxQuality, setMaxQuality] = useState('1080p');
  const [guides, setGuides] = useState({
    enabled: false,
    ratio: '4:3',
    mask: false
  });
  const [zoom, setZoom] = useState('Fit');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [encodeComments, setEncodeComments] = useState(false);
  const [annotations, setAnnotations] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const previewVideo = previewVideoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      setDuration(videoDuration);
      
      // Set up preview video
      if (previewVideo) {
        previewVideo.src = src;
        previewVideo.muted = true;
      }
      
      // Determine max quality based on video resolution
      const videoHeight = video.videoHeight;
      let maxQual = '360p';
      let availableQuals = ['360p'];
      
      if (videoHeight >= 2160) {
        maxQual = '2160p';
        availableQuals = ['2160p', '1080p', '720p', '540p', '360p'];
      } else if (videoHeight >= 1080) {
        maxQual = '1080p';
        availableQuals = ['1080p', '720p', '540p', '360p'];
      } else if (videoHeight >= 720) {
        maxQual = '720p';
        availableQuals = ['720p', '540p', '360p'];
      } else if (videoHeight >= 540) {
        maxQual = '540p';
        availableQuals = ['540p', '360p'];
      }
      
      setMaxQuality(maxQual);
      setQuality(maxQual);
      setAvailableQualities(availableQuals);
      
      if (onDurationChange) {
        onDurationChange(videoDuration);
      }
    };

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleEnded = () => {
      if (isLooping) {
        video.currentTime = 0;
        video.play();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Set video source
    video.src = src;

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [src, onTimeUpdate, onDurationChange, isLooping]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing
      }

      switch (e.key.toLowerCase()) {
        case 'k':
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
          e.preventDefault();
          handleVolumeToggle();
          break;
        case 't':
          handleZoomChange('Fit');
          break;
        case 'y':
          handleZoomChange('Fill');
          break;
        case '+':
        case '=':
          handleZoomChange('Zoom In');
          break;
        case '-':
          handleZoomChange('Zoom Out');
          break;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        handleZoomChange('100%');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 10);
    
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds}`;
  };

  const formatTimeSimple = (seconds: number) => {
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

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    console.log(`Loop ${!isLooping ? 'enabled' : 'disabled'}`);
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

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
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
      updatePreviewFrame(time);
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
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      console.log(`Quality changed to: ${newQuality}`);
      videoRef.current.currentTime = currentTime;
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

  const getQualityLabel = (qual: string) => {
    const labels: { [key: string]: string } = {
      '2160p': '4K',
      '1080p': 'HD',
      '720p': 'HD',
      '540p': 'SD',
      '360p': 'SD'
    };
    return labels[qual] || '';
  };

  const getGuideLines = () => {
    if (!guides.enabled || !videoRef.current) return null;

    const video = videoRef.current;
    const videoRect = video.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return null;

    const videoWidth = videoRect.width;
    const videoHeight = videoRect.height;
    
    let aspectRatio = 1;
    switch (guides.ratio) {
      case '2.35':
        aspectRatio = 2.35;
        break;
      case '1.85':
        aspectRatio = 1.85;
        break;
      case '16:9':
        aspectRatio = 16/9;
        break;
      case '9:16':
        aspectRatio = 9/16;
        break;
      case '4:3':
        aspectRatio = 4/3;
        break;
      case '1:1':
        aspectRatio = 1;
        break;
    }

    const guideWidth = aspectRatio > 1 ? videoWidth : videoHeight * aspectRatio;
    const guideHeight = aspectRatio > 1 ? videoWidth / aspectRatio : videoHeight;
    
    const left = (videoWidth - guideWidth) / 2;
    const top = (videoHeight - guideHeight) / 2;

    return (
      <>
        {/* Guide lines */}
        <div
          className="absolute border-2 border-yellow-400 border-dashed pointer-events-none"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${guideWidth}px`,
            height: `${guideHeight}px`,
            zIndex: 5
          }}
        />
        
        {/* Mask overlay */}
        {guides.mask && (
          <>
            {/* Top mask */}
            {top > 0 && (
              <div
                className="absolute bg-black pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  width: `${videoWidth}px`,
                  height: `${top}px`,
                  zIndex: 4
                }}
              />
            )}
            
            {/* Bottom mask */}
            {top + guideHeight < videoHeight && (
              <div
                className="absolute bg-black pointer-events-none"
                style={{
                  left: 0,
                  top: `${top + guideHeight}px`,
                  width: `${videoWidth}px`,
                  height: `${videoHeight - (top + guideHeight)}px`,
                  zIndex: 4
                }}
              />
            )}
            
            {/* Left mask */}
            {left > 0 && (
              <div
                className="absolute bg-black pointer-events-none"
                style={{
                  left: 0,
                  top: `${top}px`,
                  width: `${left}px`,
                  height: `${guideHeight}px`,
                  zIndex: 4
                }}
              />
            )}
            
            {/* Right mask */}
            {left + guideWidth < videoWidth && (
              <div
                className="absolute bg-black pointer-events-none"
                style={{
                  left: `${left + guideWidth}px`,
                  top: `${top}px`,
                  width: `${videoWidth - (left + guideWidth)}px`,
                  height: `${guideHeight}px`,
                  zIndex: 4
                }}
              />
            )}
          </>
        )}
      </>
    );
  };

  const updatePreviewFrame = (time: number) => {
    const previewVideo = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    if (!previewVideo || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use the preview video element (doesn't affect main playback)
    previewVideo.currentTime = time;
    
    // Wait for seeked event to ensure frame is loaded
    const handleSeeked = () => {
      canvas.width = 160;
      canvas.height = 90;
      ctx.drawImage(previewVideo, 0, 0, 160, 90);
      setPreviewFrame(canvas.toDataURL());
      previewVideo.removeEventListener('seeked', handleSeeked);
    };

    previewVideo.addEventListener('seeked', handleSeeked);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl relative">
        <div className="relative overflow-hidden" ref={containerRef}>
          <video
            ref={videoRef}
            className="w-full h-auto transition-transform duration-200"
            onClick={togglePlayPause}
            style={{ 
              display: 'block',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
          
          {/* Hidden preview video for thumbnails */}
          <video
            ref={previewVideoRef}
            style={{ display: 'none' }}
            muted
          />
          
          {/* Hidden canvas for frame preview */}
          <canvas
            ref={previewCanvasRef}
            style={{ display: 'none' }}
          />
          
          {getGuideLines()}
          
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
        <div className="bg-black p-4 relative z-10">
          {/* Timeline */}
          <div className="mb-4 relative">
            {/* Hover time indicator with frame preview - positioned above timeline */}
            {isHovering && (
              <div
                className="absolute -top-32 transform -translate-x-1/2 bg-gray-200 text-black text-xs rounded-lg shadow-xl border border-gray-300 z-20"
                style={{ left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%` }}
              >
                {/* Frame preview */}
                {previewFrame && (
                  <div className="mb-1">
                    <img 
                      src={previewFrame} 
                      alt="Frame preview"
                      className="rounded-t-lg w-40 h-auto border-b border-gray-300"
                    />
                  </div>
                )}
                {/* Time display with full format */}
                <div className="px-3 py-2 text-center font-mono">
                  {formatTime(hoverTime)}
                </div>
              </div>
            )}
            
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
              
              {/* Comment markers with user avatars */}
              {getCommentMarkers().map((comment) => (
                <div
                  key={comment.id}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${comment.position}%` }}
                >
                  <Avatar className="w-6 h-6 border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                      {comment.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayPause}
                    className="text-white hover:text-white p-2"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">K</span>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {/* Loop with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleLoop}
                    className={`text-white hover:text-white p-2 ${isLooping ? 'text-blue-400' : 'text-gray-400'}`}
                  >
                    <Repeat size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-600">
                  <span>{isLooping ? 'Disable Loop' : 'Enable Loop'}</span>
                </TooltipContent>
              </Tooltip>
              
              {/* Speed */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSpeedChange}
                className="text-white hover:text-white px-3 py-2 text-sm"
              >
                {playbackSpeed}x
              </Button>
              
              {/* Volume with popover */}
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-white p-2"
                      >
                        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>Mute</span>
                      <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">M</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent 
                  className="w-auto p-3 bg-gray-800 border-gray-600" 
                  side="right"
                  align="center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-white text-xs">{Math.round(volume * 100)}%</div>
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.1}
                      orientation="vertical"
                      className="h-20"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-white p-2"
                  >
                    <Settings size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-72 bg-gray-800 border-gray-600 text-white shadow-xl z-50"
                  align="end"
                  sideOffset={5}
                >
                  {/* Quality Sub-menu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
                      <div className="flex items-center space-x-3">
                        <Play size={16} className="text-gray-300" />
                        <span className="text-white">Quality</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-300 ml-auto">{quality}</span>
                        <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white font-medium">
                          {getQualityLabel(quality)}
                        </span>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
                      {availableQualities.map((qual) => (
                        <DropdownMenuItem
                          key={qual}
                          className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                          onClick={() => handleQualityChange(qual)}
                        >
                          <span className="text-white">{qual}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white font-medium">
                              {getQualityLabel(qual)}
                            </span>
                            {quality === qual && <Check size={16} className="text-white" />}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  {/* Guides Sub-menu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border border-gray-300 rounded" />
                        <span className="text-white">Guides</span>
                      </div>
                      <span className="text-sm text-gray-300 ml-auto">{guides.enabled ? guides.ratio : 'Off'}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleGuidesRatioChange('2.35')}
                      >
                        <span className="text-white">2.35</span>
                        {guides.ratio === '2.35' && guides.enabled && <Check size={16} className="text-white" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleGuidesRatioChange('1.85')}
                      >
                        <span className="text-white">1.85</span>
                        {guides.ratio === '1.85' && guides.enabled && <Check size={16} className="text-white" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleGuidesRatioChange('16:9')}
                      >
                        <span className="text-white">16:9</span>
                        {guides.ratio === '16:9' && guides.enabled && <Check size={16} className="text-white" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleGuidesRatioChange('9:16')}
                      >
                        <span className="text-white">9:16</span>
                        {guides.ratio === '9:16' && guides.enabled && <Check size={16} className="text-white" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleGuidesRatioChange('4:3')}
                      >
                        <span className="text-white">4:3</span>
                        {guides.ratio === '4:3' && guides.enabled && <Check size={16} className="text-white" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleGuidesRatioChange('1:1')}
                      >
                        <span className="text-white">1:1</span>
                        {guides.ratio === '1:1' && guides.enabled && <Check size={16} className="text-white" />}
                      </DropdownMenuItem>
                      
                      {/* Mask toggle */}
                      <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 cursor-pointer p-0">
                        <div className="flex items-center justify-between w-full px-4 py-3">
                          <span className="text-white">Mask</span>
                          <Switch
                            checked={guides.mask}
                            onCheckedChange={handleGuidesMaskToggle}
                            className="data-[state=checked]:bg-blue-600 scale-75"
                          />
                        </div>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={handleGuidesToggle}
                      >
                        <span className="text-white">Off</span>
                        {!guides.enabled && <Check size={16} className="text-white" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  {/* Zoom Sub-menu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
                      <div className="flex items-center space-x-3">
                        <ZoomIn size={16} className="text-gray-300" />
                        <span className="text-white">Zoom</span>
                      </div>
                      <span className="text-sm text-gray-300 ml-auto">{zoom}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleZoomChange('Fit')}
                      >
                        <div className="flex items-center space-x-3">
                          <Shrink size={16} className="text-gray-300" />
                          <span className="text-white">Fit</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">T</span>
                          {zoom === 'Fit' && <Check size={16} className="text-white" />}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleZoomChange('Fill')}
                      >
                        <div className="flex items-center space-x-3">
                          <Maximize2 size={16} className="text-gray-300" />
                          <span className="text-white">Fill</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">Y</span>
                          {zoom === 'Fill' && <Check size={16} className="text-white" />}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleZoomChange('Zoom In')}
                      >
                        <div className="flex items-center space-x-3">
                          <ZoomIn size={16} className="text-gray-300" />
                          <span className="text-white">Zoom In</span>
                        </div>
                        <span className="ml-auto bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">+</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleZoomChange('Zoom Out')}
                      >
                        <div className="flex items-center space-x-3">
                          <ZoomOut size={16} className="text-gray-300" />
                          <span className="text-white">Zoom Out</span>
                        </div>
                        <span className="ml-auto bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">-</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                        onClick={() => handleZoomChange('100%')}
                      >
                        <div className="flex items-center space-x-3">
                          <ZoomIn size={16} className="text-gray-300" />
                          <span className="text-white">Zoom to 100%</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">⌘0</span>
                          {zoom === '100%' && <Check size={16} className="text-white" />}
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  {/* View on Asset Sub-menu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border border-gray-300 rounded-sm" />
                        <span className="text-white">View on Asset</span>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
                      {/* Encode Comments */}
                      <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 cursor-pointer p-0">
                        <div className="flex items-center justify-between w-full px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <MessageSquare size={16} className="text-gray-300" />
                            <span className="text-white">Encode Comments</span>
                          </div>
                          <Switch
                            checked={encodeComments}
                            onCheckedChange={(checked) => {
                              setEncodeComments(checked);
                              console.log(`Encode Comments ${checked ? 'enabled' : 'disabled'}`);
                            }}
                            className="data-[state=checked]:bg-blue-600 scale-75"
                          />
                        </div>
                      </DropdownMenuItem>

                      {/* Annotations */}
                      <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 cursor-pointer p-0">
                        <div className="flex items-center justify-between w-full px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <Pencil size={16} className="text-gray-300" />
                            <span className="text-white">Annotations</span>
                          </div>
                          <Switch
                            checked={annotations}
                            onCheckedChange={(checked) => {
                              setAnnotations(checked);
                              console.log(`Annotations ${checked ? 'enabled' : 'disabled'}`);
                            }}
                            className="data-[state=checked]:bg-blue-600 scale-75"
                          />
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  {/* Set Frame as Thumb */}
                  <DropdownMenuItem 
                    className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                    onClick={handleSetFrameAsThumb}
                  >
                    <div className="flex items-center space-x-3">
                      <Image size={16} className="text-gray-300" />
                      <span className="text-white">Set Frame as Thumb</span>
                    </div>
                  </DropdownMenuItem>
                  
                  {/* Download Still */}
                  <DropdownMenuItem 
                    className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                    onClick={handleDownloadStill}
                  >
                    <div className="flex items-center space-x-3">
                      <Download size={16} className="text-gray-300" />
                      <span className="text-white">Download Still</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* HD */}
              <span className="text-white text-sm font-medium">
                {getQualityLabel(quality) || quality}
              </span>
              
              {/* Fullscreen */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:text-white p-2"
              >
                <Maximize size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
