
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MessageSquare, Reply, Trash2, Paperclip } from "lucide-react";
import { CommentInput } from "@/components/CommentInput";
import type { Comment } from "@/pages/Index";

interface CommentPanelProps {
  comments: Comment[];
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onDeleteComment: (commentId: string) => void;
  onReplyComment: (parentId: string, text: string, attachments?: string[]) => void;
}

export const CommentPanel = ({
  comments,
  currentTime,
  onCommentClick,
  onDeleteComment,
  onReplyComment,
}: CommentPanelProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

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
    return comments.filter(comment => !comment.parentId);
  };

  const getReplies = (parentId: string) => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  const handleReply = (parentId: string, text: string, attachments?: string[]) => {
    onReplyComment(parentId, text, attachments);
    setReplyingTo(null);
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
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock size={14} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {getTopLevelComments().length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No comments yet</p>
              <p className="text-sm">Be the first to leave feedback!</p>
            </div>
          ) : (
            getTopLevelComments().map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200">
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
                      <Reply size={12} />
                      <span>Reply</span>
                    </Button>
                  </div>
                </div>

                {replyingTo === comment.id && (
                  <div className="ml-6 bg-gray-750 rounded-lg border border-gray-600">
                    <CommentInput
                      currentTime={currentTime}
                      onAddComment={(text, attachments) => handleReply(comment.id, text, attachments)}
                      parentId={comment.id}
                      onCancel={() => setReplyingTo(null)}
                      placeholder="Write a reply..."
                    />
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
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
