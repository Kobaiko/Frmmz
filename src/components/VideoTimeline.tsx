
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
    return comments.filter(comment => !comment.parentId).map(comment => ({
      ...comment,
      position: duration > 0 ? (comment.timestamp / duration) * 100 : 0
    }));
  };

  return (
    <div className="mb-4 relative">
      <VideoPreview
        previewVideoRef={previewVideoRef}
        isHovering={isHovering}
        hoverTime={hoverTime}
        timeFormat={timeFormat}
        duration={duration}
      />
      
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
  );
};
