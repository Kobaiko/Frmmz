
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Clock, 
  Reply, 
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Edit,
  Trash2,
  Pin
} from "lucide-react";

interface Comment {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  createdAt: Date;
  parentId?: string;
  attachments?: any[];
  isInternal?: boolean;
  hasDrawing?: boolean;
}

interface CommentPanelProps {
  comments: Comment[];
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onDeleteComment: (commentId: string) => void;
  onReplyComment: (parentId: string, text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onAddComment: (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onStartDrawing: () => void;
  isDrawingMode: boolean;
}

export const CommentPanel = ({
  comments,
  currentTime,
  onCommentClick,
  onDeleteComment,
  onReplyComment,
  onAddComment,
  onStartDrawing,
  isDrawingMode
}: CommentPanelProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyComment(commentId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''}`}>
      <Card className="bg-gray-800 border-gray-700 mb-3">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-600 text-white text-sm">
                {comment.author.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white text-sm">{comment.author}</span>
                  {comment.isInternal && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                      Internal
                    </Badge>
                  )}
                  {comment.hasDrawing && (
                    <Pin className="h-3 w-3 text-yellow-400" />
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {comment.timestamp >= 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <button 
                    onClick={() => onCommentClick(comment.timestamp)}
                    className="hover:text-blue-400 cursor-pointer"
                  >
                    @{formatTimestamp(comment.timestamp)}
                  </button>
                </div>
              )}

              <p className="text-gray-300 text-sm">{comment.text}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-gray-400 hover:text-blue-400"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      0
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-gray-400 hover:text-red-400"
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      0
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-gray-400 hover:text-white h-6 px-2"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-white h-6 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteComment(comment.id)}
                    className="text-xs text-red-400 hover:text-red-300 h-6 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {comment.createdAt.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Input */}
      {replyingTo === comment.id && (
        <div className="ml-8 mb-3">
          <div className="flex space-x-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white text-sm min-h-[60px]"
            />
            <div className="flex flex-col space-y-1">
              <Button
                size="sm"
                onClick={() => handleReply(comment.id)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Reply
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {comments.filter(reply => reply.parentId === comment.id).map((reply) => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 h-full overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comments ({comments.length})
          </h3>
        </div>

        {/* New Comment */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartDrawing}
                  className={`border-gray-600 text-gray-300 ${isDrawingMode ? 'bg-pink-600 text-white' : ''}`}
                >
                  Draw
                </Button>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-2">
          {comments.filter(comment => !comment.parentId).map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <h4 className="text-gray-400 font-medium">No comments yet</h4>
              <p className="text-gray-500 text-sm">Start the conversation by adding a comment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
