
import { useEffect, useRef, useState, useCallback } from "react";
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
  const [frameDrawings, setFrameDrawings] = useState<FrameDrawing[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  // Get current frame number (30fps)
  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Save canvas state
  const saveCanvasState = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvasData = JSON.stringify(fabricCanvasRef.current.toJSON());
    const currentFrame = getCurrentFrame();
    
    // Update undo stack
    setUndoStack(prev => [...prev.slice(-19), canvasData]); // Keep only last 20 states
    setRedoStack([]); // Clear redo stack when new action is performed
    
    // Save for current frame
    setFrameDrawings(prev => {
      const filtered = prev.filter(f => f.frame !== currentFrame);
      return [...filtered, { frame: currentFrame, canvasData }];
    });
    
    console.log(`Canvas state saved for frame ${currentFrame}`);
  }, [getCurrentFrame]);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const parentElement = canvasRef.current.parentElement;
    const width = parentElement?.clientWidth || 800;
    const height = parentElement?.clientHeight || 450;

    console.log('Initializing Fabric canvas with dimensions:', width, 'x', height);

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

    // Event handlers
    canvas.on('path:created', () => {
      console.log('Pen path created');
      saveCanvasState();
    });

    canvas.on('mouse:down', (e) => {
      if (currentTool === "pen" || !e.pointer) return;
      
      console.log(`Mouse down for ${currentTool} tool`);
      if (onDrawingStart) {
        onDrawingStart();
      }
      
      isDrawingRef.current = true;
      startPointRef.current = { x: e.pointer.x, y: e.pointer.y };
    });

    canvas.on('mouse:up', (e) => {
      if (currentTool === "pen" || !isDrawingRef.current || !startPointRef.current || !e.pointer) return;

      console.log(`Mouse up for ${currentTool} tool`);
      const endPoint = { x: e.pointer.x, y: e.pointer.y };
      
      // Create the appropriate shape
      let shape = null;
      
      if (currentTool === "line") {
        shape = new Line([startPointRef.current.x, startPointRef.current.y, endPoint.x, endPoint.y], {
          stroke: currentColor,
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
      } else if (currentTool === "square") {
        const left = Math.min(startPointRef.current.x, endPoint.x);
        const top = Math.min(startPointRef.current.y, endPoint.y);
        const width = Math.abs(endPoint.x - startPointRef.current.x);
        const height = Math.abs(endPoint.y - startPointRef.current.y);
        
        shape = new Rect({
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
        const angle = Math.atan2(endPoint.y - startPointRef.current.y, endPoint.x - startPointRef.current.x);
        const headLength = 20;
        
        // Main line
        const mainLine = new Line([startPointRef.current.x, startPointRef.current.y, endPoint.x, endPoint.y], {
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
        saveCanvasState();
        isDrawingRef.current = false;
        startPointRef.current = null;
        return;
      }
      
      if (shape) {
        canvas.add(shape);
        saveCanvasState();
      }
      
      isDrawingRef.current = false;
      startPointRef.current = null;
    });

    // Handle pen tool activation
    canvas.on('mouse:down', () => {
      if (currentTool === "pen" && onDrawingStart) {
        onDrawingStart();
      }
    });

    console.log('Fabric canvas initialized successfully');

    return () => {
      console.log('Disposing Fabric canvas');
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []); // Only run once on mount

  // Update tool mode when currentTool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.isDrawingMode = currentTool === "pen";
    
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = currentColor;
      canvas.freeDrawingBrush.width = 3;
    }
    
    console.log(`Tool changed to: ${currentTool}, drawing mode: ${canvas.isDrawingMode}`);
  }, [currentTool, currentColor]);

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
      }).catch((error) => {
        console.error('Error loading canvas data:', error);
      });
    } else {
      // Clear canvas if no drawing for this frame
      canvas.clear();
      canvas.backgroundColor = 'transparent';
      canvas.renderAll();
      console.log(`Cleared canvas for frame ${currentFrame} (no drawings)`);
    }
  }, [currentTime, frameDrawings, getCurrentFrame]);

  // Expose methods globally for the drawing menu
  useEffect(() => {
    const drawingCanvasAPI = {
      setTool: (tool: string) => {
        console.log(`Setting tool to: ${tool}`);
        setCurrentTool(tool);
        if (onDrawingStart) {
          onDrawingStart();
        }
      },
      setColor: (color: string) => {
        console.log(`Setting color to: ${color}`);
        setCurrentColor(color);
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
        }).catch((error) => {
          console.error('Error during undo:', error);
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
        }).catch((error) => {
          console.error('Error during redo:', error);
        });
      }
    };

    (window as any).drawingCanvas = drawingCanvasAPI;

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [undoStack, redoStack, onDrawingStart, getCurrentFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
