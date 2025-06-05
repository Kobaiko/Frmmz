
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Repeat,
  Maximize,
  ChevronDown,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VideoSettingsMenu } from "./VideoSettingsMenu";

interface VideoControlsProps {
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  playbackSpeed: number;
  onSpeedChange: (speeds: number[]) => void;
  volume: number;
  onVolumeToggle: () => void;
  onVolumeChange: (volume: number[]) => void;
  currentTime: number;
  duration: number;
  timeFormat: 'timecode' | 'frames' | 'standard';
  onTimeFormatChange: (format: 'timecode' | 'frames' | 'standard') => void;
  quality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
  guides: {
    enabled: boolean;
    ratio: string;
    mask: boolean;
  };
  onGuidesToggle: () => void;
  onGuidesRatioChange: (ratio: string) => void;
  onGuidesMaskToggle: () => void;
  zoom: string;
  onZoomChange: (zoom: string) => void;
  encodeComments: boolean;
  setEncodeComments: (value: boolean) => void;
  annotations: boolean;
  setAnnotations: (value: boolean) => void;
  onSetFrameAsThumb: () => void;
  onDownloadStill: () => void;
  onToggleFullscreen: () => void;
  formatTime: (seconds: number) => string;
}

export const VideoControls = ({
  isPlaying,
  onTogglePlayPause,
  isLooping,
  onToggleLoop,
  playbackSpeed,
  onSpeedChange,
  volume,
  onVolumeToggle,
  onVolumeChange,
  currentTime,
  duration,
  timeFormat,
  onTimeFormatChange,
  quality,
  availableQualities,
  onQualityChange,
  guides,
  onGuidesToggle,
  onGuidesRatioChange,
  onGuidesMaskToggle,
  zoom,
  onZoomChange,
  encodeComments,
  setEncodeComments,
  annotations,
  setAnnotations,
  onSetFrameAsThumb,
  onDownloadStill,
  onToggleFullscreen,
  formatTime
}: VideoControlsProps) => {
  const [isSpeedHovered, setIsSpeedHovered] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  const formatTimeByFormat = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps
    
    switch (timeFormat) {
      case 'timecode':
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
      case 'frames':
        const totalFrames = Math.floor(seconds * 30); // Assuming 30fps
        return `${totalFrames}`;
      case 'standard':
        if (hours > 0) {
          return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      default:
        return formatTime(seconds);
    }
  };

  // Speed value to index mapping for the slider
  const speedValues = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const getSpeedIndex = (speed: number) => speedValues.indexOf(speed);
  const getSpeedFromIndex = (index: number) => speedValues[index];

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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Play/Pause with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={onTogglePlayPause}
              className="text-white hover:text-white hover:bg-gray-800 p-2 border-0 focus:border-0 focus:ring-0 focus-visible:ring-0"
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
              onClick={onToggleLoop}
              className={`p-2 border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 ${
                isLooping 
                  ? 'text-blue-400 hover:text-blue-400 hover:bg-gray-800' 
                  : 'text-white hover:text-white hover:bg-gray-800'
              }`}
            >
              <Repeat size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 text-white border-gray-600">
            <span>{isLooping ? 'Disable Loop' : 'Enable Loop'}</span>
          </TooltipContent>
        </Tooltip>
        
        {/* Speed with popover */}
        <Popover open={isSpeedHovered} onOpenChange={setIsSpeedHovered}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:text-white hover:bg-gray-800 px-3 py-2 text-sm border-0 focus:border-0 focus:ring-0 focus-visible:ring-0"
              onMouseEnter={() => setIsSpeedHovered(true)}
              onMouseLeave={() => setIsSpeedHovered(false)}
            >
              {playbackSpeed}x
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0 bg-gray-800 border-gray-600 rounded-lg" 
            side="top"
            align="center"
            onMouseEnter={() => setIsSpeedHovered(true)}
            onMouseLeave={() => setIsSpeedHovered(false)}
          >
            <div className="p-4">
              <div className="text-white text-sm font-medium mb-4">Playback speed</div>
              <div className="relative">
                <Slider
                  value={[getSpeedIndex(playbackSpeed)]}
                  onValueChange={(value) => onSpeedChange([getSpeedFromIndex(value[0])])}
                  max={speedValues.length - 1}
                  step={1}
                  className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_.relative]:bg-gray-600 [&_.bg-primary]:bg-blue-500"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-300">
                  {speedValues.map((speed, index) => (
                    <span key={speed} className="text-center" style={{ width: '12.5%' }}>
                      {speed}x
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Volume with popover that opens on hover */}
        <Popover open={isVolumeHovered} onOpenChange={setIsVolumeHovered}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-gray-800 p-2 border-0 focus:border-0 focus:ring-0 focus-visible:ring-0"
                  onMouseEnter={() => setIsVolumeHovered(true)}
                  onMouseLeave={() => setIsVolumeHovered(false)}
                  onClick={onVolumeToggle}
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
            className="w-auto p-2 bg-gray-900 border-gray-600 text-white rounded-lg" 
            side="right"
            align="center"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <div className="flex items-center space-x-2">
              <Slider
                value={[volume]}
                onValueChange={onVolumeChange}
                max={1}
                step={0.01}
                orientation="horizontal"
                className="w-20 [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_.relative]:bg-gray-600 [&_.bg-primary]:bg-blue-500"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Time Display - Centered */}
      <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
        <div className="text-white text-sm font-mono">
          {formatTimeByFormat(currentTime)} / {formatTimeByFormat(duration)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:text-white hover:bg-gray-800 p-1 border-0 focus:border-0 focus:ring-0 focus-visible:ring-0"
            >
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="bg-gray-800 border-gray-600 text-white shadow-xl z-50"
            align="center"
            sideOffset={5}
          >
            <DropdownMenuItem
              className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-3 py-2 cursor-pointer text-white"
              onClick={() => onTimeFormatChange('frames')}
            >
              <span className="text-white">Frames</span>
              {timeFormat === 'frames' && <Check size={16} className="text-white" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-3 py-2 cursor-pointer text-white"
              onClick={() => onTimeFormatChange('standard')}
            >
              <span className="text-white">Standard</span>
              {timeFormat === 'standard' && <Check size={16} className="text-white" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-3 py-2 cursor-pointer text-white"
              onClick={() => onTimeFormatChange('timecode')}
            >
              <span className="text-white">Timecode</span>
              {timeFormat === 'timecode' && <Check size={16} className="text-white" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Settings Dropdown */}
        <VideoSettingsMenu
          quality={quality}
          availableQualities={availableQualities}
          onQualityChange={onQualityChange}
          guides={guides}
          onGuidesToggle={onGuidesToggle}
          onGuidesRatioChange={onGuidesRatioChange}
          onGuidesMaskToggle={onGuidesMaskToggle}
          zoom={zoom}
          onZoomChange={onZoomChange}
          encodeComments={encodeComments}
          setEncodeComments={setEncodeComments}
          annotations={annotations}
          setAnnotations={setAnnotations}
          onSetFrameAsThumb={onSetFrameAsThumb}
          onDownloadStill={onDownloadStill}
          currentTime={currentTime}
          formatTime={formatTime}
        />
        
        {/* HD */}
        <span className="text-white text-sm font-medium">
          {getQualityLabel(quality) || quality}
        </span>
        
        {/* Fullscreen */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleFullscreen}
          className="text-white hover:text-white hover:bg-gray-800 p-2 border-0 focus:border-0 focus:ring-0 focus-visible:ring-0"
        >
          <Maximize size={16} />
        </Button>
      </div>
    </div>
  );
};
