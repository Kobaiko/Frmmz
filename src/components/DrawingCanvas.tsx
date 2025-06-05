
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line, FabricObject } from "fabric";

interface Drawing {
  timestamp: number;
  objects: string; // Serialized fabric objects
}

interface DrawingCanvasProps {
  currentTime?: number;
}

export const DrawingCanvas = ({ currentTime = 0 }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawingObjects, setCurrentDrawingObjects] = useState<FabricObject[]>([]);

  // Initialize canvas
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
        selection: true,
      });

      const brush = new PencilBrush(fabricCanvasRef.current);
      brush.color = currentColor;
      brush.width = 3;
      fabricCanvasRef.current.freeDrawingBrush = brush;

      // Mouse events for shape drawing
      fabricCanvasRef.current.on('mouse:down', (e) => {
        if (currentTool !== "pen" && e.pointer) {
          setIsDrawing(true);
          setStartPoint({ x: e.pointer.x, y: e.pointer.y });
          fabricCanvasRef.current!.selection = false;
          fabricCanvasRef.current!.defaultCursor = 'crosshair';
        }
      });

      fabricCanvasRef.current.on('mouse:up', (e) => {
        if (isDrawing && startPoint && e.pointer && fabricCanvasRef.current) {
          const endPoint = { x: e.pointer.x, y: e.pointer.y };
          
          let newObject: FabricObject | null = null;

          if (currentTool === "line") {
            newObject = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
          } else if (currentTool === "square") {
            newObject = new Rect({
              left: Math.min(startPoint.x, endPoint.x),
              top: Math.min(startPoint.y, endPoint.y),
              width: Math.abs(endPoint.x - startPoint.x),
              height: Math.abs(endPoint.y - startPoint.y),
              fill: 'transparent',
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
          } else if (currentTool === "arrow") {
            // Create arrow as a group of lines
            const mainLine = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
            
            const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
            const headLength = 20;
            
            const head1 = new Line([
              endPoint.x,
              endPoint.y,
              endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
              endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
            
            const head2 = new Line([
              endPoint.x,
              endPoint.y,
              endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
              endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
            
            fabricCanvasRef.current.add(mainLine, head1, head2);
            setCurrentDrawingObjects(prev => [...prev, mainLine, head1, head2]);
          }
          
          if (newObject) {
            fabricCanvasRef.current.add(newObject);
            setCurrentDrawingObjects(prev => [...prev, newObject]);
          }
          
          setIsDrawing(false);
          setStartPoint(null);
          fabricCanvasRef.current.selection = true;
          fabricCanvasRef.current.defaultCursor = 'default';
          
          console.log(`Added ${currentTool} to canvas`);
        }
      });

      // Save drawing when free drawing path is created
      fabricCanvasRef.current.on('path:created', (e) => {
        if (e.path) {
          setCurrentDrawingObjects(prev => [...prev, e.path]);
        }
      });

      // Handle window resize
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

  // Update tool and color
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = currentTool === "pen";
      if (fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.color = currentColor;
      }
    }
  }, [currentColor, currentTool]);

  // Load drawings for current timestamp
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    // Find drawing for current timestamp (within 0.5 seconds tolerance)
    const currentDrawing = drawings.find(drawing => 
      Math.abs(drawing.timestamp - currentTime) < 0.5
    );

    // Clear canvas
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = 'transparent';

    if (currentDrawing) {
      // Load the drawing for this timestamp
      fabricCanvasRef.current.loadFromJSON(currentDrawing.objects, () => {
        fabricCanvasRef.current!.renderAll();
      });
    }
  }, [currentTime, drawings]);

  // Save current drawing when timestamp changes significantly
  useEffect(() => {
    if (currentDrawingObjects.length > 0 && fabricCanvasRef.current) {
      const drawingData = fabricCanvasRef.current.toJSON();
      
      setDrawings(prev => {
        // Remove any existing drawing for this timestamp
        const filtered = prev.filter(d => Math.abs(d.timestamp - currentTime) >= 0.5);
        // Add new drawing
        return [...filtered, {
          timestamp: currentTime,
          objects: JSON.stringify(drawingData)
        }];
      });
      
      console.log(`Saved drawing at timestamp: ${currentTime}`);
    }
  }, [currentDrawingObjects, currentTime]);

  // Expose methods globally
  useEffect(() => {
    (window as any).drawingCanvas = {
      setTool: (tool: string) => {
        setCurrentTool(tool);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.isDrawingMode = tool === "pen";
          fabricCanvasRef.current.selection = tool !== "pen";
          fabricCanvasRef.current.defaultCursor = tool === "pen" ? 'default' : 'crosshair';
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
          fabricCanvasRef.current.backgroundColor = 'transparent';
          fabricCanvasRef.current.renderAll();
          setCurrentDrawingObjects([]);
          
          // Remove drawing for current timestamp
          setDrawings(prev => prev.filter(d => Math.abs(d.timestamp - currentTime) >= 0.5));
          
          console.log('Drawing canvas cleared for current timestamp');
        }
      },
      undo: () => {
        if (fabricCanvasRef.current && currentDrawingObjects.length > 0) {
          const lastObject = currentDrawingObjects[currentDrawingObjects.length - 1];
          fabricCanvasRef.current.remove(lastObject);
          setCurrentDrawingObjects(prev => prev.slice(0, -1));
          console.log('Undo drawing action');
        }
      },
      redo: () => {
        console.log('Redo not implemented for timestamp-based drawings');
      }
    };

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [currentDrawingObjects, currentTime]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
