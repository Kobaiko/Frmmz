
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Clock, 
  Check, 
  X, 
  Reply, 
  MoreHorizontal,
  Pin,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  RotateCcw,
  Settings
} from "lucide-react";
import { DrawingToolsMenu } from "./DrawingToolsMenu";

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor: string;
  createdAt: Date;
  resolved?: boolean;
  replies?: VideoComment[];
}

interface VideoReviewInterfaceProps {
  comments: VideoComment[];
  onAddComment: (timestamp: number, content: string) => void;
  onResolveComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentTime: number;
  isDrawingMode?: boolean;
  onToggleDrawingMode?: () => void;
  showDrawingTools?: boolean;
  onToggleDrawingTools?: () => void;
  showAnnotations?: boolean;
  onToggleAnnotations?: () => void;
}

export const VideoReviewInterface = ({ 
  comments, 
  onAddComment, 
  onResolveComment, 
  onDeleteComment,
  currentTime,
  isDrawingMode = false,
  onToggleDrawingMode,
  showDrawingTools = false,
  onToggleDrawingTools,
  showAnnotations = true,
  onToggleAnnotations
}: VideoReviewInterfaceProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(currentTime, newComment.trim());
      setNewComment('');
    }
  };

  const filteredComments = comments
    .filter(comment => {
      switch (filter) {
        case 'unresolved': return !comment.resolved;
        case 'resolved': return comment.resolved;
        default: return true;
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  const CommentItem = ({ comment, isReply = false }: { comment: VideoComment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-6 border-l-2 border-gray-600 pl-3' : ''}`}>
      <Card className={`bg-gray-800 border-gray-700 ${comment.resolved ? 'opacity-75' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback 
                  className="text-white text-xs"
                  style={{ backgroundColor: comment.authorColor }}
                >
                  {comment.author.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium text-xs">{comment.author}</span>
                  <Badge 
                    variant="outline" 
                    className="border-gray-600 text-gray-400 text-xs cursor-pointer hover:bg-gray-700"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(comment.timestamp)}
                  </Badge>
                </div>
                <span className="text-gray-400 text-xs">{formatRelativeTime(comment.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {comment.resolved && (
                <Badge className="bg-green-600 text-white text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-2">{comment.content}</p>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="text-gray-400 hover:text-white text-xs p-1 h-auto"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            {!comment.resolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolveComment(comment.id)}
                className="text-green-400 hover:text-green-300 text-xs p-1 h-auto"
              >
                <Check className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteComment(comment.id)}
              className="text-red-400 hover:text-red-300 text-xs p-1 h-auto"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex space-x-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Add a reply..."
                  className="bg-gray-700 border-gray-600 text-white text-sm min-h-[60px]"
                />
                <div className="flex flex-col space-y-1">
                  <Button
                    onClick={() => {
                      // Handle reply submission
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Reply
                  </Button>
                  <Button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replies */}
      {comment.replies && comment.replies.map((reply) => (
        <div key={reply.id} className="mt-2">
          <CommentItem comment={reply} isReply={true} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex">
      {/* Comments Section - Left Side */}
      <div className="flex-1 flex flex-col">
        {/* Header with Video Controls */}
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center text-sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments ({comments.length})
            </h3>
            
            {/* Video Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-xs p-1 h-auto"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Loop
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-xs p-1 h-auto"
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
              
              {/* Drawing Controls */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleDrawingMode}
                  className={`text-xs p-1 h-auto ${isDrawingMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Draw
                </Button>
                {showDrawingTools && (
                  <DrawingToolsMenu onClose={() => onToggleDrawingTools?.()} />
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleAnnotations}
                className={`text-xs p-1 h-auto ${showAnnotations ? 'text-white' : 'text-gray-400'}`}
              >
                {showAnnotations ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {(['all', 'unresolved', 'resolved'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  filter === filterType 
                    ? 'bg-pink-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Add Comment */}
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Current time: {formatTime(currentTime)}</span>
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment at the current time..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[80px] text-sm"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-full bg-pink-600 hover:bg-pink-700 text-sm"
            >
              Add Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {filter === 'all' ? 'No comments yet' : `No ${filter} comments`}
              </p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
