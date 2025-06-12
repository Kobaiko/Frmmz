import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Edit, CheckCircle, Clock, Zap } from "lucide-react";
import type { Comment } from "@/pages/Index";

interface EnhancedVideoTimelineProps {
  currentTime: number;
  duration: number;
  comments: Comment[];
  onTimeClick: (time: number) => void;
  previewVideoRef?: React.RefObject<HTMLVideoElement>;
  timeFormat: 'timecode' | 'seconds' | 'frames';
  frameRate?: number;
  onHover?: (time: number | null) => void;
  markers?: TimelineMarker[];
  chapters?: Chapter[];
}

interface TimelineMarker {
  time: number;
  type: 'in' | 'out' | 'cut' | 'bookmark';
  label?: string;
  color?: string;
}

interface Chapter {
  startTime: number;
  endTime: number;
  title: string;
  color?: string;
}

export const EnhancedVideoTimeline = ({
  currentTime,
  duration,
  comments,
  onTimeClick,
  previewVideoRef,
  timeFormat,
  frameRate = 30,
  onHover,
  markers = [],
  chapters = []
}: EnhancedVideoTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const formatTime = (seconds: number) => {
    const totalFrames = Math.floor(seconds * frameRate);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = totalFrames % frameRate;

    switch (timeFormat) {
      case 'timecode':
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${Math.floor((seconds % 1) * 10)}`;
      case 'frames':
        return `${totalFrames}f`;
      default:
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    onTimeClick(Math.max(0, Math.min(duration, time)));
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    setHoverTime(time);
    onHover?.(time);
    
    // Update preview video for thumbnails
    if (previewVideoRef?.current && time >= 0 && time <= duration) {
      previewVideoRef.current.currentTime = time;
    }
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
    setShowPreview(false);
    onHover?.(null);
  };

  const getCommentIcon = (comment: Comment) => {
    if (comment.hasDrawing) return <Edit className="h-3 w-3" />;
    return <MessageSquare className="h-3 w-3" />;
  };

  const getMarkerIcon = (marker: TimelineMarker) => {
    switch (marker.type) {
      case 'in': return '⬅';
      case 'out': return '➡';
      case 'cut': return '✂';
      case 'bookmark': return '🔖';
      default: return '•';
    }
  };

  // Group comments that are close together
  const groupedComments = comments.reduce((groups: any[], comment) => {
    if (comment.timestamp < 0) return groups;
    
    const existingGroup = groups.find(group => 
      Math.abs(group.time - comment.timestamp) < 2 // Group comments within 2 seconds
    );
    
    if (existingGroup) {
      existingGroup.comments.push(comment);
    } else {
      groups.push({
        time: comment.timestamp,
        comments: [comment]
      });
    }
    
    return groups;
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-2">
        {/* Chapters */}
        {chapters.length > 0 && (
          <div className="relative h-2">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className={`absolute h-full rounded ${chapter.color || 'bg-blue-600'} opacity-30`}
                style={{
                  left: `${(chapter.startTime / duration) * 100}%`,
                  width: `${((chapter.endTime - chapter.startTime) / duration) * 100}%`
                }}
              />
            ))}
          </div>
        )}

        {/* Main Timeline */}
        <div
          ref={timelineRef}
          className="relative h-6 bg-gray-700 rounded-full cursor-pointer group"
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          onMouseEnter={() => setShowPreview(true)}
        >
          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-150"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />

          {/* Hover indicator */}
          {hoverTime !== null && (
            <div
              className="absolute top-0 w-1 h-full bg-white opacity-60 z-10"
              style={{ left: `${(hoverTime / duration) * 100}%` }}
            />
          )}

          {/* Current time indicator */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-600 shadow-lg z-20 transition-all duration-150"
            style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />

          {/* Comment indicators */}
          {groupedComments.map((group, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 p-0 bg-yellow-500 hover:bg-yellow-400 rounded-full z-10"
                  style={{ left: `${(group.time / duration) * 100}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeClick(group.time);
                  }}
                >
                  {group.comments.length > 1 ? (
                    <Badge variant="secondary" className="text-xs px-1 bg-yellow-600 text-white">
                      {group.comments.length}
                    </Badge>
                  ) : (
                    getCommentIcon(group.comments[0])
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-700">
                <div className="space-y-1">
                  <p className="font-medium">{formatTime(group.time)}</p>
                  {group.comments.slice(0, 3).map((comment: Comment, idx: number) => (
                    <p key={idx} className="text-sm text-gray-300 truncate max-w-40">
                      {comment.text}
                    </p>
                  ))}
                  {group.comments.length > 3 && (
                    <p className="text-xs text-gray-400">+{group.comments.length - 3} more</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Timeline markers */}
          {markers.map((marker, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`absolute top-0 w-1 h-full ${marker.color || 'bg-red-500'} z-5`}
                  style={{ left: `${(marker.time / duration) * 100}%` }}
                >
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-xs">
                    {getMarkerIcon(marker)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-700">
                <div>
                  <p className="font-medium">{marker.label || marker.type}</p>
                  <p className="text-sm text-gray-300">{formatTime(marker.time)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Time indicators */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          {hoverTime !== null && showPreview && (
            <span className="text-white bg-gray-800 px-2 py-1 rounded">
              {formatTime(hoverTime)}
            </span>
          )}
          <span>{formatTime(duration)}</span>
        </div>

        {/* Frame-accurate controls */}
        {timeFormat === 'frames' && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTimeClick(Math.max(0, currentTime - 1/frameRate))}
              className="text-xs px-2 py-1 h-6"
            >
              -1f
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTimeClick(Math.min(duration, currentTime + 1/frameRate))}
              className="text-xs px-2 py-1 h-6"
            >
              +1f
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
