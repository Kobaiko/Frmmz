
import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { DrawingCanvas } from "./DrawingCanvas";
import { Button } from "@/components/ui/button";
import { Pencil, MessageSquare, Clock } from "lucide-react";
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
  const playerRef = useRef<any>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

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
        const videoDuration = playerRef.current.duration();
        setDuration(videoDuration);
        if (onDurationChange) {
          onDurationChange(videoDuration);
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
      
      {/* Integrated Timeline */}
      {duration > 0 && (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Timeline</span>
            <span className="text-sm text-gray-400">{formatTime(duration)}</span>
          </div>
          
          <div
            ref={timelineRef}
            className="relative h-8 bg-gray-700 rounded-full cursor-pointer"
            onClick={handleTimelineClick}
            onMouseMove={handleTimelineMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Progress bar */}
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            
            {/* Current time indicator */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            
            {/* Comment markers */}
            {getCommentMarkers().map((comment) => (
              <div
                key={comment.id}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${comment.position}%` }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 bg-yellow-500 hover:bg-yellow-600 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeClick(comment.timestamp);
                  }}
                >
                  <MessageSquare size={12} className="text-white" />
                </Button>
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
          
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-300">Current: {formatTime(currentTime)}</span>
            <span className="text-gray-400">
              Drawing: <span className={isDrawingMode ? "text-green-400" : "text-gray-500"}>{isDrawingMode ? "ON" : "OFF"}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
