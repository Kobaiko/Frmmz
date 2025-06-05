
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Paperclip, Smile, Send, X, Square, Circle, Minus, ChevronDown } from "lucide-react";
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
}

export const CommentInput = ({ 
  currentTime, 
  onAddComment, 
  parentId, 
  onCancel,
  placeholder = "Leave your feedback..." 
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

  return (
    <div className="p-4 bg-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Top controls row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={attachTime ? "default" : "outline"}
              size="sm"
              onClick={toggleAttachTime}
              className={`${
                attachTime 
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
                  : "bg-gray-700 text-gray-300 border-gray-600"
              } text-xs font-medium`}
            >
              <Clock size={14} className="mr-1" />
              {attachTime ? `Attach ${formatTime(currentTime)}` : "Don't attach time"}
            </Button>
            
            {parentId && (
              <span className="text-xs text-gray-400">Replying to comment</span>
            )}
          </div>

          {/* Comment type selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isInternal ? "Internal" : "Public"}
                <ChevronDown size={14} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white">
              <DropdownMenuItem
                onClick={() => setIsInternal(false)}
                className="hover:bg-gray-700 focus:bg-gray-700"
              >
                Public
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsInternal(true)}
                className="hover:bg-gray-700 focus:bg-gray-700"
              >
                Internal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              placeholder={placeholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none min-h-[60px]"
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white p-2"
              title="Attach files"
            >
              <Paperclip size={16} />
            </Button>
            
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDrawingTools(!showDrawingTools)}
                className="text-gray-400 hover:text-white p-2"
                title="Drawing tools"
              >
                <Square size={16} />
              </Button>
              {showDrawingTools && (
                <DrawingToolsMenu onClose={() => setShowDrawingTools(false)} />
              )}
            </div>
            
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-white p-2"
                title="Add emoji"
              >
                <Smile size={16} />
              </Button>
              {showEmojiPicker && (
                <EmojiPicker onEmojiSelect={addEmoji} onClose={() => setShowEmojiPicker(false)} />
              )}
            </div>
            
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!comment.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              <Send size={14} />
            </Button>
            
            {onCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
