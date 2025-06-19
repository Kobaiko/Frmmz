
import { useState } from "react";
import { CommentPanel } from "./CommentPanel";
import { CommentInput } from "./CommentInput";
import { VideoTimeline } from "./VideoTimeline";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MessageCircle } from "lucide-react";

interface VideoCollaborationPanelProps {
  assetId: string;
  comments: any[];
  onAddComment: (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onDeleteComment: (commentId: string) => void;
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  isDrawingMode: boolean;
  onPauseVideo?: () => void;
  hasDrawingOnCurrentFrame?: boolean;
}

export const VideoCollaborationPanel = ({
  assetId,
  comments,
  onAddComment,
  onDeleteComment,
  currentTime,
  onCommentClick,
  onStartDrawing,
  onStopDrawing,
  isDrawingMode,
  onPauseVideo,
  hasDrawingOnCurrentFrame = false
}: VideoCollaborationPanelProps) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'timeline'>('comments');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'comments'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Timeline
          </button>
        </div>

        {/* Current time indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(currentTime)}
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Users className="w-3 h-3 mr-1" />
              1 online
            </Badge>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'comments' ? (
          <CommentPanel
            comments={comments}
            onDeleteComment={onDeleteComment}
            currentTime={currentTime}
            onCommentClick={onCommentClick}
          />
        ) : (
          <div className="flex-1 p-4">
            <VideoTimeline
              currentTime={currentTime}
              duration={300} // placeholder duration
              comments={comments}
              onTimeClick={onCommentClick}
              previewVideoRef={{ current: null }}
              timeFormat="timecode"
              assetId={assetId}
            />
          </div>
        )}

        {/* Comment input at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <CommentInput
            onAddComment={onAddComment}
            currentTime={currentTime}
            onStartDrawing={onStartDrawing}
            isDrawingMode={isDrawingMode}
            onPauseVideo={onPauseVideo}
            hasDrawingOnCurrentFrame={hasDrawingOnCurrentFrame}
          />
        </div>
      </div>
    </div>
  );
};
