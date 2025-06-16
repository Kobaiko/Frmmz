
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
  Send,
  ArrowLeft,
  Download,
  Share2,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX
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
  asset: any;
  comments: VideoComment[];
  onAddComment: (timestamp: number, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onBack: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isMuted: boolean;
  showControls: boolean;
  onMouseMove: () => void;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

export const VideoReviewInterface = ({ 
  asset,
  comments, 
  onAddComment, 
  onDeleteComment,
  currentTime,
  onCommentClick,
  onBack,
  videoRef,
  isPlaying,
  duration,
  volume,
  isMuted,
  showControls,
  onMouseMove,
  onTogglePlayPause,
  onToggleMute,
  onSeek,
  formatTime,
  progress
}: VideoReviewInterfaceProps) => {
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="h-full w-full bg-black flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-white font-medium">{asset.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div 
          className="flex-1 relative bg-black flex items-center justify-center"
          onMouseMove={onMouseMove}
        >
          {asset.file_type === 'video' ? (
            <>
              <video
                ref={videoRef}
                src={asset.file_url}
                className="max-w-full max-h-full object-contain"
                playsInline
                controls={false}
              />
              
              {/* Video Controls Overlay */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="p-6">
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-2 bg-gray-700 rounded-full mb-4 cursor-pointer group"
                    onClick={onSeek}
                  >
                    <div 
                      className="h-full bg-pink-500 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={onTogglePlayPause}
                        className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      
                      <div className="text-white text-lg font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="text-white text-sm opacity-75">
                      {Math.round(progress)}% complete
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Preview not available for {asset.file_type} files</p>
                <Button 
                  onClick={() => window.open(asset.file_url, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Open File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Panel */}
      {asset.file_type === 'video' && (
        <div className="w-96 border-l border-gray-700 flex-shrink-0 bg-gray-800 flex flex-col">
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
      )}
    </div>
  );
};
