
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
  Pin,
  Paperclip,
  Smile,
  Send,
  ChevronDown,
  Globe
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [isInternal, setIsInternal] = useState(false);
  const [attachTime, setAttachTime] = useState(true);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment, [], isInternal, attachTime, false);
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

  const handleDrawingClick = () => {
    // Pause video when drawing starts
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video && !video.paused) {
      video.pause();
    }
    onStartDrawing();
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-6 border-l-2 border-gray-700 pl-3' : ''} max-w-full`}>
      <Card className="bg-gray-800 border-gray-700 mb-3 max-w-full">
        <CardContent className="p-3 max-w-full overflow-hidden">
          <div className="flex items-start space-x-3 max-w-full">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-gray-600 text-white text-sm">
                {comment.author.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center justify-between mb-2 max-w-full">
                <div className="flex items-center space-x-2 min-w-0 flex-1 max-w-full overflow-hidden">
                  <span className="font-medium text-white text-sm truncate max-w-[120px]">{comment.author}</span>
                  {comment.isInternal && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs flex-shrink-0">
                      Internal
                    </Badge>
                  )}
                  {comment.hasDrawing && (
                    <Pin className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white" align="end">
                      <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700">
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteComment(comment.id)}
                        className="hover:bg-gray-700 focus:bg-gray-700 text-red-400"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {comment.timestamp >= 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-400 mb-2 max-w-full">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <button 
                    onClick={() => onCommentClick(comment.timestamp)}
                    className="hover:text-blue-400 cursor-pointer truncate"
                  >
                    @{formatTimestamp(comment.timestamp)}
                  </button>
                </div>
              )}

              <div className="mb-3 max-w-full">
                <p className="text-gray-300 text-sm break-words whitespace-pre-wrap leading-relaxed max-w-full overflow-hidden">
                  {comment.text}
                </p>
              </div>

              <div className="flex items-center justify-between max-w-full">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex items-center space-x-1">
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

                <div className="text-xs text-gray-500 flex-shrink-0 truncate max-w-[80px]">
                  {comment.createdAt.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Input */}
      {replyingTo === comment.id && (
        <div className="ml-6 mb-3 max-w-full">
          <div className="flex space-x-2 max-w-full">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white text-sm min-h-[60px] flex-1 max-w-full"
            />
            <div className="flex flex-col space-y-1 flex-shrink-0">
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
    <div className="w-80 bg-gray-900 border-l border-gray-800 h-full flex flex-col max-w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 max-w-full">
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

      {/* New Comment Input - Fixed at bottom */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex-shrink-0 max-w-full">
        <div className="space-y-3 max-w-full">
          <div className="relative max-w-full">
            {attachTime && (
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm font-medium">
                  <Clock size={12} />
                  <span>{formatTimestamp(currentTime)}</span>
                </div>
              </div>
            )}
            <Textarea
              placeholder={attachTime ? ` - Add a comment...` : "Add a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => {
                // Pause video when starting to type
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video && !video.paused) {
                  video.pause();
                }
              }}
              className={`bg-gray-700 border-gray-600 text-white min-h-[80px] resize-none max-w-full ${
                attachTime ? 'pl-20' : ''
              }`}
            />
          </div>
          
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center space-x-1 min-w-0 flex-1">
              {/* Time attach button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAttachTime(!attachTime)}
                className={`p-2 rounded-lg flex-shrink-0 ${
                  attachTime 
                    ? "text-blue-400 bg-blue-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-gray-600"
                }`}
                title={attachTime ? `Attach ${formatTimestamp(currentTime)}` : "Don't attach time"}
              >
                <Clock size={16} />
              </Button>
              
              {/* Attachment button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-600 p-2 rounded-lg flex-shrink-0"
                title="Attach files"
              >
                <Paperclip size={16} />
              </Button>
              
              {/* Drawing tools button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDrawingClick}
                className={`p-2 rounded-lg flex-shrink-0 ${
                  isDrawingMode
                    ? "text-blue-400 bg-blue-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-gray-600"
                }`}
                title="Drawing tools"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="m2 2 7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </Button>
              
              {/* Emoji button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-600 p-2 rounded-lg flex-shrink-0"
                title="Add emoji"
              >
                <Smile size={16} />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Public/Internal dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-gray-600 p-2 rounded-lg min-w-0"
                  >
                    <Globe size={16} />
                    <span className="ml-1 text-sm hidden sm:inline">{isInternal ? "Internal" : "Public"}</span>
                    <ChevronDown size={12} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white">
                  <DropdownMenuItem
                    onClick={() => setIsInternal(false)}
                    className="hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <Globe size={14} className="mr-2" />
                    Public
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsInternal(true)}
                    className="hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="w-3 h-3 mr-2 rounded-full bg-orange-500"></div>
                    Internal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Send button */}
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 flex-shrink-0"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
