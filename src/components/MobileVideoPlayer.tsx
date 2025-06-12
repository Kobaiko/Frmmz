
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, MessageSquare } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MobileVideoPlayerProps {
  src: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  onTimeUpdate: (time: number) => void;
  onTogglePlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleFullscreen: () => void;
  onOpenComments: () => void;
  commentsCount: number;
}

export const MobileVideoPlayer = ({
  src,
  currentTime,
  duration,
  isPlaying,
  volume,
  onTimeUpdate,
  onTogglePlayPause,
  onVolumeChange,
  onToggleFullscreen,
  onOpenComments,
  commentsCount
}: MobileVideoPlayerProps) => {
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    onTimeUpdate(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVideoClick = () => {
    setShowControls(!showControls);
    setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onClick={handleVideoClick}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      />

      {/* Mobile Controls Overlay */}
      {showControls && (
        <>
          {/* Top gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
          
          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {/* Progress bar */}
            <div className="mb-4">
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleProgressChange}
                className="w-full"
                step={0.1}
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePlayPause}
                  className="text-white p-2"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    className="text-white p-2"
                  >
                    {volume > 0 ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </Button>
                  
                  {showVolumeSlider && (
                    <div className="absolute bottom-12 left-0 bg-black/80 p-2 rounded">
                      <Slider
                        value={[volume * 100]}
                        onValueChange={(value) => onVolumeChange(value[0] / 100)}
                        className="w-20 h-2"
                        orientation="vertical"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenComments}
                  className="text-white p-2 relative"
                >
                  <MessageSquare className="h-5 w-5" />
                  {commentsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {commentsCount}
                    </span>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white p-2"
                >
                  <Settings className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFullscreen}
                  className="text-white p-2"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Center play button for large screens */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={onTogglePlayPause}
              className="text-white bg-black/50 rounded-full p-6 hover:bg-black/70"
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
