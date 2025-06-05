
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Square, Circle, Minus, ArrowLeft, ArrowRight, Undo, Redo } from "lucide-react";

interface DrawingToolsMenuProps {
  onClose: () => void;
}

export const DrawingToolsMenu = ({ onClose }: DrawingToolsMenuProps) => {
  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
    "#000000", "#ffffff", "#ff8800", "#8800ff", "#00ff88", "#ff0088"
  ];

  const tools = [
    { id: "pen", icon: Minus, label: "Pen" },
    { id: "square", icon: Square, label: "Square" },
    { id: "circle", icon: Circle, label: "Circle" },
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

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 p-3"
    >
      {/* Tools */}
      <div className="flex space-x-2 mb-3">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool(tool.id)}
              className="p-2"
              title={tool.label}
            >
              <IconComponent size={16} />
            </Button>
          );
        })}
      </div>

      {/* Colors */}
      <div className="grid grid-cols-6 gap-2 mb-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-6 h-6 rounded border-2 ${
              selectedColor === color ? "border-white" : "border-gray-600"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="p-2 border-gray-600 text-gray-300"
          title="Undo"
        >
          <Undo size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="p-2 border-gray-600 text-gray-300"
          title="Redo"
        >
          <Redo size={14} />
        </Button>
      </div>
    </div>
  );
};
