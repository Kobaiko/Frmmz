
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Smile, 
  Paperclip, 
  Pencil,
  Square,
  ArrowRight,
  Circle,
  Palette,
  Send
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
  placeholder = "Add a comment...",
  currentTime,
  onStartDrawing,
  isDrawingMode
}: CommentInputProps) => {
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [attachTime, setAttachTime] = useState(true);
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [selectedColor, setSelectedColor] = useState("#ff6b35");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment.trim(), [], isInternal, attachTime, false);
      setComment("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const drawingTools = [
    { id: "pencil", icon: Pencil, label: "Free draw" },
    { id: "line", icon: ArrowRight, label: "Line" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "circle", icon: Circle, label: "Circle" }
  ];

  const colors = [
    "#ff6b35", // Orange-red
    "#8b5cf6", // Purple
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#ec4899", // Pink
    "#6b7280"  // Gray
  ];

  return (
    <div className="border-t border-gray-700 bg-gray-900 p-4">
      {/* Time indicator */}
      {attachTime && (
        <div className="flex items-center space-x-2 mb-3">
          <Badge className="bg-blue-600 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(currentTime)}
          </Badge>
          <span className="text-xs text-gray-400">Comment will be attached to this timestamp</span>
        </div>
      )}

      {/* Drawing Tools Bar */}
      <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-800 rounded-lg">
        <span className="text-xs text-gray-400 mr-2">Drawing:</span>
        
        {/* Drawing Tools */}
        {drawingTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSelectedTool(tool.id);
                onStartDrawing();
              }}
              className={`h-8 w-8 p-0 ${
                selectedTool === tool.id && isDrawingMode
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              title={tool.label}
            >
              <IconComponent className="h-4 w-4" />
            </Button>
          );
        })}

        <div className="w-px h-6 bg-gray-600 mx-2" />

        {/* Color Picker */}
        <div className="flex items-center space-x-1">
          <Palette className="h-4 w-4 text-gray-400" />
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                selectedColor === color ? "border-white" : "border-gray-600"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Comment Input */}
      <div className="space-y-3">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 min-h-[80px] resize-none"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8"
            >
              <Smile className="h-4 w-4 mr-1" />
              Emoji
            </Button>

            {/* Attachment Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-8"
            >
              <Paperclip className="h-4 w-4 mr-1" />
              Attach
            </Button>

            {/* Internal Toggle */}
            <Button
              variant={isInternal ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsInternal(!isInternal)}
              className={`h-8 text-xs ${
                isInternal 
                  ? "bg-orange-600 text-white hover:bg-orange-700" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Internal
            </Button>

            {/* Time Toggle */}
            <Button
              variant={attachTime ? "default" : "ghost"}
              size="sm"
              onClick={() => setAttachTime(!attachTime)}
              className={`h-8 text-xs ${
                attachTime 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="h-3 w-3 mr-1" />
              Time
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-gray-400 hover:text-white h-8"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!comment.trim()}
              className="bg-blue-600 hover:bg-blue-700 h-8"
            >
              <Send className="h-4 w-4 mr-1" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
