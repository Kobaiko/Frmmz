
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
  const currentToolRef = useRef("pen");
  const currentColorRef = useRef("#ff6b35");
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<any>(null);
  const lastFrameRef = useRef<number>(-1);

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

  // Initialize Fabric.js canvas ONCE
  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) return;

    console.log('Initializing Fabric.js canvas');
    
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
    brush.color = currentColorRef.current;
    brush.width = 3;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = currentToolRef.current === "pen";

    fabricCanvasRef.current = canvas;
    isInitializedRef.current = true;

    // Set up event handlers
    const handlePathCreated = () => {
      console.log('Free drawing path created');
      saveState();
    };

    const handleMouseDown = (e: any) => {
      if (currentToolRef.current === "pen") return;
      
      const pointer = canvas.getPointer(e.e);
      console.log(`Starting ${currentToolRef.current} drawing at`, pointer);
      
      isDrawingRef.current = true;
      startPointRef.current = { x: pointer.x, y: pointer.y };
      
      canvas.selection = false;
      canvas.discardActiveObject();
    };

    const handleMouseMove = (e: any) => {
      if (!isDrawingRef.current || currentToolRef.current === "pen" || !startPointRef.current) return;

      const pointer = canvas.getPointer(e.e);
      
      // Remove previous preview shape
      if (currentShapeRef.current) {
        canvas.remove(currentShapeRef.current);
        currentShapeRef.current = null;
      }

      const startPoint = startPointRef.current;
      let shape: any = null;

      try {
        if (currentToolRef.current === "line") {
          shape = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: currentColorRef.current,
            strokeWidth: 3,
            selectable: false,
            evented: false,
            opacity: 0.7
          });
        } 
        else if (currentToolRef.current === "square") {
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
            stroke: currentColorRef.current,
            strokeWidth: 3,
            selectable: false,
            evented: false,
            opacity: 0.7
          });
        }
        else if (currentToolRef.current === "arrow") {
          shape = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: currentColorRef.current,
            strokeWidth: 3,
            selectable: false,
            evented: false,
            opacity: 0.7
          });
        }

        if (shape) {
          canvas.add(shape);
          currentShapeRef.current = shape;
          canvas.renderAll();
        }
      } catch (error) {
        console.error('Error creating preview shape:', error);
      }
    };

    const handleMouseUp = (e: any) => {
      if (!isDrawingRef.current || currentToolRef.current === "pen" || !startPointRef.current) return;

      const pointer = canvas.getPointer(e.e);
      console.log(`Finishing ${currentToolRef.current} drawing at`, pointer);
      
      // Remove preview shape
      if (currentShapeRef.current) {
        canvas.remove(currentShapeRef.current);
        currentShapeRef.current = null;
      }

      const startPoint = startPointRef.current;
      
      try {
        if (currentToolRef.current === "line") {
          const line = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: currentColorRef.current,
            strokeWidth: 3,
            selectable: false,
            evented: false
          });
          canvas.add(line);
          console.log('Line added to canvas');
        } 
        else if (currentToolRef.current === "square") {
          const left = Math.min(startPoint.x, pointer.x);
          const top = Math.min(startPoint.y, pointer.y);
          const width = Math.abs(pointer.x - startPoint.x);
          const height = Math.abs(pointer.y - startPoint.y);
          
          if (width > 5 && height > 5) {
            const rect = new Rect({
              left,
              top,
              width,
              height,
              fill: 'transparent',
              stroke: currentColorRef.current,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            canvas.add(rect);
            console.log('Rectangle added to canvas');
          }
        }
        else if (currentToolRef.current === "arrow") {
          const angle = Math.atan2(pointer.y - startPoint.y, pointer.x - startPoint.x);
          const headLength = 20;
          
          const mainLine = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: currentColorRef.current,
            strokeWidth: 3,
            selectable: false,
            evented: false
          });
          
          const head1 = new Line([
            pointer.x,
            pointer.y,
            pointer.x - headLength * Math.cos(angle - Math.PI / 6),
            pointer.y - headLength * Math.sin(angle - Math.PI / 6)
          ], {
            stroke: currentColorRef.current,
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
            stroke: currentColorRef.current,
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
      isDrawingRef.current = false;
      startPointRef.current = null;
      canvas.selection = false;
    };

    // Add event listeners
    canvas.on('path:created', handlePathCreated);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    console.log('Fabric.js canvas initialized successfully');

    return () => {
      console.log('Disposing Fabric canvas');
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - initialize ONCE

  // Global API for drawing tools - STABLE reference
  useEffect(() => {
    const api = {
      setTool: (tool: string) => {
        console.log(`API: Setting tool to ${tool}`);
        currentToolRef.current = tool;
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          canvas.isDrawingMode = tool === "pen";
          canvas.selection = false;
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      },
      setColor: (color: string) => {
        console.log(`API: Setting color to ${color}`);
        currentColorRef.current = color;
        const canvas = fabricCanvasRef.current;
        if (canvas && canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = color;
        }
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

  // Load frame-specific drawings when time changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const currentFrame = getCurrentFrame();
    
    // Only update if frame actually changed
    if (currentFrame === lastFrameRef.current) return;
    
    // Save current frame's drawings before switching
    if (lastFrameRef.current >= 0) {
      const currentCanvasData = JSON.stringify(canvas.toJSON());
      setFrameDrawings(prev => {
        const filtered = prev.filter(f => f.frame !== lastFrameRef.current);
        if (canvas.getObjects().length > 0) {
          return [...filtered, { frame: lastFrameRef.current, canvasData: currentCanvasData }];
        }
        return filtered;
      });
    }
    
    lastFrameRef.current = currentFrame;
    
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto cursor-crosshair"
      style={{ zIndex: 10 }}
    />
  );
};
