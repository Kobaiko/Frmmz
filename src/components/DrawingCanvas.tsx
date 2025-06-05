
import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line, Circle } from "fabric";

interface DrawingCanvasProps {
  currentTime?: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

interface FrameDrawing {
  frame: number;
  canvasData: string;
}

export const DrawingCanvas = ({ currentTime = 0, videoRef }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [frameDrawings, setFrameDrawings] = useState<FrameDrawing[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const isInitializedRef = useRef(false);

  // Current tool and color state
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");

  // Drawing state for shapes
  const drawingStateRef = useRef({
    isDrawing: false,
    startPoint: null as { x: number; y: number } | null,
    currentShape: null as any
  });

  // Get current frame number (30fps)
  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Save current canvas state
  const saveState = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const canvasData = JSON.stringify(canvas.toJSON());
    const currentFrame = getCurrentFrame();
    
    // Update undo stack
    setUndoStack(prev => [...prev.slice(-19), canvasData]);
    setRedoStack([]);
    
    // Save for current frame
    setFrameDrawings(prev => {
      const filtered = prev.filter(f => f.frame !== currentFrame);
      return [...filtered, { frame: currentFrame, canvasData }];
    });
    
    console.log(`Canvas state saved for frame ${currentFrame}`);
  }, [getCurrentFrame]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) return;

    console.log('Initializing new Fabric.js canvas');
    
