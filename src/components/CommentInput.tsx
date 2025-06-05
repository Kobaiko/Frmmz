
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Paperclip, Smile, Send, X, ChevronDown, Globe } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";
import { DrawingToolsMenu } from "./DrawingToolsMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentInputProps {
  currentTime: number;
  onAddComment: (text: string, attachments?: string[], isInternal?: boolean, attachTime?: boolean) => void;
  parentId?: string;
  onCancel?: () => void;
  placeholder?: string;
  onStartDrawing?: () => void;
  isDrawingMode?: boolean;
}

export const CommentInput = ({ 
  currentTime, 
  onAddComment, 
  parentId, 
  onCancel,
  placeholder = "Leave your comment...",
  onStartDrawing,
  isDrawingMode = false
}: CommentInputProps) => {
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isInternal, setIsInternal] = useState(false);
  const [attachTime, setAttachTime] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment.trim(), attachments, isInternal, attachTime);
      setComment("");
      setAttachments([]);
      setIsInternal(false);
      setAttachTime(true);
      if (onCancel) onCancel();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileUrls = files.map(file => URL.createObjectURL(file));
    setAttachments([...attachments, ...fileUrls]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji: string) => {
    setComment(comment + emoji);
    setShowEmojiPicker(false);
  };

  const toggleAttachTime = () => {
    setAttachTime(!attachTime);
  };

  const handleDrawingClick = () => {
    if (onStartDrawing) {
      onStartDrawing();
    }
    setShowDrawingTools(!showDrawingTools);
  };

  return (
    <div className="p-4 bg-gray-800/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {/* Attachments display */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative bg-gray-700 rounded-lg p-2 flex items-center space-x-2">
                <Paperclip size={14} className="text-gray-400" />
                <span className="text-xs text-gray-300 truncate max-w-32">
                  Attachment {index + 1}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAttachment(index)}
                  className="h-4 w-4 p-0 text-gray-400 hover:text-red-400"
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-700/50 rounded-lg p-3">
          {/* Main textarea */}
          <div className="mb-3">
            <Textarea
              placeholder={placeholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          {/* Bottom toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              
              {/* Time attach button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleAttachTime}
                className={`p-2 rounded-lg ${
                  attachTime 
                    ? "text-blue-400 bg-blue-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-gray-600"
                }`}
                title={attachTime ? `Attach ${formatTime(currentTime)}` : "Don't attach time"}
              >
                <Clock size={18} />
              </Button>
              
              {/* Attachment button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white hover:bg-gray-600 p-2 rounded-lg"
                title="Attach files"
              >
                <Paperclip size={18} />
              </Button>
              
              {/* Drawing tools button */}
              <div className="relative drawing-area" data-drawing-menu>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDrawingClick}
                  className={`p-2 rounded-lg ${
                    isDrawingMode || showDrawingTools
                      ? "text-blue-400 bg-blue-500/20" 
                      : "text-gray-400 hover:text-white hover:bg-gray-600"
                  }`}
                  title="Drawing tools"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="m2 2 7.586 7.586"/>
                    <circle cx="11" cy="11" r="2"/>
                  </svg>
                </Button>
                {showDrawingTools && (
                  <DrawingToolsMenu onClose={() => setShowDrawingTools(false)} />
                )}
              </div>
              
              {/* Emoji button */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-white hover:bg-gray-600 p-2 rounded-lg"
                  title="Add emoji"
                >
                  <Smile size={18} />
                </Button>
                {showEmojiPicker && (
                  <EmojiPicker onEmojiSelect={addEmoji} onClose={() => setShowEmojiPicker(false)} />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Public/Internal dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-gray-600 p-2 rounded-lg"
                  >
                    <Globe size={18} />
                    <span className="ml-1 text-sm">{isInternal ? "Internal" : "Public"}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white">
                  <DropdownMenuItem
                    onClick={() => setIsInternal(false)}
                    className="hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <Globe size={16} className="mr-2" />
                    Public
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsInternal(true)}
                    className="hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="w-4 h-4 mr-2 rounded-full bg-orange-500"></div>
                    Internal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Send button */}
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>

        {onCancel && (
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
