
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { Comment } from "@/pages/Index";

interface TimelineProps {
  comments: Comment[];
  currentTime: number;
  duration: number;
  onTimeClick: (time: number) => void;
}

export const Timeline = ({ comments, currentTime, duration, onTimeClick }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

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
      position: (comment.timestamp / duration) * 100
    }));
  };

  return (
    <div className="relative bg-gray-800 p-4 border-t border-gray-700">
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
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        
        {/* Current time indicator */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
          style={{ left: `${(currentTime / duration) * 100}%` }}
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
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>
    </div>
  );
};
