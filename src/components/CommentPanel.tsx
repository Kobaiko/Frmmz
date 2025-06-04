
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MessageSquare, Plus } from "lucide-react";
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare size={20} />
          <span>Comments ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Current: {formatTime(currentTime)}
          </span>
          <Button
            size="sm"
            onClick={() => setIsAddingComment(!isAddingComment)}
            className="flex items-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Comment</span>
          </Button>
        </div>

        {isAddingComment && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>At {formatTime(currentTime)}</span>
            </div>
            <Textarea
              placeholder="Add your feedback..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()}>
                Post Comment
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingComment(false);
                  setNewComment("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to leave feedback!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onCommentClick(comment.timestamp)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      {formatTime(comment.timestamp)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-1">{comment.text}</p>
                  <p className="text-xs text-gray-500">by {comment.author}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
