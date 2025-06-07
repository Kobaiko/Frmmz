
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VideoPreview } from "./VideoPreview";
import type { Comment } from "@/pages/Index";

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  comments: Comment[];
  onTimeClick: (time: number) => void;
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  timeFormat: 'timecode' | 'frames' | 'standard';
}

export const VideoTimeline = ({ 
  currentTime, 
  duration, 
  comments, 
  onTimeClick, 
  previewVideoRef, 
  timeFormat 
}: VideoTimelineProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * duration;
    onTimeClick(time);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = hoverX / rect.width;
    const time = percentage * duration;
    setHoverTime(time);
  };

  const getCommentMarkers = () => {
    return comments.filter(comment => !comment.parentId && comment.timestamp >= 0).map(comment => ({
      ...comment,
      position: duration > 0 ? (comment.timestamp / duration) * 100 : 0
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TooltipProvider>
      <div className="mb-4 relative">
        <VideoPreview
          previewVideoRef={previewVideoRef}
          isHovering={isHovering}
          hoverTime={hoverTime}
          timeFormat={timeFormat}
          duration={duration}
        />
        
        {/* Timeline container with extra bottom padding for avatars */}
        <div className="relative pb-8">
          {/* Main timeline bar */}
          <div
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
          </div>
          
          {/* Comment markers positioned below the timeline */}
          {getCommentMarkers().map((comment) => (
            <Tooltip key={comment.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute transform -translate-x-1/2 mt-2"
                  style={{ left: `${comment.position}%` }}
                >
                  <Avatar className="w-6 h-6 border-2 border-white shadow-lg hover:scale-110 transition-transform cursor-default">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                      {comment.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="max-w-xs bg-gray-900 text-white border border-gray-700 p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{comment.author}</span>
                    <span>•</span>
                    <span>{formatTime(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm text-white">{comment.text}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