    // Get canvas container dimensions
    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Create new Fabric canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      selection: false,
      renderOnAddRemove: true,
      preserveObjectStacking: true
    });

    // Set up drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = currentColor;
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

    fabricCanvasRef.current = canvas;
    isInitializedRef.current = true;

    // Set up event handlers
    const setupEventHandlers = () => {
      // Handle free drawing (pen tool) - path creation
      canvas.on('path:created', (e) => {
        console.log('Free drawing path created');
        saveState();
      });

      // Mouse down event for shape drawing
      canvas.on('mouse:down', (e) => {
        if (currentTool === "pen") return;
        
        const pointer = canvas.getPointer(e.e);
        console.log(`Starting ${currentTool} drawing at`, pointer);
        
        drawingStateRef.current.isDrawing = true;
        drawingStateRef.current.startPoint = { x: pointer.x, y: pointer.y };
        
        // Disable selection during drawing
        canvas.selection = false;
        canvas.discardActiveObject();
      });

      // Mouse move event for shape preview
      canvas.on('mouse:move', (e) => {
        if (!drawingStateRef.current.isDrawing || currentTool === "pen" || !drawingStateRef.current.startPoint) return;

        const pointer = canvas.getPointer(e.e);
        
        // Remove previous preview shape
        if (drawingStateRef.current.currentShape) {
          canvas.remove(drawingStateRef.current.currentShape);
        }

        const startPoint = drawingStateRef.current.startPoint;
        let shape: any = null;

        try {
          if (currentTool === "line") {
            shape = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
              evented: false,
              opacity: 0.7
            });
          } 
          else if (currentTool === "square") {
            const left = Math.min(startPoint.x, pointer.x);
            const top = Math.min(startPoint.y, pointer.y);
            const width = Math.abs(pointer.x - startPoint.x);
            const height = Math.abs(pointer.y - startPoint.y);
            
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
              opacity: 0.7
            });
          }
          else if (currentTool === "arrow") {
            shape = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
              evented: false,
              opacity: 0.7
            });
          }

          if (shape) {
            canvas.add(shape);
            drawingStateRef.current.currentShape = shape;
            canvas.renderAll();
          }
        } catch (error) {
          console.error('Error creating preview shape:', error);
        }
      });

      // Mouse up event for finalizing shapes
      canvas.on('mouse:up', (e) => {
        if (!drawingStateRef.current.isDrawing || currentTool === "pen" || !drawingStateRef.current.startPoint) return;

        const pointer = canvas.getPointer(e.e);
        console.log(`Finishing ${currentTool} drawing at`, pointer);
        
        // Remove preview shape
        if (drawingStateRef.current.currentShape) {
          canvas.remove(drawingStateRef.current.currentShape);
        }

        const startPoint = drawingStateRef.current.startPoint;
        
        try {
          if (currentTool === "line") {
            const line = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            canvas.add(line);
            console.log('Line added to canvas');
          } 
          else if (currentTool === "square") {
            const left = Math.min(startPoint.x, pointer.x);
            const top = Math.min(startPoint.y, pointer.y);
            const width = Math.abs(pointer.x - startPoint.x);
            const height = Math.abs(pointer.y - startPoint.y);
            
            if (width > 5 && height > 5) { // Minimum size check
              const rect = new Rect({
                left,
                top,
                width,
                height,
                fill: 'transparent',
                stroke: currentColor,
                strokeWidth: 3,
                selectable: false,
                evented: false
              });
              canvas.add(rect);
              console.log('Rectangle added to canvas');
            }
          }
          else if (currentTool === "arrow") {
            // Calculate arrow angle
            const angle = Math.atan2(pointer.y - startPoint.y, pointer.x - startPoint.x);
            const headLength = 20;
            
            // Main line
            const mainLine = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            
            // Arrow head lines
            const head1 = new Line([
              pointer.x,
              pointer.y,
              pointer.x - headLength * Math.cos(angle - Math.PI / 6),
              pointer.y - headLength * Math.sin(angle - Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            
            const head2 = new Line([
              pointer.x,
              pointer.y,
              pointer.x - headLength * Math.cos(angle + Math.PI / 6),
              pointer.y - headLength * Math.sin(angle + Math.PI / 6)
            ], {
              stroke: currentColor,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            
            canvas.add(mainLine);
            canvas.add(head1);
            canvas.add(head2);
            console.log('Arrow added to canvas');
          }
          
          canvas.renderAll();
          saveState();
        } catch (error) {
          console.error('Error adding shape to canvas:', error);
        }
        
        // Reset drawing state
        drawingStateRef.current.isDrawing = false;
        drawingStateRef.current.startPoint = null;
        drawingStateRef.current.currentShape = null;
        canvas.selection = false;
      });
    };

    setupEventHandlers();
    
    console.log('Fabric.js canvas initialized successfully');

    return () => {
      console.log('Disposing Fabric canvas');
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array to run only once

  // Update drawing tool and color
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    console.log(`Updating canvas tool to: ${currentTool}, color: ${currentColor}`);
    
    // Update drawing mode
    canvas.isDrawingMode = currentTool === "pen";
    
    // Update brush settings
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = currentColor;
      canvas.freeDrawingBrush.width = 3;
    }
    
    // Disable selection for shape tools
    canvas.selection = false;
    canvas.discardActiveObject();
    
    canvas.renderAll();
  }, [currentTool, currentColor]);

  // Load frame-specific drawings
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const currentFrame = getCurrentFrame();
    const frameDrawing = frameDrawings.find(f => f.frame === currentFrame);
    
    if (frameDrawing) {
      try {
        canvas.loadFromJSON(frameDrawing.canvasData).then(() => {
          canvas.renderAll();
          console.log(`Loaded drawings for frame ${currentFrame}`);
        });
      } catch (error) {
        console.error('Error loading frame drawings:', error);
        canvas.clear();
        canvas.renderAll();
      }
    } else {
      canvas.clear();
      canvas.renderAll();
      console.log(`Cleared canvas for frame ${currentFrame} (no drawings)`);
    }
  }, [currentTime, frameDrawings, getCurrentFrame]);

  // Global API for drawing tools
  useEffect(() => {
    const api = {
      setTool: (tool: string) => {
        console.log(`API: Setting tool to ${tool}`);
        setCurrentTool(tool);
      },
      setColor: (color: string) => {
        console.log(`API: Setting color to ${color}`);
        setCurrentColor(color);
      },
      clear: () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        
        console.log('API: Clearing canvas');
        canvas.clear();
        canvas.renderAll();
        
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
      },
      undo: () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || undoStack.length === 0) return;
        
        console.log('API: Undo');
        const currentState = JSON.stringify(canvas.toJSON());
        const previousState = undoStack[undoStack.length - 1];
        
        setRedoStack(prev => [...prev, currentState]);
        setUndoStack(prev => prev.slice(0, -1));
        
        canvas.loadFromJSON(previousState).then(() => {
          canvas.renderAll();
        });
      },
      redo: () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || redoStack.length === 0) return;
        
        console.log('API: Redo');
        const currentState = JSON.stringify(canvas.toJSON());
        const nextState = redoStack[redoStack.length - 1];
        
        setUndoStack(prev => [...prev, currentState]);
        setRedoStack(prev => prev.slice(0, -1));
        
        canvas.loadFromJSON(nextState).then(() => {
          canvas.renderAll();
        });
      }
    };

    (window as any).drawingCanvas = api;
    console.log('Drawing canvas API attached to window');

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [undoStack, redoStack, getCurrentFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto cursor-crosshair"
      style={{ zIndex: 10 }}
    />
  );
};
