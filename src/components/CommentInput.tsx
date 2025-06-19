
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmojiPicker } from "./EmojiPicker";
import { DrawingToolsMenu } from "./DrawingToolsMenu";
import { 
  Clock, 
  Smile, 
  Paperclip, 
  PenTool,
  Send,
  Globe,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  File
} from "lucide-react";

interface CommentInputProps {
  onAddComment: (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onCancel?: () => void;
  placeholder?: string;
  currentTime: number;
  onStartDrawing: () => void;
  isDrawingMode: boolean;
  onPauseVideo?: () => void;
}

export const CommentInput = ({
  onAddComment,
  onCancel,
  placeholder = "Leave your comment...",
  currentTime,
  onStartDrawing,
  isDrawingMode,
  onPauseVideo
}: CommentInputProps) => {
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [attachTime, setAttachTime] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkForDrawings = () => {
    // Check if there are any drawings for current frame
    if ((window as any).drawingCanvas) {
      const hasDrawingsForFrame = (window as any).drawingCanvas.hasDrawingsForCurrentFrame();
      setHasDrawing(hasDrawingsForFrame);
      return hasDrawingsForFrame;
    }
    return false;
  };

  const handleSubmit = () => {
    // Always check for drawings right before submitting
    const currentHasDrawing = checkForDrawings();
    
    if (comment.trim() || attachments.length > 0 || currentHasDrawing) {
      onAddComment(comment.trim(), attachments, !isPublic, attachTime, currentHasDrawing);
      setComment("");
      setAttachments([]);
      setHasDrawing(false);
      
      // Reset drawing mode after submitting
      if (isDrawingMode) {
        setShowDrawingTools(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrawingClick = () => {
    // Always pause video when entering drawing mode
    if (onPauseVideo) {
      onPauseVideo();
    }
    
    if (isDrawingMode) {
      setShowDrawingTools(!showDrawingTools);
    } else {
      onStartDrawing();
      setShowDrawingTools(true);
    }
    
    // Check for drawings after a short delay to allow drawing mode to activate
    setTimeout(() => {
      checkForDrawings();
    }, 100);
  };

  // Periodically check for drawings when in drawing mode
  React.useEffect(() => {
    if (isDrawingMode) {
      const interval = setInterval(() => {
        checkForDrawings();
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isDrawingMode]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-3">
      {/* Timestamp Badge */}
      {attachTime && (
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-500 text-black text-sm font-medium px-2 py-1">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(currentTime)}
          </Badge>
        </div>
      )}

      {/* Drawing indicator */}
      {hasDrawing && (
        <div className="flex items-center space-x-2">
          <Badge className="bg-pink-500 text-white text-sm font-medium px-2 py-1">
            <PenTool className="w-3 h-3 mr-1" />
            Drawing attached
          </Badge>
        </div>
      )}

      {/* Attachments Display */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-2">
              <div className="flex items-center space-x-2">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-white w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

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
          {/* Clock/Time Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttachTime(!attachTime)}
            className={`text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 p-0 ${
              attachTime ? "bg-yellow-600 text-white" : ""
            }`}
            title={attachTime ? "Remove timestamp" : "Add timestamp"}
          >
            <Clock className="h-4 w-4" />
          </Button>

          {/* Attachment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileAttach}
            className="text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 p-0"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
          />

          {/* Drawing Tool with Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDrawingClick}
              className={`text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 p-0 ${
                isDrawingMode ? "bg-pink-600 text-white" : ""
              }`}
              title="Drawing tool"
            >
              <PenTool className="h-4 w-4" />
            </Button>
            
            {showDrawingTools && (
              <DrawingToolsMenu onClose={() => setShowDrawingTools(false)} />
            )}
          </div>

          {/* Emoji Picker */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-white hover:bg-gray-700 w-10 h-10 p-0"
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>

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
          disabled={!comment.trim() && attachments.length === 0 && !hasDrawing}
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
