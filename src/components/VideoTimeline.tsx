
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { VideoPreview } from "./VideoPreview";
import { Clock, Edit } from "lucide-react";

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor?: string;
  createdAt: Date;
  resolved?: boolean;
  replies?: VideoComment[];
  attachments?: any[];
  hasDrawing?: boolean;
  hasTimestamp?: boolean;
  parentId?: string;
}

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  comments: VideoComment[];
  onTimeClick: (time: number) => void;
  onCommentClick: (timestamp: number, commentId: string) => void;
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  timeFormat: 'timecode' | 'frames' | 'seconds';
  assetId: string;
}

export const VideoTimeline = ({ 
  currentTime, 
  duration, 
  comments, 
  onTimeClick, 
  onCommentClick,
  previewVideoRef, 
  timeFormat,
  assetId
}: VideoTimelineProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(0);

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
    setHoverPosition(hoverX);
  };

  const getCommentMarkers = () => {
    const validComments = comments.filter(comment => 
      !comment.parentId && 
      comment.timestamp >= 0 && 
      comment.timestamp <= duration
    );
    
    return validComments.map((comment, index) => ({
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

  const commentMarkers = getCommentMarkers();

  return (
    <TooltipProvider>
      <div className="mb-4 relative">
        {/* Timeline hover preview */}
        {isHovering && (
          <div 
            className="absolute z-[60] pointer-events-none"
            style={{ 
              left: `${hoverPosition}px`, 
              transform: 'translateX(-50%)',
              bottom: '60px'
            }}
          >
            <VideoPreview
              assetId={assetId}
              previewVideoRef={previewVideoRef}
              isHovering={isHovering}
              hoverTime={hoverTime}
              timeFormat={timeFormat}
              duration={duration}
            />
          </div>
        )}
        
        {/* Timeline container */}
        <div className="relative pb-12">
          {/* Main timeline bar */}
          <div
            className="relative h-3 bg-gray-600 rounded cursor-pointer"
            onClick={handleTimelineClick}
            onMouseMove={handleTimelineMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Progress bar */}
            <div
              className="absolute top-0 left-0 h-full bg-pink-500 rounded"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          {/* Comment markers */}
          {commentMarkers.map((comment) => (
            <Tooltip key={comment.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute transform -translate-x-1/2 cursor-pointer z-30"
                  style={{ 
                    left: `${comment.position}%`,
                    top: '20px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCommentClick(comment.timestamp, comment.id);
                  }}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-white shadow-lg hover:scale-110 transition-transform bg-blue-600">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Comment number badge */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {comment.commentNumber}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="min-w-80 max-w-md bg-gray-900 text-white border border-gray-700 p-4 shadow-xl z-[70]"
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
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTime(comment.timestamp)}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Comment text */}
                  <p className="text-sm text-gray-200 leading-relaxed">{comment.content}</p>
                  
                  {/* Footer with status indicators */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Public
                      </span>
                      {comment.hasDrawing && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex items-center space-x-1">
                          <Edit className="w-2.5 h-2.5" />
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
    </TooltipProvider>
  );
};
