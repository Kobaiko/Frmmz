
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Paperclip, Clock, PenTool, Send, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CommentInputProps {
  onAddComment: (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  onCancel?: () => void;
  placeholder?: string;
  currentTime: number;
  onStartDrawing?: () => void;
  isDrawingMode?: boolean;
  onPauseVideo?: () => void;
  hasActiveDrawing?: boolean;
}

export const CommentInput = ({ 
  onAddComment,
  onCancel,
  placeholder = "Add a comment...", 
  currentTime,
  onStartDrawing,
  isDrawingMode = false,
  onPauseVideo,
  hasActiveDrawing = false
}: CommentInputProps) => {
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isInternal, setIsInternal] = useState(false);
  const [attachTime, setAttachTime] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (comment.trim() || attachments.length > 0 || hasActiveDrawing) {
      console.log('CommentInput: Submitting with hasDrawing:', hasActiveDrawing);
      onAddComment(
        comment, 
        attachments, 
        isInternal, 
        attachTime,
        hasActiveDrawing
      );
      
      // Reset form
      setComment('');
      setAttachments([]);
      setIsInternal(false);
      setAttachTime(false);
      
      // Call onCancel if provided to close reply mode
      onCancel?.();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
      
      // Pause video when adding attachments
      onPauseVideo?.();
      
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (!isExpanded && e.target.value.length > 0) {
                setIsExpanded(true);
              }
            }}
            placeholder={isDrawingMode ? "Add a note to your drawing..." : placeholder}
            className="min-h-[60px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-none pr-10"
            onFocus={() => setIsExpanded(true)}
          />
          
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 bottom-2 bg-pink-600 hover:bg-pink-700 text-white p-1.5 rounded-full"
            disabled={!comment.trim() && attachments.length === 0 && !hasActiveDrawing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Show drawing indicator when there's an active drawing */}
        {hasActiveDrawing && (
          <div className="flex items-center space-x-2 bg-pink-500/20 text-pink-400 px-2 py-1 rounded-md text-xs">
            <PenTool className="h-3 w-3" />
            <span>Drawing attached</span>
          </div>
        )}
        
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="relative bg-gray-600 rounded p-2 text-xs flex items-center">
                <span className="text-gray-300 truncate max-w-[150px]">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="ml-2 h-5 w-5 p-0 text-gray-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Comment options */}
        {(isExpanded || isDrawingMode) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* File attachment button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-white p-1.5"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 border-gray-700 text-white">
                  Attach files
                </TooltipContent>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              
              {/* Timestamp toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant={attachTime ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setAttachTime(!attachTime)}
                      className={`text-gray-400 hover:text-white p-1.5 ${
                        attachTime ? 'bg-gray-600 text-white' : ''
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    {attachTime && (
                      <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 border-gray-700 text-white">
                  {attachTime ? 'Remove timestamp' : 'Add timestamp'}
                </TooltipContent>
              </Tooltip>
              
              {/* Drawing tool button */}
              {!isDrawingMode && onStartDrawing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onStartDrawing}
                      className="text-gray-400 hover:text-white p-1.5"
                    >
                      <PenTool className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 border-gray-700 text-white">
                    Add drawing
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Drawing mode indicator */}
              {isDrawingMode && (
                <div className="flex items-center space-x-2 bg-pink-500/20 text-pink-400 px-2 py-1 rounded-md text-xs">
                  <PenTool className="h-3 w-3" />
                  <span>Drawing Mode</span>
                </div>
              )}
            </div>
            
            {/* Internal comment toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="internal-mode"
                checked={isInternal}
                onCheckedChange={setIsInternal}
                className="data-[state=checked]:bg-gray-500"
              />
              <Label htmlFor="internal-mode" className="text-xs text-gray-400">
                Internal only
              </Label>
            </div>
          </div>
        )}
        
        {/* Cancel button for reply mode */}
        {onCancel && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </TooltipProvider>
  );
};
