
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
  const [undoStack, setUndoStack] = useState<FabricObject[]>([]);
  const [redoStack, setRedoStack] = useState<FabricObject[]>([]);
  const tempObjectRef = useRef<FabricObject | null>(null);

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
        if (currentTool !== "pen" && e.pointer && fabricCanvasRef.current) {
          const canvas = fabricCanvasRef.current;
          setIsDrawing(true);
          setStartPoint({ x: e.pointer.x, y: e.pointer.y });
          canvas.selection = false;
          canvas.defaultCursor = 'crosshair';
        }
      });

      fabricCanvasRef.current.on('mouse:move', (e) => {
        if (isDrawing && startPoint && e.pointer && fabricCanvasRef.current && currentTool !== "pen") {
          const canvas = fabricCanvasRef.current;
          
          // Remove temporary object if it exists
          if (tempObjectRef.current) {
            canvas.remove(tempObjectRef.current);
            tempObjectRef.current = null;
          }

          const currentPoint = { x: e.pointer.x, y: e.pointer.y };
          let tempObject: FabricObject | null = null;

          if (currentTool === "line") {
            tempObject = new Line([startPoint.x, startPoint.y, currentPoint.x, currentPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
            });
          } else if (currentTool === "square") {
            tempObject = new Rect({
              left: Math.min(startPoint.x, currentPoint.x),
              top: Math.min(startPoint.y, currentPoint.y),
              width: Math.abs(currentPoint.x - startPoint.x),
              height: Math.abs(currentPoint.y - startPoint.y),
              fill: 'transparent',
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
            });
          } else if (currentTool === "arrow") {
            const angle = Math.atan2(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x);
            const headLength = 20;
            
            const mainLine = new Line([startPoint.x, startPoint.y, currentPoint.x, currentPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
            });
            
            const head1 = new Line([
              currentPoint.x,
              currentPoint.y,
              currentPoint.x - headLength * Math.cos(angle - Math.PI / 6),
              currentPoint.y - headLength * Math.sin(angle - Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
            });
            
            const head2 = new Line([
              currentPoint.x,
              currentPoint.y,
              currentPoint.x - headLength * Math.cos(angle + Math.PI / 6),
              currentPoint.y - headLength * Math.sin(angle + Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
            });
            
            canvas.add(mainLine, head1, head2);
            tempObjectRef.current = mainLine; // We'll track the main line as temp
            canvas.renderAll();
            return;
          }
          
          if (tempObject) {
            canvas.add(tempObject);
            tempObjectRef.current = tempObject;
            canvas.renderAll();
          }
        }
      });

      fabricCanvasRef.current.on('mouse:up', (e) => {
        if (isDrawing && startPoint && e.pointer && fabricCanvasRef.current) {
          const canvas = fabricCanvasRef.current;
          const endPoint = { x: e.pointer.x, y: e.pointer.y };
          
          // Remove temporary object
          if (tempObjectRef.current) {
            canvas.remove(tempObjectRef.current);
            tempObjectRef.current = null;
          }
          
          let newObjects: FabricObject[] = [];

          if (currentTool === "line") {
            const line = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
            newObjects.push(line);
          } else if (currentTool === "square") {
            const rect = new Rect({
              left: Math.min(startPoint.x, endPoint.x),
              top: Math.min(startPoint.y, endPoint.y),
              width: Math.abs(endPoint.x - startPoint.x),
              height: Math.abs(endPoint.y - startPoint.y),
              fill: 'transparent',
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
            newObjects.push(rect);
          } else if (currentTool === "arrow") {
            const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
            const headLength = 20;
            
            const mainLine = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: true,
            });
            
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
            
            newObjects.push(mainLine, head1, head2);
          }
          
          // Add all new objects to canvas
          newObjects.forEach(obj => canvas.add(obj));
          
          if (newObjects.length > 0) {
            setCurrentDrawingObjects(prev => [...prev, ...newObjects]);
            setUndoStack(prev => [...prev, ...newObjects]);
            setRedoStack([]); // Clear redo stack when new action is performed
          }
          
          setIsDrawing(false);
          setStartPoint(null);
          canvas.selection = true;
          canvas.defaultCursor = 'default';
          
          console.log(`Added ${currentTool} to canvas`);
        }
      });

      // Save drawing when free drawing path is created
      fabricCanvasRef.current.on('path:created', (e) => {
        if (e.path) {
          setCurrentDrawingObjects(prev => [...prev, e.path]);
          setUndoStack(prev => [...prev, e.path]);
          setRedoStack([]); // Clear redo stack when new action is performed
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
    setCurrentDrawingObjects([]);

    if (currentDrawing) {
      // Load the drawing for this timestamp
      fabricCanvasRef.current.loadFromJSON(currentDrawing.objects, () => {
        fabricCanvasRef.current!.renderAll();
        // Update current objects from loaded data
        const objects = fabricCanvasRef.current!.getObjects();
        setCurrentDrawingObjects(objects);
      });
    }
  }, [currentTime, drawings]);

  // Save current drawing when objects change
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
          setUndoStack([]);
          setRedoStack([]);
          
          // Remove drawing for current timestamp
          setDrawings(prev => prev.filter(d => Math.abs(d.timestamp - currentTime) >= 0.5));
          
          console.log('Drawing canvas cleared for current timestamp');
        }
      },
      undo: () => {
        if (fabricCanvasRef.current && undoStack.length > 0) {
          const lastObject = undoStack[undoStack.length - 1];
          fabricCanvasRef.current.remove(lastObject);
          setCurrentDrawingObjects(prev => prev.filter(obj => obj !== lastObject));
          setUndoStack(prev => prev.slice(0, -1));
          setRedoStack(prev => [...prev, lastObject]);
          console.log('Undo drawing action');
        }
      },
      redo: () => {
        if (fabricCanvasRef.current && redoStack.length > 0) {
          const objectToRedo = redoStack[redoStack.length - 1];
          fabricCanvasRef.current.add(objectToRedo);
          setCurrentDrawingObjects(prev => [...prev, objectToRedo]);
          setRedoStack(prev => prev.slice(0, -1));
          setUndoStack(prev => [...prev, objectToRedo]);
          console.log('Redo drawing action');
        }
      }
    };

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [undoStack, redoStack, currentDrawingObjects, currentTime]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
