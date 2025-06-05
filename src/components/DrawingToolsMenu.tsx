
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Undo, Redo, Trash2 } from "lucide-react";

interface DrawingToolsMenuProps {
  onClose: () => void;
}

export const DrawingToolsMenu = ({ onClose }: DrawingToolsMenuProps) => {
  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("#ff6b35");
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#8b5cf6", // Purple
    "#f59e0b", // Orange  
    "#10b981", // Green
    "#ff6b35", // Red-orange (default selected)
  ];

  const tools = [
    { id: "pen", label: "Free Doodle", symbol: "✏️" },
    { id: "line", label: "Line", symbol: "—" },
    { id: "square", label: "Rectangle", symbol: "▢" },
    { id: "arrow", label: "Arrow", symbol: "→" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleToolChange = (toolId: string) => {
    setSelectedTool(toolId);
    console.log(`Drawing tool changed to: ${toolId}`);
    if ((window as any).drawingCanvas) {
      (window as any).drawingCanvas.setTool(toolId);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    console.log(`Drawing color changed to: ${color}`);
    if ((window as any).drawingCanvas) {
      (window as any).drawingCanvas.setColor(color);
    }
  };

  const handleUndo = () => {
    console.log('Undo drawing action');
    if ((window as any).drawingCanvas) {
      (window as any).drawingCanvas.undo();
    }
  };

  const handleRedo = () => {
    console.log('Redo drawing action');
    if ((window as any).drawingCanvas) {
      (window as any).drawingCanvas.redo();
    }
  };

  const handleClear = () => {
    console.log('Clear drawing canvas');
    if ((window as any).drawingCanvas) {
      (window as any).drawingCanvas.clear();
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 p-2"
    >
      <div className="flex items-center space-x-2">
        {/* Back arrow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Button>

        {/* Tools */}
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleToolChange(tool.id)}
            className={`p-2 min-w-[32px] h-8 ${
              selectedTool === tool.id 
                ? "bg-blue-600 text-white" 
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
            title={tool.label}
          >
            <span className="text-sm">{tool.symbol}</span>
          </Button>
        ))}

        {/* Colors */}
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorChange(color)}
            className={`w-6 h-6 rounded-full border-2 ${
              selectedColor === color ? "border-white" : "border-gray-600"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          className="p-1 text-gray-400 hover:text-white"
          title="Undo"
        >
          <Undo size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          className="p-1 text-gray-400 hover:text-white"
          title="Redo"
        >
          <Redo size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="p-1 text-gray-400 hover:text-white"
          title="Clear all"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
