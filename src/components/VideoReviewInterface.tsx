
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Send
} from "lucide-react";

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor: string;
  createdAt: Date;
  resolved?: boolean;
}

interface VideoReviewInterfaceProps {
  comments: VideoComment[];
  onAddComment: (timestamp: number, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
}

export const VideoReviewInterface = ({ 
  comments, 
  onAddComment, 
  onDeleteComment,
  currentTime,
  onCommentClick
}: VideoReviewInterfaceProps) => {
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(currentTime, newComment.trim());
      setNewComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddComment();
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.author.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-gray-400" />
            <span className="text-white font-medium">Comments</span>
            <Badge className="bg-gray-700 text-gray-300">{comments.length}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search comments..."
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No comments found</p>
            {searchQuery && (
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your filters or search terms
              </p>
            )}
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback 
                    className="text-white text-sm"
                    style={{ backgroundColor: comment.authorColor }}
                  >
                    {comment.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium text-sm">{comment.author}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCommentClick(comment.timestamp)}
                      className="text-gray-400 hover:text-white text-xs px-2 py-1 h-auto"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(comment.timestamp)}
                    </Button>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-2">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-xs">
                      {comment.createdAt.toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-400 text-xs px-2 py-1 h-auto"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span className="text-yellow-500 text-sm font-medium">
            {formatTime(currentTime)}
          </span>
        </div>
        
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Leave your comment..."
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[80px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">
              Press ⌘+Enter to send
            </span>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
