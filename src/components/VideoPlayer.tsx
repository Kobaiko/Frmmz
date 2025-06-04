
import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { DrawingCanvas } from "./DrawingCanvas";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

export const VideoPlayer = ({ src, currentTime, onTimeUpdate }: VideoPlayerProps) => {
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
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, onTimeUpdate]);

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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button
            size="sm"
            variant={isDrawingMode ? "default" : "outline"}
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className="bg-white/90 hover:bg-white"
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Current time: {formatTime(currentTime)}</span>
          <span>Drawing mode: {isDrawingMode ? "ON" : "OFF"}</span>
        </div>
      </div>
    </div>
  );
};
