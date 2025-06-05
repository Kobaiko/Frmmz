import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Clock, MessageSquare, Reply, Trash2, Paperclip, Smile, Send, Search } from "lucide-react";
import { CommentInput } from "@/components/CommentInput";
import { Textarea } from "@/components/ui/textarea";
import { CommentContextMenu } from "@/components/CommentContextMenu";
import { CommentFilterMenu, type CommentFilters } from "@/components/CommentFilterMenu";
import { CommentSortMenu, type SortOption } from "@/components/CommentSortMenu";
import { CommentActionsMenu } from "@/components/CommentActionsMenu";
import { CommentTypeFilter, type CommentType } from "@/components/CommentTypeFilter";
import type { Comment } from "@/pages/Index";

interface CommentPanelProps {
  comments: Comment[];
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onDeleteComment: (commentId: string) => void;
  onReplyComment: (parentId: string, text: string, attachments?: string[], isInternal?: boolean, attachTime?: boolean) => void;
  onAddComment: (text: string, attachments?: string[], isInternal?: boolean, attachTime?: boolean) => void;
  onStartDrawing?: () => void;
  isDrawingMode?: boolean;
}

export const CommentPanel = ({
  comments,
  currentTime,
  onCommentClick,
  onDeleteComment,
  onReplyComment,
  onAddComment,
  onStartDrawing,
  isDrawingMode = false,
}: CommentPanelProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommentType, setSelectedCommentType] = useState<CommentType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('timecode');
  const [filters, setFilters] = useState<CommentFilters>({
    annotations: false,
    attachments: false,
    completed: false,
    incomplete: false,
    unread: false,
    mentionsAndReactions: false,
  });

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

  const getTopLevelComments = () => {
    let filteredComments = comments.filter(comment => !comment.parentId);

    // Apply search filter
    if (searchTerm) {
      filteredComments = filteredComments.filter(comment =>
        comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedCommentType === 'public') {
      filteredComments = filteredComments.filter(comment => !comment.text.includes('internal'));
    } else if (selectedCommentType === 'internal') {
      filteredComments = filteredComments.filter(comment => comment.text.includes('internal'));
    }

    // Apply advanced filters
    if (filters.attachments) {
      filteredComments = filteredComments.filter(comment => comment.attachments && comment.attachments.length > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        return filteredComments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'newest':
        return filteredComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'commenter':
        return filteredComments.sort((a, b) => a.author.localeCompare(b.author));
      case 'timecode':
      default:
        return filteredComments.sort((a, b) => a.timestamp - b.timestamp);
    }
  };

  const getReplies = (parentId: string) => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  const getCommentCounts = () => {
    const topLevel = comments.filter(comment => !comment.parentId);
    return {
      all: topLevel.length,
      public: topLevel.filter(comment => !comment.text.includes('internal')).length,
      internal: topLevel.filter(comment => comment.text.includes('internal')).length,
    };
  };

  const handleReply = (parentId: string) => {
    if (replyText.trim()) {
      onReplyComment(parentId, replyText.trim());
      setReplyText("");
      setReplyingTo(null);
    }
  };

  const handleCancel = () => {
    setReplyText("");
    setReplyingTo(null);
  };

  const handleClearFilters = () => {
    setFilters({
      annotations: false,
      attachments: false,
      completed: false,
      incomplete: false,
      unread: false,
      mentionsAndReactions: false,
    });
    setSearchTerm("");
    setSelectedCommentType('all');
    setSortBy('timecode');
  };

  const handleCopyComments = () => {
    const visibleComments = getTopLevelComments();
    const commentText = visibleComments.map(comment => 
      `${formatTime(comment.timestamp)} - ${comment.author}: ${comment.text}`
    ).join('\n');
    navigator.clipboard.writeText(commentText);
    console.log('Comments copied to clipboard');
  };

  const handleExportComments = () => {
    const visibleComments = getTopLevelComments();
    const csvContent = [
      'Timestamp,Author,Text,Created At',
      ...visibleComments.map(comment => 
        `${formatTime(comment.timestamp)},${comment.author},"${comment.text}",${comment.createdAt.toISOString()}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comments.csv';
    a.click();
    console.log('Comments exported');
  };

  const handleEditComment = (commentId: string) => {
    console.log('Edit comment:', commentId);
  };

  const handleCopyLink = (commentId: string) => {
    const url = `${window.location.href}#comment-${commentId}`;
    navigator.clipboard.writeText(url);
    console.log('Comment link copied');
  };

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageSquare size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Comments</h2>
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
              {getTopLevelComments().length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CommentFilterMenu
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
            <CommentActionsMenu
              onCopyComments={handleCopyComments}
              onPasteComments={() => console.log('Paste comments')}
              onPrintComments={() => console.log('Print comments')}
              onExportComments={handleExportComments}
            />
          </div>
        </div>

        <div className="mb-4">
          <CommentTypeFilter
            selectedType={selectedCommentType}
            onTypeChange={setSelectedCommentType}
            commentCounts={getCommentCounts()}
          />
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <CommentSortMenu
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock size={14} />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {getTopLevelComments().length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No comments found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            getTopLevelComments().map((comment) => (
              <div key={comment.id} className="space-y-3">
                <CommentContextMenu
                  onEdit={() => handleEditComment(comment.id)}
                  onCopyLink={() => handleCopyLink(comment.id)}
                  onDelete={() => onDeleteComment(comment.id)}
                >
                  <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => onCommentClick(comment.timestamp)}
                        className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                      >
                        <Clock size={12} />
                        <span>{formatTime(comment.timestamp)}</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-200 mb-3 leading-relaxed">{comment.text}</p>
                    
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {comment.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-1 bg-gray-600 rounded px-2 py-1">
                            <Paperclip size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-300">Attachment {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {comment.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{comment.author}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-gray-400 hover:text-blue-400 text-xs"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>

                  {replyingTo === comment.id && (
                    <div className="ml-6 bg-gray-700 rounded-lg border border-gray-600 p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">U</span>
                        </div>
                        <span className="text-sm text-gray-300">Yair Kivaiko</span>
                        <span className="text-xs text-gray-500">9m</span>
                        <div className="ml-auto flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                          <Clock size={10} />
                          <span>{formatTime(currentTime)}</span>
                        </div>
                      </div>
                      
                      <Textarea
                        placeholder="Leave your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none min-h-[80px] mb-3"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white p-2"
                          >
                            <Paperclip size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white p-2"
                          >
                            <Smile size={16} />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {getReplies(comment.id).map((reply) => (
                    <div key={reply.id} className="ml-6 p-3 bg-gray-750 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => onCommentClick(reply.timestamp)}
                          className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium hover:bg-yellow-500/30 transition-colors"
                        >
                          <Clock size={10} />
                          <span>{formatTime(reply.timestamp)}</span>
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteComment(reply.id)}
                          className="h-5 w-5 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={10} />
                        </Button>
                      </div>
                      
                      <p className="text-gray-200 text-sm mb-2">{reply.text}</p>
                      
                      {reply.attachments && reply.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {reply.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-1 bg-gray-600 rounded px-1 py-0.5">
                              <Paperclip size={10} className="text-gray-400" />
                              <span className="text-xs text-gray-300">File {index + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {reply.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{reply.author}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CommentContextMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Comment input at the bottom */}
      <div className="border-t border-gray-700">
        <CommentInput
          currentTime={currentTime}
          onAddComment={onAddComment}
          placeholder="Leave your comment..."
          onStartDrawing={onStartDrawing}
          isDrawingMode={isDrawingMode}
        />
      </div>
    </div>
  );
};
