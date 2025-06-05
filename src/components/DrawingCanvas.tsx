
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line, FabricObject, Path } from "fabric";

interface DrawingCanvasProps {
  currentTime?: number;
}

interface DrawingData {
  timestamp: number;
  objects: any[];
}

export const DrawingCanvas = ({ currentTime = 0 }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const tempObjectRef = useRef<FabricObject | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const parentElement = canvasRef.current.parentElement;
      const width = parentElement?.clientWidth || 800;
      const height = parentElement?.clientHeight || 450;

      const canvas = new FabricCanvas(canvasRef.current, {
        isDrawingMode: currentTool === "pen",
        width: width,
        height: height,
        backgroundColor: 'transparent',
        selection: false,
      });

      // Set up brush for pen tool
      const brush = new PencilBrush(canvas);
      brush.color = currentColor;
      brush.width = 3;
      canvas.freeDrawingBrush = brush;

      fabricCanvasRef.current = canvas;

      // Save state after free drawing
      canvas.on('path:created', () => {
        saveCurrentState();
        console.log('Free drawing path created');
      });

      // Mouse events for shape drawing
      canvas.on('mouse:down', (e) => {
        if (currentTool !== "pen" && e.pointer) {
          setIsDrawing(true);
          setStartPoint({ x: e.pointer.x, y: e.pointer.y });
          canvas.selection = false;
          console.log(`Started drawing ${currentTool} at:`, e.pointer);
        }
      });

      canvas.on('mouse:move', (e) => {
        if (!isDrawing || !startPoint || !e.pointer || currentTool === "pen") return;

        // Remove previous temporary object
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
            evented: false,
          });
        } else if (currentTool === "square") {
          const left = Math.min(startPoint.x, currentPoint.x);
          const top = Math.min(startPoint.y, currentPoint.y);
          const width = Math.abs(currentPoint.x - startPoint.x);
          const height = Math.abs(currentPoint.y - startPoint.y);
          
          tempObject = new Rect({
            left,
            top,
            width,
            height,
            fill: 'transparent',
            stroke: currentColor,
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });
        } else if (currentTool === "arrow") {
          const angle = Math.atan2(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x);
          const headLength = 20;
          
          tempObject = new Line([startPoint.x, startPoint.y, currentPoint.x, currentPoint.y], {
            stroke: currentColor,
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });
        }
        
        if (tempObject) {
          canvas.add(tempObject);
          tempObjectRef.current = tempObject;
          canvas.renderAll();
        }
      });

      canvas.on('mouse:up', (e) => {
        if (!isDrawing || !startPoint || !e.pointer || currentTool === "pen") return;

        const endPoint = { x: e.pointer.x, y: e.pointer.y };
        
        // Remove temporary object
        if (tempObjectRef.current) {
          canvas.remove(tempObjectRef.current);
          tempObjectRef.current = null;
        }
        
        let finalObjects: FabricObject[] = [];

        if (currentTool === "line") {
          const line = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
            stroke: currentColor,
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });
          finalObjects.push(line);
        } else if (currentTool === "square") {
          const left = Math.min(startPoint.x, endPoint.x);
          const top = Math.min(startPoint.y, endPoint.y);
          const width = Math.abs(endPoint.x - startPoint.x);
          const height = Math.abs(endPoint.y - startPoint.y);
          
          const rect = new Rect({
            left,
            top,
            width,
            height,
            fill: 'transparent',
            stroke: currentColor,
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });
          finalObjects.push(rect);
        } else if (currentTool === "arrow") {
          const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
          const headLength = 20;
          
          const mainLine = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
            stroke: currentColor,
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });
          
          const head1 = new Line([
            endPoint.x,
            endPoint.y,
            endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
            endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
          ], {
            stroke: currentColor,
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });
          
          const head2 = new Line([
            endPoint.x,
            endPoint.y,
            endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
            endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
          ], {
            stroke: currentColor,
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });
          
          finalObjects.push(mainLine, head1, head2);
        }
        
        // Add final objects to canvas
        finalObjects.forEach(obj => canvas.add(obj));
        canvas.renderAll();
        
        if (finalObjects.length > 0) {
          saveCurrentState();
          console.log(`Added ${currentTool} with ${finalObjects.length} objects`);
        }
        
        setIsDrawing(false);
        setStartPoint(null);
      });

      return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, []);

  // Save current state
  const saveCurrentState = () => {
    if (fabricCanvasRef.current) {
      const canvasState = JSON.stringify(fabricCanvasRef.current.toJSON());
      setUndoStack(prev => [...prev, canvasState]);
      setRedoStack([]);
      console.log('Canvas state saved');
    }
  };

  // Update tool and color
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      canvas.isDrawingMode = currentTool === "pen";
      
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = currentColor;
        canvas.freeDrawingBrush.width = 3;
      }
      
      canvas.selection = false;
      canvas.renderAll();
    }
  }, [currentColor, currentTool]);

  // Expose methods globally
  useEffect(() => {
    (window as any).drawingCanvas = {
      setTool: (tool: string) => {
        setCurrentTool(tool);
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
          setUndoStack([]);
          setRedoStack([]);
          console.log('Drawing canvas cleared');
        }
      },
      undo: () => {
        if (undoStack.length > 0 && fabricCanvasRef.current) {
          const currentState = JSON.stringify(fabricCanvasRef.current.toJSON());
          setRedoStack(prev => [...prev, currentState]);
          
          const previousState = undoStack[undoStack.length - 1];
          setUndoStack(prev => prev.slice(0, -1));
          
          fabricCanvasRef.current.loadFromJSON(previousState, () => {
            fabricCanvasRef.current?.renderAll();
            console.log('Undo action performed');
          });
        }
      },
      redo: () => {
        if (redoStack.length > 0 && fabricCanvasRef.current) {
          const currentState = JSON.stringify(fabricCanvasRef.current.toJSON());
          setUndoStack(prev => [...prev, currentState]);
          
          const stateToRestore = redoStack[redoStack.length - 1];
          setRedoStack(prev => prev.slice(0, -1));
          
          fabricCanvasRef.current.loadFromJSON(stateToRestore, () => {
            fabricCanvasRef.current?.renderAll();
            console.log('Redo action performed');
          });
        }
      }
    };

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [undoStack, redoStack]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
