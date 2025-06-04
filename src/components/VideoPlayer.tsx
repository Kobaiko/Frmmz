
import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { DrawingCanvas } from "./DrawingCanvas";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

export const VideoPlayer = ({ src, currentTime, onTimeUpdate, onDurationChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src,
          type: 'video/mp4'
        }]
      });

      playerRef.current.on('timeupdate', () => {
        onTimeUpdate(playerRef.current.currentTime());
      });

      playerRef.current.on('loadedmetadata', () => {
        if (onDurationChange) {
          onDurationChange(playerRef.current.duration());
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, onTimeUpdate, onDurationChange]);

  useEffect(() => {
    if (playerRef.current && Math.abs(playerRef.current.currentTime() - currentTime) > 0.5) {
      playerRef.current.currentTime(currentTime);
    }
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
      <div className="relative">
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-default-skin w-full"
            controls
            preload="auto"
            data-setup="{}"
          />
        </div>
        
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
      
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Current: {formatTime(currentTime)}</span>
          <span className="text-gray-400">
            Drawing: <span className={isDrawingMode ? "text-green-400" : "text-gray-500"}>{isDrawingMode ? "ON" : "OFF"}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
