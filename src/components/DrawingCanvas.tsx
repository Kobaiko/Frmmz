
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line, Circle } from "fabric";

interface DrawingCanvasProps {
  currentTime?: number;
  onDrawingStart?: () => void;
}

interface FrameDrawing {
  frame: number;
  canvasData: string;
}

export const DrawingCanvas = ({ currentTime = 0, onDrawingStart }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [frameDrawings, setFrameDrawings] = useState<FrameDrawing[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Get current frame number (30fps)
  const getCurrentFrame = () => Math.floor(currentTime * 30);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const parentElement = canvasRef.current.parentElement;
    const width = parentElement?.clientWidth || 800;
    const height = parentElement?.clientHeight || 450;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: 'transparent',
      selection: false,
      isDrawingMode: false,
    });

    // Configure pen tool
    const brush = new PencilBrush(canvas);
    brush.color = currentColor;
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

    fabricCanvasRef.current = canvas;

    // Save state after path is created (for pen tool)
    canvas.on('path:created', () => {
      saveCanvasState();
      console.log('Pen drawing created and saved');
    });

    // Handle mouse events for shape tools
    canvas.on('mouse:down', (e) => {
      if (currentTool === "pen") return;
      
      if (e.pointer && !isDrawing) {
        // Pause video when starting to draw
        if (onDrawingStart) {
          onDrawingStart();
          console.log('Video paused for drawing');
        }
        
        setIsDrawing(true);
        setStartPoint({ x: e.pointer.x, y: e.pointer.y });
        console.log(`Started drawing ${currentTool}`);
      }
    });

    canvas.on('mouse:up', (e) => {
      if (currentTool === "pen" || !isDrawing || !startPoint || !e.pointer) return;

      const endPoint = { x: e.pointer.x, y: e.pointer.y };
      
      // Create the appropriate shape
      if (currentTool === "line") {
        const line = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
          stroke: currentColor,
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
        canvas.add(line);
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
        canvas.add(rect);
      } else if (currentTool === "arrow") {
        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
        const headLength = 20;
        
        // Main line
        const mainLine = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
          stroke: currentColor,
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
        
        // Arrow head lines
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
        
        canvas.add(mainLine, head1, head2);
      }
      
      setIsDrawing(false);
      setStartPoint(null);
      saveCanvasState();
      console.log(`${currentTool} created and saved`);
    });

    console.log('Fabric canvas initialized');
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Update tool mode when currentTool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.isDrawingMode = currentTool === "pen";
    
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = currentColor;
    }
    
    console.log(`Tool changed to: ${currentTool}, drawing mode: ${canvas.isDrawingMode}`);
  }, [currentTool, currentColor]);

  // Save canvas state for undo/redo
  const saveCanvasState = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvasData = JSON.stringify(fabricCanvasRef.current.toJSON());
    setUndoStack(prev => [...prev, canvasData]);
    setRedoStack([]); // Clear redo stack when new action is performed
    
    // Also save for current frame
    const currentFrame = getCurrentFrame();
    setFrameDrawings(prev => {
      const filtered = prev.filter(f => f.frame !== currentFrame);
      return [...filtered, { frame: currentFrame, canvasData }];
    });
  };

  // Load canvas state for current frame
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const currentFrame = getCurrentFrame();
    
    // Find drawing for current frame
    const frameDrawing = frameDrawings.find(f => f.frame === currentFrame);
    
    if (frameDrawing) {
      // Load the saved canvas state
      canvas.loadFromJSON(frameDrawing.canvasData).then(() => {
        canvas.renderAll();
        console.log(`Loaded drawings for frame ${currentFrame}`);
      });
    } else {
      // Clear canvas if no drawing for this frame
      canvas.clear();
      canvas.backgroundColor = 'transparent';
      canvas.renderAll();
      console.log(`Cleared canvas for frame ${currentFrame}`);
    }
  }, [currentTime, frameDrawings]);

  // Expose methods globally for the drawing menu
  useEffect(() => {
    (window as any).drawingCanvas = {
      setTool: (tool: string) => {
        setCurrentTool(tool);
        // Pause video when switching to any drawing tool
        if (onDrawingStart) {
          onDrawingStart();
        }
        console.log(`Drawing tool changed to: ${tool}`);
      },
      setColor: (color: string) => {
        setCurrentColor(color);
        console.log(`Drawing color changed to: ${color}`);
      },
      clear: () => {
        if (!fabricCanvasRef.current) return;
        
        const canvas = fabricCanvasRef.current;
        canvas.clear();
        canvas.backgroundColor = 'transparent';
        canvas.renderAll();
        
        // Remove from frame drawings
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
        
        console.log(`Cleared drawings for frame ${currentFrame}`);
      },
      undo: () => {
        if (!fabricCanvasRef.current || undoStack.length === 0) return;
        
        const canvas = fabricCanvasRef.current;
        const currentState = JSON.stringify(canvas.toJSON());
        const previousState = undoStack[undoStack.length - 1];
        
        setRedoStack(prev => [...prev, currentState]);
        setUndoStack(prev => prev.slice(0, -1));
        
        canvas.loadFromJSON(previousState).then(() => {
          canvas.renderAll();
          console.log('Undo performed');
        });
      },
      redo: () => {
        if (!fabricCanvasRef.current || redoStack.length === 0) return;
        
        const canvas = fabricCanvasRef.current;
        const currentState = JSON.stringify(canvas.toJSON());
        const nextState = redoStack[redoStack.length - 1];
        
        setUndoStack(prev => [...prev, currentState]);
        setRedoStack(prev => prev.slice(0, -1));
        
        canvas.loadFromJSON(nextState).then(() => {
          canvas.renderAll();
          console.log('Redo performed');
        });
      }
    };

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [undoStack, redoStack, onDrawingStart]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
