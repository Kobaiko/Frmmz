
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Paperclip, Send, Palette, Square, MousePointer2, Minus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface CommentInputProps {
  currentTime: number;
  onAddComment: (text: string, attachments?: string[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => void;
  placeholder?: string;
  onStartDrawing?: () => void;
  isDrawingMode?: boolean;
}

export const CommentInput = ({ 
  currentTime, 
  onAddComment, 
  placeholder = "Leave your comment...",
  onStartDrawing,
  isDrawingMode = false
}: CommentInputProps) => {
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [attachTime, setAttachTime] = useState(true);
  const [hasDrawing, setHasDrawing] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      console.log('Submitting comment with drawing:', hasDrawing);
      onAddComment(comment.trim(), [], isInternal, attachTime, hasDrawing);
      setComment("");
      setIsInternal(false);
      setAttachTime(true);
      setHasDrawing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDrawingClick = () => {
    console.log('Drawing button clicked - starting drawing mode');
    setHasDrawing(true);
    if (onStartDrawing) {
      onStartDrawing();
    }
  };

  return (
    <div className="p-6 bg-gray-800">
      <div className="space-y-4">
        {/* Comment textarea */}
        <div className="relative">
          <Textarea
            placeholder={placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none min-h-[100px] pr-12"
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!comment.trim()}
            className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0"
          >
            <Send size={14} />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Drawing tools */}
            <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDrawingClick}
                className={`text-gray-400 hover:text-white p-2 h-8 w-8 ${hasDrawing ? 'bg-blue-600 text-white' : ''}`}
                title="Enable drawing mode"
              >
                <Palette size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if ((window as any).drawingCanvas) {
                    (window as any).drawingCanvas.setTool('pen');
                  }
                }}
                className="text-gray-400 hover:text-white p-2 h-8 w-8"
                title="Pen tool"
              >
                <MousePointer2 size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if ((window as any).drawingCanvas) {
                    (window as any).drawingCanvas.setTool('line');
                  }
                }}
                className="text-gray-400 hover:text-white p-2 h-8 w-8"
                title="Line tool"
              >
                <Minus size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if ((window as any).drawingCanvas) {
                    (window as any).drawingCanvas.setTool('square');
                  }
                }}
                className="text-gray-400 hover:text-white p-2 h-8 w-8"
                title="Rectangle tool"
              >
                <Square size={14} />
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white p-2"
            >
              <Paperclip size={16} />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timestamp display */}
            {attachTime && (
              <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium">
                <Clock size={14} />
                <span>{formatTime(currentTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attach-time"
                checked={attachTime}
                onCheckedChange={(checked) => setAttachTime(checked as boolean)}
              />
              <label htmlFor="attach-time" className="text-sm text-gray-300">
                Attach timestamp
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="internal-comment"
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked as boolean)}
              />
              <label htmlFor="internal-comment" className="text-sm text-gray-300">
                Internal comment
              </label>
            </div>

            {hasDrawing && (
              <div className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                <Palette size={12} />
                <span>Has drawing</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
