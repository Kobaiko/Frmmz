
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line } from "fabric";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const parentElement = canvasRef.current.parentElement;
      const width = parentElement?.clientWidth || 800;
      const height = parentElement?.clientHeight || 450;

      fabricCanvasRef.current = new FabricCanvas(canvasRef.current, {
        isDrawingMode: currentTool === "pen",
        width: width,
        height: height,
        backgroundColor: 'transparent',
      });

      // Initialize the freeDrawingBrush
      const brush = new PencilBrush(fabricCanvasRef.current);
      brush.color = currentColor;
      brush.width = 3;
      fabricCanvasRef.current.freeDrawingBrush = brush;

      // Add mouse event listeners for shapes
      fabricCanvasRef.current.on('mouse:down', (e) => {
        if (currentTool !== "pen" && e.pointer) {
          setIsDrawing(true);
          setStartPoint({ x: e.pointer.x, y: e.pointer.y });
        }
      });

      fabricCanvasRef.current.on('mouse:up', (e) => {
        if (isDrawing && startPoint && e.pointer && fabricCanvasRef.current) {
          const endPoint = { x: e.pointer.x, y: e.pointer.y };
          
          if (currentTool === "line") {
            const line = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
            });
            fabricCanvasRef.current.add(line);
          } else if (currentTool === "square") {
            const rect = new Rect({
              left: Math.min(startPoint.x, endPoint.x),
              top: Math.min(startPoint.y, endPoint.y),
              width: Math.abs(endPoint.x - startPoint.x),
              height: Math.abs(endPoint.y - startPoint.y),
              fill: 'transparent',
              stroke: currentColor,
              strokeWidth: 3,
            });
            fabricCanvasRef.current.add(rect);
          } else if (currentTool === "arrow") {
            // Create arrow line
            const line = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
            });
            
            // Calculate arrow head
            const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
            const headLength = 20;
            
            // Arrow head lines
            const head1 = new Line([
              endPoint.x,
              endPoint.y,
              endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
              endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
            });
            
            const head2 = new Line([
              endPoint.x,
              endPoint.y,
              endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
              endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
            });
            
            fabricCanvasRef.current.add(line, head1, head2);
          }
          
          setIsDrawing(false);
          setStartPoint(null);
        }
      });

      // Listen for window resize to adjust canvas size
      const handleResize = () => {
        if (fabricCanvasRef.current && parentElement) {
          const newWidth = parentElement.clientWidth;
          const newHeight = parentElement.clientHeight;
          fabricCanvasRef.current.setDimensions({
            width: newWidth,
            height: newHeight
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = currentTool === "pen";
      if (fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.color = currentColor;
      }
    }
  }, [currentColor, currentTool]);

  // Expose methods to parent components through global functions
  useEffect(() => {
    (window as any).drawingCanvas = {
      setTool: (tool: string) => {
        setCurrentTool(tool);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.isDrawingMode = tool === "pen";
        }
        console.log(`Drawing tool changed to: ${tool}`);
      },
      setColor: (color: string) => {
        setCurrentColor(color);
        console.log(`Drawing color changed to: ${color}`);
      },
      clear: () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.clear();
          console.log('Drawing canvas cleared');
        }
      },
      undo: () => {
        if (fabricCanvasRef.current) {
          const objects = fabricCanvasRef.current.getObjects();
          if (objects.length > 0) {
            fabricCanvasRef.current.remove(objects[objects.length - 1]);
            fabricCanvasRef.current.renderAll();
            console.log('Undo drawing action');
          }
        }
      },
      redo: () => {
        // Implement redo functionality
        console.log('Redo drawing action');
      }
    };

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
