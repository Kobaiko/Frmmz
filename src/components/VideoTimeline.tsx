
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VideoPreview } from "./VideoPreview";
import type { Comment } from "@/pages/Index";

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  comments: Comment[];
  onTimeClick: (time: number) => void;
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  timeFormat: 'timecode' | 'frames' | 'standard';
  assetId: string;
}

export const VideoTimeline = ({ 
  currentTime, 
  duration, 
  comments, 
  onTimeClick, 
  previewVideoRef, 
  timeFormat,
  assetId
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
    return comments.filter(comment => !comment.parentId && comment.timestamp >= 0).map((comment, index) => ({
      ...comment,
      position: duration > 0 ? (comment.timestamp / duration) * 100 : 0,
      commentNumber: index + 1
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <div className="mb-4 relative">
      <VideoPreview
        assetId={assetId}
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
              className="min-w-80 max-w-md bg-gray-900 text-white border border-gray-700 p-4 shadow-xl"
            >
              <div className="space-y-3">
                {/* Header with profile and metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{comment.author}</div>
                      <div className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      #{comment.commentNumber}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded flex items-center space-x-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      <span>{formatTime(comment.timestamp)}</span>
                    </span>
                  </div>
                </div>
                
                {/* Comment text */}
                <p className="text-sm text-gray-200 leading-relaxed">{comment.text}</p>
                
                {/* Footer with status indicators */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    {comment.isInternal ? (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                        Internal
                      </span>
                    ) : (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Public
                      </span>
                    )}
                    {comment.hasDrawing && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex items-center space-x-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                          <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                        </svg>
                        <span>Drawing</span>
                      </span>
                    )}
                  </div>
                  {comment.attachments && comment.attachments.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {comment.attachments.length} attachment{comment.attachments.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

