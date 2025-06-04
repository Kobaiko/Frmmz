import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DrawingCanvas } from "./DrawingCanvas";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Pencil, 
  MessageSquare,
  Settings,
  Maximize,
  ChevronRight,
  Check,
  Plus,
  Minus
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [quality, setQuality] = useState('1080p');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['1080p', '720p', '540p', '360p']);
  const [maxQuality, setMaxQuality] = useState('1080p');
  const [guides, setGuides] = useState({
    enabled: false,
    ratio: '4:3'
  });
  const [zoom, setZoom] = useState('Fit');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [encodeComments, setEncodeComments] = useState(false);
  const [annotations, setAnnotations] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      setDuration(videoDuration);
      
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
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      // In a real implementation, you would switch video sources here
      console.log(`Quality changed to: ${newQuality}`);
      // Simulate quality change by adjusting video element
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

  const handleViewOnAsset = () => {
    console.log('View on Asset clicked');
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
    );
  };

  return (
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
        
        {/* Guide lines overlay */}
        {guides.enabled && getGuideLines()}
        
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
                className="w-56 bg-gray-800 border-gray-600 text-white"
                align="end"
              >
                {/* Quality Sub-menu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2.5 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <span>▶️</span>
                      <span>Quality</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{quality}</span>
                      <span className="text-xs bg-blue-600 px-1.5 py-0.5 rounded text-white font-medium">
                        {getQualityLabel(quality)}
                      </span>
                      <ChevronRight size={16} />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white">
                    {availableQualities.map((qual) => (
                      <DropdownMenuItem
                        key={qual}
                        className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                        onClick={() => handleQualityChange(qual)}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{qual}</span>
                          <span className="text-xs bg-blue-600 px-1.5 py-0.5 rounded text-white font-medium">
                            {getQualityLabel(qual)}
                          </span>
                        </div>
                        {quality === qual && <Check size={16} />}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem 
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleQualityChange('Auto')}
                    >
                      <span>Auto</span>
                      {quality === 'Auto' && <Check size={16} />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Guides Sub-menu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2.5 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <span>📐</span>
                      <span>Guides</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{guides.enabled ? guides.ratio : 'Off'}</span>
                      <ChevronRight size={16} />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white">
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleGuidesRatioChange('2.35')}
                    >
                      <span>2.35</span>
                      {guides.ratio === '2.35' && guides.enabled && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleGuidesRatioChange('1.85')}
                    >
                      <span>1.85</span>
                      {guides.ratio === '1.85' && guides.enabled && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleGuidesRatioChange('16:9')}
                    >
                      <span>16:9</span>
                      {guides.ratio === '16:9' && guides.enabled && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleGuidesRatioChange('9:16')}
                    >
                      <span>9:16</span>
                      {guides.ratio === '9:16' && guides.enabled && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleGuidesRatioChange('4:3')}
                    >
                      <span>4:3</span>
                      {guides.ratio === '4:3' && guides.enabled && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleGuidesRatioChange('1:1')}
                    >
                      <span>1:1</span>
                      {guides.ratio === '1:1' && guides.enabled && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={handleGuidesToggle}
                    >
                      <span>Off</span>
                      {!guides.enabled && <Check size={16} />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Zoom Sub-menu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2.5 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <span>🔍</span>
                      <span>Zoom</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{zoom}</span>
                      <ChevronRight size={16} />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white">
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleZoomChange('Fit')}
                    >
                      <div className="flex items-center space-x-3">
                        <span>📱</span>
                        <span>Fit</span>
                      </div>
                      {zoom === 'Fit' && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleZoomChange('Fill')}
                    >
                      <div className="flex items-center space-x-3">
                        <span>📱</span>
                        <span>Fill</span>
                      </div>
                      {zoom === 'Fill' && <Check size={16} />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleZoomChange('Zoom In')}
                    >
                      <div className="flex items-center space-x-3">
                        <span>🔍</span>
                        <span>Zoom In</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleZoomChange('Zoom Out')}
                    >
                      <div className="flex items-center space-x-3">
                        <span>🔍</span>
                        <span>Zoom Out</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2 cursor-pointer"
                      onClick={() => handleZoomChange('100%')}
                    >
                      <div className="flex items-center space-x-3">
                        <span>🔍</span>
                        <span>Zoom to 100%</span>
                      </div>
                      {zoom === '100%' && <Check size={16} />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* View on Asset Sub-menu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 px-3 py-2.5 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <span>📱</span>
                      <span>View on Asset</span>
                    </div>
                    <ChevronRight size={16} />
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white">
                    {/* Encode Comments */}
                    <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer p-0">
                      <div className="flex items-center justify-between w-full px-3 py-2">
                        <div className="flex items-center space-x-3">
                          <span>💬</span>
                          <span>Encode Comments</span>
                        </div>
                        <Switch
                          checked={encodeComments}
                          onCheckedChange={(checked) => {
                            setEncodeComments(checked);
                            console.log(`Encode Comments ${checked ? 'enabled' : 'disabled'}`);
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </DropdownMenuItem>

                    {/* Annotations */}
                    <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer p-0">
                      <div className="flex items-center justify-between w-full px-3 py-2">
                        <div className="flex items-center space-x-3">
                          <span>✏️</span>
                          <span>Annotations</span>
                        </div>
                        <Switch
                          checked={annotations}
                          onCheckedChange={(checked) => {
                            setAnnotations(checked);
                            console.log(`Annotations ${checked ? 'enabled' : 'disabled'}`);
                          }}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Set Frame as Thumb */}
                <DropdownMenuItem 
                  className="hover:bg-gray-700 focus:bg-gray-700 px-3 py-2.5 cursor-pointer"
                  onClick={handleSetFrameAsThumb}
                >
                  <div className="flex items-center space-x-3">
                    <span>🖼️</span>
                    <span>Set Frame as Thumb</span>
                  </div>
                </DropdownMenuItem>
                
                {/* Download Still */}
                <DropdownMenuItem 
                  className="hover:bg-gray-700 focus:bg-gray-700 px-3 py-2.5 cursor-pointer"
                  onClick={handleDownloadStill}
                >
                  <div className="flex items-center space-x-3">
                    <span>💾</span>
                    <span>Download Still</span>
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
