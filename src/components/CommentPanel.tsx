
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MoreHorizontal, 
  Trash2, 
  Reply, 
  Edit, 
  Check, 
  X,
  Paperclip,
  PenTool,
  Globe
} from "lucide-react";
import { CommentInput } from "./CommentInput";

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

interface CommentPanelProps {
  comments: VideoComment[];
  onDeleteComment: (commentId: string) => void;
  onReplyComment: (commentId: string, reply: string) => void;
  onAddComment: (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onStartDrawing: () => void;
  isDrawingMode: boolean;
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  highlightedCommentId?: string | null;
}

export const CommentPanel = ({ 
  comments, 
  onDeleteComment, 
  onReplyComment,
  onAddComment,
  onStartDrawing,
  isDrawingMode,
  currentTime,
  onCommentClick,
  highlightedCommentId
}: CommentPanelProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted comment
  useEffect(() => {
    if (highlightedCommentId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [highlightedCommentId]);

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

  const handleReply = (text: string) => {
    if (replyingTo) {
      onReplyComment(replyingTo, text);
      setReplyingTo(null);
    }
  };

  const sortedComments = [...comments]
    .filter(comment => !comment.parentId)
    .sort((a, b) => {
      // Sort by timestamp first (earliest first), then by creation date
      if (a.timestamp >= 0 && b.timestamp >= 0) {
        return a.timestamp - b.timestamp;
      }
      if (a.timestamp >= 0 && b.timestamp < 0) return -1;
      if (a.timestamp < 0 && b.timestamp >= 0) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {sortedComments.map((comment) => {
        const isHighlighted = comment.id === highlightedCommentId;
        
        return (
          <div 
            key={comment.id} 
            ref={isHighlighted ? highlightedRef : undefined}
            className={`bg-gray-800 rounded-lg p-4 border transition-all duration-300 ${
              isHighlighted 
                ? 'border-blue-500 bg-blue-900/20 shadow-lg ring-2 ring-blue-500/50' 
                : 'border-gray-700'
            }`}
          >
            {/* Comment Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                    {comment.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">{comment.author}</span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {comment.timestamp >= 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCommentClick(comment.timestamp)}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(comment.timestamp)}
                      </Button>
                    )}
                    <Badge className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5">
                      <Globe className="w-2.5 h-2.5 mr-1" />
                      Public
                    </Badge>
                    {comment.hasDrawing && (
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5">
                        <PenTool className="w-2.5 h-2.5 mr-1" />
                        Drawing
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActionsFor(showActionsFor === comment.id ? null : comment.id)}
                  className="text-gray-400 hover:text-white w-8 h-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {showActionsFor === comment.id && (
                  <div className="absolute right-0 top-8 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 min-w-32">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment.id)}
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-600"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComment(comment.id)}
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Comment Content */}
            <p className="text-gray-300 mb-3 leading-relaxed">{comment.content}</p>

            {/* Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Paperclip className="w-3 h-3" />
                  <span>{comment.attachments.length} attachment{comment.attachments.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <CommentInput
                  onAddComment={(text) => handleReply(text)}
                  onCancel={() => setReplyingTo(null)}
                  placeholder="Write a reply..."
                  currentTime={currentTime}
                  onStartDrawing={onStartDrawing}
                  isDrawingMode={isDrawingMode}
                />
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-3 pl-4 border-l-2 border-gray-600">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {reply.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">{reply.author}</span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-300">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {comments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">No comments yet</h3>
          <p className="text-gray-500">Be the first to share your feedback</p>
        </div>
      )}
    </div>
  );
};
