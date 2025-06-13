
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
import { CommentContextMenu } from "./CommentContextMenu";
import { CommentFilterMenu, type CommentFilters } from "./CommentFilterMenu";
import { CommentTypeFilter, type CommentType } from "./CommentTypeFilter";
import { AdvancedCommentFilters, type CommentFilters as AdvancedFilters } from "./AdvancedCommentFilters";

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
  likes?: number;
  dislikes?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
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
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachTime, setAttachTime] = useState(true);
  const [commentLikes, setCommentLikes] = useState<Record<string, { likes: number; dislikes: number; isLiked: boolean; isDisliked: boolean }>>({});
  
  // Filter states
  const [commentFilters, setCommentFilters] = useState<CommentFilters>({
    annotations: false,
    attachments: false,
    completed: false,
    incomplete: false,
    unread: false,
    mentionsAndReactions: false,
  });
  const [commentType, setCommentType] = useState<CommentType>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    search: '',
    author: 'all',
    status: 'all',
    dateRange: { from: null, to: null },
    tags: [],
    type: 'all'
  });

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const handleLike = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Like clicked for comment:', commentId);
    
    setCommentLikes(prev => {
      const current = prev[commentId] || { likes: 0, dislikes: 0, isLiked: false, isDisliked: false };
      const newState = {
        ...current,
        likes: current.isLiked ? current.likes - 1 : current.likes + 1,
        dislikes: current.isDisliked ? current.dislikes - 1 : current.dislikes,
        isLiked: !current.isLiked,
        isDisliked: false
      };
      return { ...prev, [commentId]: newState };
    });
  };

  const handleDislike = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Dislike clicked for comment:', commentId);
    
    setCommentLikes(prev => {
      const current = prev[commentId] || { likes: 0, dislikes: 0, isLiked: false, isDisliked: false };
      const newState = {
        ...current,
        likes: current.isLiked ? current.likes - 1 : current.likes,
        dislikes: current.isDisliked ? current.dislikes - 1 : current.dislikes + 1,
        isLiked: false,
        isDisliked: !current.isDisliked
      };
      return { ...prev, [commentId]: newState };
    });
  };

  const handleReplyClick = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Reply clicked for comment:', commentId);
    setReplyingTo(commentId);
  };

  const handleStartEdit = (commentId: string, currentText: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Edit clicked for comment:', commentId);
    setEditingComment(commentId);
    setEditContent(currentText);
  };

  const handleSaveEdit = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Saving edit for comment:', commentId, 'with content:', editContent);
    setEditingComment(null);
    setEditContent('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Delete clicked for comment:', commentId);
    onDeleteComment(commentId);
  };

  const handleCopyLink = (commentId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.timestamp >= 0) {
      const url = `${window.location.href}?t=${comment.timestamp}`;
      navigator.clipboard.writeText(url);
      console.log('Copied link for comment:', commentId);
    }
  };

  const handleAddComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding comment:', newComment);
    if (newComment.trim()) {
      onAddComment(newComment, [], isInternal, attachTime, false);
      setNewComment('');
    }
  };

  const handleReply = (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Replying to comment:', commentId, 'with content:', replyContent);
    if (replyContent.trim()) {
      onReplyComment(commentId, replyContent, [], isInternal, attachTime, false);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleDrawingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drawing mode toggled');
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video && !video.paused) {
      video.pause();
    }
    onStartDrawing();
  };

  const handleAttachTimeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Attach time toggled:', !attachTime);
    setAttachTime(!attachTime);
  };

  const handleVisibilityChange = (isInternalValue: boolean, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Visibility changed to:', isInternalValue ? 'Internal' : 'Public');
    setIsInternal(isInternalValue);
  };

  const clearCommentFilters = () => {
    setCommentFilters({
      annotations: false,
      attachments: false,
      completed: false,
      incomplete: false,
      unread: false,
      mentionsAndReactions: false,
    });
  };

  // Filter comments based on current filters
  const filteredComments = comments.filter(comment => {
    // Filter by comment type
    if (commentType === 'public' && comment.isInternal) return false;
    if (commentType === 'internal' && !comment.isInternal) return false;
    
    // Filter by search
    if (advancedFilters.search && !comment.text.toLowerCase().includes(advancedFilters.search.toLowerCase())) {
      return false;
    }
    
    // Filter by author
    if (advancedFilters.author && advancedFilters.author !== 'all' && comment.author !== advancedFilters.author) return false;
    
    return true;
  });

  const commentCounts = {
    all: comments.length,
    public: comments.filter(c => !c.isInternal).length,
    internal: comments.filter(c => c.isInternal).length,
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const likes = commentLikes[comment.id] || { likes: 0, dislikes: 0, isLiked: false, isDisliked: false };
    const isEditing = editingComment === comment.id;
    
    return (
      <div className={`${isReply ? 'ml-6 border-l-2 border-gray-700 pl-3' : ''}`}>
        <CommentContextMenu
          onEdit={() => handleStartEdit(comment.id, comment.text)}
          onCopyLink={() => handleCopyLink(comment.id)}
          onDelete={() => handleDeleteComment(comment.id)}
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-3 hover:bg-gray-750 transition-colors">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-gray-600 text-white text-sm">
                  {comment.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="font-medium text-white text-sm truncate">{comment.author}</span>
                    {comment.isInternal && (
                      <Badge variant="outline" className="border-orange-500 text-orange-400 text-xs flex-shrink-0">
                        Internal
                      </Badge>
                    )}
                    {comment.hasDrawing && (
                      <Pin className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-auto">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 w-6 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white" align="end">
                        <DropdownMenuItem 
                          onClick={(e) => handleStartEdit(comment.id, comment.text, e)}
                          className="hover:bg-gray-700 focus:bg-gray-700"
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleCopyLink(comment.id, e)}
                          className="hover:bg-gray-700 focus:bg-gray-700"
                        >
                          <Pin className="h-3 w-3 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteComment(comment.id, e)}
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
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mb-2">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <button 
                      onClick={() => onCommentClick(comment.timestamp)}
                      className="hover:text-blue-400 cursor-pointer"
                    >
                      @{formatTimestamp(comment.timestamp)}
                    </button>
                  </div>
                )}

                <div className="mb-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white text-sm min-h-[60px]"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={(e) => handleSaveEdit(comment.id, e)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="border-gray-600 text-gray-300"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm break-words whitespace-pre-wrap leading-relaxed">
                      {comment.text}
                    </p>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleLike(comment.id, e)}
                          className={`text-xs h-6 px-2 ${
                            likes.isLiked ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-blue-400'
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {likes.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDislike(comment.id, e)}
                          className={`text-xs h-6 px-2 ${
                            likes.isDisliked ? 'text-red-400 bg-red-500/20' : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          {likes.dislikes}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleReplyClick(comment.id, e)}
                        className="text-xs text-gray-400 hover:text-white h-6 px-2"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CommentContextMenu>

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="ml-6 mb-3">
            <div className="flex space-x-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white text-sm min-h-[60px] flex-1"
              />
              <div className="flex flex-col space-y-1 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={(e) => handleReply(comment.id, e)}
                  disabled={!replyContent.trim()}
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
        {filteredComments.filter(reply => reply.parentId === comment.id).map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comments
          </h3>
          <CommentFilterMenu 
            filters={commentFilters}
            onFiltersChange={setCommentFilters}
            onClearFilters={clearCommentFilters}
          />
        </div>
        
        {/* Comment Type Filter */}
        <div className="mb-3">
          <CommentTypeFilter
            selectedType={commentType}
            onTypeChange={setCommentType}
            commentCounts={commentCounts}
          />
        </div>
        
        {/* Advanced Filters */}
        <AdvancedCommentFilters onFilterChange={setAdvancedFilters} />
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {filteredComments.filter(comment => !comment.parentId).map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        
        {filteredComments.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <h4 className="text-gray-400 font-medium">No comments found</h4>
            <p className="text-gray-500 text-sm">Try adjusting your filters or add a new comment</p>
          </div>
        )}
      </div>

      {/* New Comment Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex-shrink-0">
        <div className="space-y-3">
          <div className="relative">
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
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video && !video.paused) {
                  video.pause();
                }
              }}
              className={`bg-gray-700 border-gray-600 text-white min-h-[80px] resize-none ${
                attachTime ? 'pl-20' : ''
              }`}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAttachTimeToggle}
                className={`p-2 rounded-lg flex-shrink-0 ${
                  attachTime 
                    ? "text-blue-400 bg-blue-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-gray-600"
                }`}
                title={attachTime ? `Attach ${formatTimestamp(currentTime)}` : "Don't attach time"}
              >
                <Clock size={16} />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-600 p-2 rounded-lg flex-shrink-0"
                title="Attach files"
              >
                <Paperclip size={16} />
              </Button>
              
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-gray-600 p-2 rounded-lg"
                  >
                    <Globe size={16} />
                    <span className="ml-1 text-sm hidden sm:inline">{isInternal ? "Internal" : "Public"}</span>
                    <ChevronDown size={12} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white">
                  <DropdownMenuItem
                    onClick={(e) => handleVisibilityChange(false, e)}
                    className="hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <Globe size={14} className="mr-2" />
                    Public
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => handleVisibilityChange(true, e)}
                    className="hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="w-3 h-3 mr-2 rounded-full bg-orange-500"></div>
                    Internal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
