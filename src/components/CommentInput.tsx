
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Smile, Send, Clock, Lock } from "lucide-react";
import { DrawingToolsMenu } from "@/components/DrawingToolsMenu";

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
  isDrawingMode = false,
}: CommentInputProps) => {
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [attachTime, setAttachTime] = useState(true);
  const [hasDrawing, setHasDrawing] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (text.trim()) {
      // If there's a drawing, force attachTime to true
      const shouldAttachTime = hasDrawing || attachTime;
      onAddComment(text.trim(), [], isInternal, shouldAttachTime, hasDrawing);
      setText("");
      setHasDrawing(false);
      setAttachTime(true);
    }
  };

  const handleStartDrawing = () => {
    console.log('Drawing mode started from comment input');
    setHasDrawing(true);
    setAttachTime(true); // Force timestamp when drawing
    if (onStartDrawing) {
      onStartDrawing();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-6 bg-gray-800">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-sm text-white font-medium">U</span>
        </div>
        <span className="text-sm text-gray-300">Yair Kivaiko</span>
        <span className="text-xs text-gray-500">now</span>
        
        {attachTime && (
          <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
            <Clock size={10} />
            <span>{formatTime(currentTime)}</span>
            {hasDrawing && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="m2 2 7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
            )}
          </div>
        )}
      </div>
      
      <Textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none min-h-[80px] mb-3"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white p-2"
          >
            <Paperclip size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white p-2"
          >
            <Smile size={16} />
          </Button>
          <DrawingToolsMenu onStartDrawing={handleStartDrawing} isDrawingMode={isDrawingMode} />
          <Button
            size="sm"
            variant={isInternal ? "default" : "ghost"}
            onClick={() => setIsInternal(!isInternal)}
            className={isInternal ? "bg-orange-600 hover:bg-orange-700 text-white" : "text-gray-400 hover:text-white"}
          >
            <Lock size={16} />
          </Button>
          <Button
            size="sm"
            variant={attachTime ? "default" : "ghost"}
            onClick={() => !hasDrawing && setAttachTime(!attachTime)}
            disabled={hasDrawing}
            className={attachTime ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "text-gray-400 hover:text-white"}
          >
            <Clock size={16} />
          </Button>
        </div>
        
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
};
