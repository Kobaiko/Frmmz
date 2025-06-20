import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CommentInput } from "./CommentInput";
import { CommentFilterMenu } from "./CommentFilterMenu";
import { CommentSortMenu } from "./CommentSortMenu";
import { CommentActionsMenu } from "./CommentActionsMenu";
import { 
  MessageSquare, 
  Filter, 
  SortAsc, 
  Search, 
  Clock,
  Reply,
  Heart,
  MoreVertical,
  Pencil,
  PenTool,
  X
} from "lucide-react";

// Comment interface to match VideoComment from AssetViewer
interface Comment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor?: string;
  createdAt: Date;
  resolved?: boolean;
  replies?: Comment[];
  attachments?: any[];
  hasDrawing?: boolean;
  hasTimestamp?: boolean;
  parentId?: string;
  // Legacy properties for backward compatibility
  text?: string;
  isInternal?: boolean;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'general' | 'internal' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'timestamp'>('timestamp');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    annotations: false,
    attachments: false,
    completed: false,
    incomplete: false,
    unread: false,
    mentionsAndReactions: false,
  });

  // Normalize comments to ensure consistent interface
  const normalizedComments = React.useMemo(() => {
    console.log('Normalizing comments:', comments);
    return comments.map(comment => ({
      ...comment,
      text: comment.content || comment.text || '',
      content: comment.content || comment.text || '',
      isInternal: comment.isInternal ?? false,
      hasDrawing: comment.hasDrawing ?? false,
    }));
  }, [comments]);

  // Process comments to separate top-level comments from replies
  const { topLevelComments, repliesMap } = React.useMemo(() => {
    const topLevel = normalizedComments.filter(comment => !comment.parentId);
    const replies = normalizedComments.filter(comment => comment.parentId);
    
    const repliesMap: { [key: string]: Comment[] } = {};
    replies.forEach(reply => {
      if (reply.parentId) {
        if (!repliesMap[reply.parentId]) {
          repliesMap[reply.parentId] = [];
        }
        repliesMap[reply.parentId].push(reply);
      }
    });
    
    console.log('Processed comments:', { topLevel, repliesMap });
    return { topLevelComments: topLevel, repliesMap };
  }, [normalizedComments]);

  // Sort and filter top-level comments
  const processedComments = React.useMemo(() => {
    console.log('Processing comments with filters:', { searchQuery, filterType, sortBy, filters });
    
    let filtered = [...topLevelComments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comment => {
        const searchText = comment.content.toLowerCase();
        const authorText = comment.author.toLowerCase();
        return searchText.includes(query) || authorText.includes(query);
      });
    }

    // Apply type filter
    if (filterType === 'general') {
      filtered = filtered.filter(comment => !comment.isInternal);
    } else if (filterType === 'internal') {
      filtered = filtered.filter(comment => comment.isInternal);
    } else if (filterType === 'resolved') {
      filtered = filtered.filter(comment => comment.resolved);
    }

    // Apply additional filters
    if (filters.annotations) {
      filtered = filtered.filter(comment => comment.hasDrawing);
    }
    if (filters.attachments) {
      filtered = filtered.filter(comment => comment.attachments && comment.attachments.length > 0);
    }
    if (filters.completed) {
      filtered = filtered.filter(comment => comment.resolved);
    }
    if (filters.incomplete) {
      filtered = filtered.filter(comment => !comment.resolved);
    }

    // Sort comments
    const sorted = [...filtered].sort((a, b) => {
      console.log('Sorting with:', sortBy);
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'timestamp':
          if (a.timestamp === -1 && b.timestamp === -1) return 0;
          if (a.timestamp === -1) return 1;
          if (b.timestamp === -1) return -1;
          return a.timestamp - b.timestamp;
        default:
          return 0;
      }
    });

    console.log('Final processed comments:', sorted);
    return sorted;
  }, [topLevelComments, searchQuery, filterType, sortBy, filters]);

  // Get all visible comments including replies for export/copy functions
  const allVisibleComments = React.useMemo(() => {
    const result: Comment[] = [];
    processedComments.forEach(comment => {
      result.push(comment);
      const replies = repliesMap[comment.id] || [];
      result.push(...replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    });
    console.log('All visible comments for actions:', result);
    return result;
  }, [processedComments, repliesMap]);

  const formatTime = (seconds: number) => {
    if (seconds === -1) return 'General';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleReply = (commentId: string) => {
    console.log('handleReply triggered:', { commentId });
    setReplyingTo(commentId);
  };

  const handleSubmitReply = (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    console.log('handleSubmitReply called:', { replyingTo, text });
    if (replyingTo) {
      onReplyComment(replyingTo, text, attachments, isInternal, attachTime, hasDrawing);
      setReplyingTo(null);
    }
  };

  const handleCancelReply = () => {
    console.log('handleCancelReply called');
    setReplyingTo(null);
  };

  const toggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const handleSortChange = (sort: 'timecode' | 'oldest' | 'newest' | 'commenter' | 'completed') => {
    console.log('Sort changed to:', sort);
    if (sort === 'timecode') {
      setSortBy('timestamp');
    } else if (sort === 'oldest') {
      setSortBy('oldest');
    } else if (sort === 'newest') {
      setSortBy('newest');
    } else {
      setSortBy('newest');
    }
  };

  const clearFilters = () => {
    console.log('Clearing filters');
    setFilters({
      annotations: false,
      attachments: false,
      completed: false,
      incomplete: false,
      unread: false,
      mentionsAndReactions: false,
    });
    setSearchQuery("");
    setFilterType('all');
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
  };

  // Render a comment with optional reply functionality
  const renderComment = (comment: Comment, isReply = false) => {
    const isExpanded = expandedComments.has(comment.id);
    const replies = repliesMap[comment.id] || [];
    const hasReplies = replies.length > 0;
    const isCurrentlyReplying = replyingTo === comment.id;

    return (
      <div 
        key={comment.id}
        className={`${isReply ? 'ml-8 border-l-2 border-gray-600 pl-4 mt-2' : ''} space-y-3`}
      >
        <div className={`flex space-x-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors group ${isReply ? 'bg-gray-800/20' : ''}`}>
          <Avatar className={`w-8 h-8 ${comment.authorColor ? '' : getAvatarColor(comment.author)} flex-shrink-0`} style={comment.authorColor ? {backgroundColor: comment.authorColor} : {}}>
            <AvatarFallback className="text-white text-xs font-medium">
              {getInitials(comment.author)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">{comment.author}</span>
                {comment.timestamp !== -1 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-pink-600 text-pink-400 cursor-pointer hover:bg-pink-600/10"
                    onClick={() => onCommentClick(comment.timestamp)}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(comment.timestamp)}
                  </Badge>
                )}
                {comment.hasDrawing && (
                  <Badge variant="secondary" className="text-xs bg-pink-600/20 text-pink-400 border-0">
                    <PenTool className="w-3 h-3 mr-1" />
                    Drawing
                  </Badge>
                )}
                {comment.isInternal && (
                  <Badge variant="secondary" className="text-xs bg-orange-600/20 text-orange-400 border-0">
                    Internal
                  </Badge>
                )}
                {isReply && (
                  <Badge variant="secondary" className="text-xs bg-blue-600/20 text-blue-400 border-0">
                    Reply
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => handleReply(comment.id)}
                >
                  <Reply className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 leading-relaxed text-left">
              {comment.content}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  <Heart className="w-3 h-3" />
                  <span>0</span>
                </button>
                
                {hasReplies && !isReply && (
                  <button 
                    onClick={() => toggleExpanded(comment.id)}
                    className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    {isExpanded ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {isCurrentlyReplying && (
          <div className={`${isReply ? 'ml-0' : 'ml-11'}`}>
            <CommentInput
              onAddComment={(text, attachments, isInternal, attachTime, hasDrawing) => {
                console.log('Reply submitted with parent:', comment.id);
                handleSubmitReply(text, attachments, isInternal, attachTime, hasDrawing);
              }}
              onCancel={handleCancelReply}
              placeholder={`Reply to ${comment.author}...`}
              currentTime={currentTime}
              onStartDrawing={onStartDrawing}
              isDrawingMode={isDrawingMode}
              replyingTo={comment.author}
            />
          </div>
        )}
        
        {hasReplies && !isReply && (isExpanded || replies.length <= 3) && (
          <div className="space-y-0">
            {replies
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  console.log('CommentPanel render - current state:', { 
    replyingTo, 
    commentsCount: comments.length, 
    processedCount: processedComments.length,
    sortBy,
    filterType,
    searchQuery,
    allVisibleCommentsCount: allVisibleComments.length
  });

  return (
    <div className="h-full bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-white">All comments</h2>
            <Badge variant="outline" className="border-gray-600 text-gray-400">
              {allVisibleComments.length}
            </Badge>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <CommentActionsMenu
              comments={allVisibleComments}
            />
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => {
              console.log('Search query changed:', e.target.value);
              setSearchQuery(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        {/* Sort and Filter */}
        <div className="flex items-center justify-between">
          <CommentSortMenu 
            sortBy={sortBy === 'timestamp' ? 'timecode' : sortBy === 'oldest' ? 'oldest' : 'newest'}
            onSortChange={handleSortChange}
          />
          <CommentFilterMenu 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
      
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {processedComments.length > 0 ? (
            processedComments.map(comment => renderComment(comment))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No comments yet</p>
              <p className="text-sm text-gray-500">Be the first to add a comment</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Comment */}
      <div className="p-4 border-t border-gray-700">
        <CommentInput
          onAddComment={onAddComment}
          placeholder="Add a comment..."
          currentTime={currentTime}
          onStartDrawing={onStartDrawing}
          isDrawingMode={isDrawingMode}
        />
      </div>
    </div>
  );
};
