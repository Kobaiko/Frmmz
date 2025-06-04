
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MessageSquare, Plus, Send } from "lucide-react";
import type { Comment } from "@/pages/Index";

interface CommentPanelProps {
  comments: Comment[];
  currentTime: number;
  onAddComment: (text: string, timestamp: number) => void;
  onCommentClick: (timestamp: number) => void;
}

export const CommentPanel = ({
  comments,
  currentTime,
  onAddComment,
  onCommentClick,
}: CommentPanelProps) => {
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim(), currentTime);
      setNewComment("");
      setIsAddingComment(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageSquare size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Comments</h2>
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
              {comments.length}
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddingComment(!isAddingComment)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock size={14} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {isAddingComment && (
          <div className="p-6 bg-gray-750 border-b border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-blue-400">
                <Clock size={14} />
                <span>At {formatTime(currentTime)}</span>
              </div>
              <Textarea
                placeholder="Leave your feedback..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSubmit} 
                  disabled={!newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send size={14} />
                  <span>Post</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingComment(false);
                    setNewComment("");
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No comments yet</p>
                <p className="text-sm">Be the first to leave feedback!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650 transition-all duration-200 border border-gray-600 hover:border-gray-500"
                  onClick={() => onCommentClick(comment.timestamp)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-400 font-medium text-sm">
                      {formatTime(comment.timestamp)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-2 leading-relaxed">{comment.text}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{comment.author}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
