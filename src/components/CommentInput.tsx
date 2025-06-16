
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Smile, 
  Paperclip, 
  PenTool,
  Send,
  Globe
} from "lucide-react";

interface CommentInputProps {
  onAddComment: (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onCancel?: () => void;
  placeholder?: string;
  currentTime: number;
  onStartDrawing: () => void;
  isDrawingMode: boolean;
}

export const CommentInput = ({
  onAddComment,
  onCancel,
  placeholder = "Leave your comment...",
  currentTime,
  onStartDrawing,
  isDrawingMode
}: CommentInputProps) => {
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment.trim(), [], !isPublic, true, false);
      setComment("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-3">
      {/* Timestamp Badge */}
      <div className="flex items-center space-x-2">
        <Badge className="bg-yellow-500 text-black text-sm font-medium px-2 py-1">
          <Clock className="w-3 h-3 mr-1" />
          {formatTime(currentTime)}
        </Badge>
      </div>

      {/* Comment Input */}
      <div className="relative">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[80px] resize-none pr-12"
        />
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Drawing Tool */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartDrawing}
            className={`text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 p-0 ${
              isDrawingMode ? "bg-blue-600 text-white" : ""
            }`}
            title="Drawing tool"
          >
            <PenTool className="h-4 w-4" />
          </Button>

          {/* Attachment */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 p-0"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Emoji */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 p-0"
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Public/Private Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPublic(!isPublic)}
            className={`text-gray-400 hover:text-white hover:bg-gray-700 px-3 h-8 text-xs ${
              isPublic ? "bg-blue-600 text-white" : ""
            }`}
            title={isPublic ? "Public comment" : "Internal comment"}
          >
            <Globe className="h-3 w-3 mr-1" />
            Public
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Cancel Button for Replies */}
      {onCancel && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-white h-8"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
