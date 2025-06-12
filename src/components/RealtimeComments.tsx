
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Clock, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Users
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RealtimeComment {
  id: string;
  content: string;
  timestamp: number;
  videoTime: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    color: string;
  };
  isNew?: boolean;
  viewers: string[]; // User IDs who have seen this comment
  replies: RealtimeComment[];
}

interface RealtimeCommentsProps {
  comments: RealtimeComment[];
  currentUserId: string;
  currentVideoTime: number;
  onCommentView: (commentId: string) => void;
  onJumpToTime: (time: number) => void;
}

export const RealtimeComments = ({ 
  comments, 
  currentUserId, 
  currentVideoTime,
  onCommentView,
  onJumpToTime 
}: RealtimeCommentsProps) => {
  const [newComments, setNewComments] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Track new comments for highlighting
    const newIds = new Set<string>();
    comments.forEach(comment => {
      if (comment.isNew && !comment.viewers.includes(currentUserId)) {
        newIds.add(comment.id);
      }
    });
    setNewComments(newIds);

    // Auto-mark as viewed after 3 seconds
    if (newIds.size > 0) {
      const timer = setTimeout(() => {
        newIds.forEach(id => onCommentView(id));
        setNewComments(new Set());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [comments, currentUserId, onCommentView]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleJumpToTime = (time: number) => {
    onJumpToTime(time);
    toast({
      title: "Jumped to timestamp",
      description: `Playing from ${formatVideoTime(time)}`
    });
  };

  const sortedComments = [...comments].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {sortedComments.map((comment) => {
        const isExpanded = expandedComments.has(comment.id);
        const isNew = newComments.has(comment.id);
        const viewerCount = comment.viewers.length;
        
        return (
          <Card 
            key={comment.id} 
            className={`bg-gray-800 border-gray-700 transition-all duration-300 ${
              isNew ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 border-2" style={{ borderColor: comment.author.color }}>
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback 
                    className="text-xs text-white"
                    style={{ backgroundColor: comment.author.color }}
                  >
                    {comment.author.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{comment.author.name}</span>
                      {isNew && (
                        <Badge className="bg-blue-600 text-xs">New</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{viewerCount}</span>
                      </div>
                      <span>•</span>
                      <span>{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleJumpToTime(comment.videoTime)}
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {formatVideoTime(comment.videoTime)}
                    </Button>
                    
                    {comment.replies.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpanded(comment.id)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {comment.replies.length} replies
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Replies */}
                  {isExpanded && comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-600 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.author.avatar} />
                            <AvatarFallback 
                              className="text-xs text-white"
                              style={{ backgroundColor: reply.author.color }}
                            >
                              {reply.author.name.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-white">{reply.author.name}</span>
                              <span className="text-xs text-gray-400">{formatTimeAgo(reply.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-300">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No comments yet</h3>
          <p className="text-gray-500">Be the first to share your feedback</p>
        </div>
      )}
    </div>
  );
};
