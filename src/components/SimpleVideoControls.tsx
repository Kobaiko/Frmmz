
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface SimpleVideoControlsProps {
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  volume: number;
  onVolumeToggle: () => void;
  currentTime: number;
  duration: number;
}

export const SimpleVideoControls = ({
  isPlaying,
  onTogglePlayPause,
  volume,
  onVolumeToggle,
  currentTime,
  duration
}: SimpleVideoControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 rounded">
      <div className="flex items-center space-x-4">
        {/* Play/Pause */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onTogglePlayPause}
          className="text-white hover:bg-gray-700"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        
        {/* Volume */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onVolumeToggle}
          className="text-white hover:bg-gray-700"
        >
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </Button>
        
        {/* Time Display */}
        <div className="text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      
      <div className="text-white text-sm">
        Simple Controls Working!
      </div>
    </div>
  );
};
