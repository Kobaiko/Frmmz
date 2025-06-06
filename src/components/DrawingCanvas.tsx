import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line, Circle, Triangle, Path } from "fabric";

interface DrawingCanvasProps {
  currentTime?: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

interface FrameDrawing {
  frame: number;
  canvasData: string;
  timestamp: number;
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
  const apiAttachedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current frame number (30fps)
  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Immediate save function (no debounce)
  const saveCurrentFrame = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isLoadingRef.current) return;
    
    const currentFrame = getCurrentFrame();
    const objects = canvas.getObjects();
    
    console.log(`Saving frame ${currentFrame} with ${objects.length} objects`);
    
    if (objects.length > 0) {
      const canvasData = JSON.stringify(canvas.toJSON());
      
      setFrameDrawings(prev => {
        const filtered = prev.filter(f => f.frame !== currentFrame);
        const newDrawing = { 
          frame: currentFrame, 
          canvasData, 
          timestamp: Date.now() 
        };
        const newDrawings = [...filtered, newDrawing];
        console.log(`Frame ${currentFrame} saved. Total frames:`, newDrawings.length);
        return newDrawings;
      });
    } else {
      setFrameDrawings(prev => {
        const filtered = prev.filter(f => f.frame !== currentFrame);
        console.log(`Frame ${currentFrame} cleared. Total frames:`, filtered.length);
        return filtered;
      });
    }
  }, [getCurrentFrame]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveCurrentFrame();
    }, 100);
  }, [saveCurrentFrame]);

  // Load drawings for a specific frame
  const loadDrawingsForFrame = useCallback((frame: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    console.log(`Loading drawings for frame ${frame}`);
    
    const frameDrawing = frameDrawings.find(f => f.frame === frame);
    
    if (frameDrawing && frameDrawing.canvasData) {
      console.log(`Found saved drawings for frame ${frame}`);
      try {
        isLoadingRef.current = true;
        canvas.loadFromJSON(frameDrawing.canvasData).then(() => {
          canvas.renderAll();
          isLoadingRef.current = false;
          console.log(`Successfully loaded ${canvas.getObjects().length} objects for frame ${frame}`);
        }).catch((error) => {
          console.error('Error loading frame drawings:', error);
          canvas.clear();
          canvas.renderAll();
          isLoadingRef.current = false;
        });
      } catch (error) {
        console.error('Error parsing frame drawings:', error);
        canvas.clear();
        canvas.renderAll();
        isLoadingRef.current = false;
      }
    } else {
      console.log(`No drawings found for frame ${frame}, clearing canvas`);
      canvas.clear();
      canvas.renderAll();
    }
  }, [frameDrawings]);

  // Save state for undo/redo
  const saveState = useCallback(() => {
    if (!fabricCanvasRef.current || isLoadingRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const canvasData = JSON.stringify(canvas.toJSON());
    
    setUndoStack(prev => [...prev.slice(-19), canvasData]);
    setRedoStack([]);
    
    // Save to frame storage immediately
    saveCurrentFrame();
  }, [saveCurrentFrame]);

  // Initialize Fabric.js canvas - ONLY ONCE
  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) return;

    console.log('Initializing Fabric.js canvas');
    
    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      selection: false,
      renderOnAddRemove: true,
      preserveObjectStacking: true
    });

    const brush = new PencilBrush(canvas);
    brush.color = currentColorRef.current;
    brush.width = 3;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = false;

    fabricCanvasRef.current = canvas;
    isInitializedRef.current = true;

    // Event handlers
    const handlePathCreated = () => {
      console.log('Free drawing path created');
      setTimeout(() => saveState(), 50);
    };

    const handleObjectAdded = () => {
      if (!isLoadingRef.current) {
        console.log('Object added to canvas');
        setTimeout(() => saveState(), 50);
      }
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
      
      // Remove preview shape if it exists
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
          // Create arrow as a group of line + arrowhead
          const angle = Math.atan2(pointer.y - startPoint.y, pointer.x - startPoint.x);
          const arrowLength = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2));
          
          if (arrowLength > 10) {
            // Main line
            shape = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
              stroke: currentColorRef.current,
              strokeWidth: 3,
              selectable: false,
              evented: false,
              opacity: 0.7
            });
          }
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
        let finalShape: any = null;

        if (currentToolRef.current === "line") {
          finalShape = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: currentColorRef.current,
            strokeWidth: 3,
            selectable: false,
            evented: false
          });
        } 
        else if (currentToolRef.current === "square") {
          const left = Math.min(startPoint.x, pointer.x);
          const top = Math.min(startPoint.y, pointer.y);
          const width = Math.abs(pointer.x - startPoint.x);
          const height = Math.abs(pointer.y - startPoint.y);
          
          if (width > 5 && height > 5) {
            finalShape = new Rect({
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
          }
        }
        else if (currentToolRef.current === "arrow") {
          const arrowLength = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2));
          
          if (arrowLength > 10) {
            // Main line
            const mainLine = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
              stroke: currentColorRef.current,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            canvas.add(mainLine);
            
            // Arrow head
            const angle = Math.atan2(pointer.y - startPoint.y, pointer.x - startPoint.x);
            const headLength = 15;
            const headAngle = Math.PI / 6;
            
            const arrowHead1 = new Line([
              pointer.x, 
              pointer.y,
              pointer.x - headLength * Math.cos(angle - headAngle),
              pointer.y - headLength * Math.sin(angle - headAngle)
            ], {
              stroke: currentColorRef.current,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            
            const arrowHead2 = new Line([
              pointer.x,
              pointer.y,
              pointer.x - headLength * Math.cos(angle + headAngle),
              pointer.y - headLength * Math.sin(angle + headAngle)
            ], {
              stroke: currentColorRef.current,
              strokeWidth: 3,
              selectable: false,
              evented: false
            });
            
            canvas.add(arrowHead1);
            canvas.add(arrowHead2);
            console.log('Arrow added to canvas');
          }
        }
        
        if (finalShape) {
          canvas.add(finalShape);
          console.log(`${currentToolRef.current} added to canvas`);
        }
        
        canvas.renderAll();
        
        // Save state after adding shape
        setTimeout(() => saveState(), 50);
      } catch (error) {
        console.error('Error adding shape to canvas:', error);
      }
      
      isDrawingRef.current = false;
      startPointRef.current = null;
      canvas.selection = false;
    };

    canvas.on('path:created', handlePathCreated);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    console.log('Fabric.js canvas initialized successfully');

    // Load drawings for current frame after initialization
    const currentFrame = getCurrentFrame();
    setTimeout(() => {
      loadDrawingsForFrame(currentFrame);
      lastFrameRef.current = currentFrame;
    }, 100);

    return () => {
      console.log('Component unmounting - disposing Fabric canvas');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      isInitializedRef.current = false;
      apiAttachedRef.current = false;
    };
  }, [getCurrentFrame, loadDrawingsForFrame, saveState]);

  // Handle frame changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const currentFrame = getCurrentFrame();
    
    if (currentFrame !== lastFrameRef.current) {
      console.log(`Frame changed from ${lastFrameRef.current} to ${currentFrame}`);
      
      // Force save current frame before switching
      if (lastFrameRef.current >= 0) {
        saveCurrentFrame();
      }
      
      // Load drawings for new frame
      setTimeout(() => {
        loadDrawingsForFrame(currentFrame);
        lastFrameRef.current = currentFrame;
      }, 150);
    }
  }, [currentTime, getCurrentFrame, loadDrawingsForFrame, saveCurrentFrame]);

  // Global API for drawing tools
  useEffect(() => {
    if (apiAttachedRef.current) return;
    
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
        
        isLoadingRef.current = true;
        canvas.loadFromJSON(previousState).then(() => {
          canvas.renderAll();
          isLoadingRef.current = false;
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
        
        isLoadingRef.current = true;
        canvas.loadFromJSON(nextState).then(() => {
          canvas.renderAll();
          isLoadingRef.current = false;
        });
      },
      hasDrawingsForCurrentFrame: () => {
        const currentFrame = getCurrentFrame();
        const canvas = fabricCanvasRef.current;
        const hasCanvasObjects = canvas ? canvas.getObjects().length > 0 : false;
        const hasStoredDrawings = frameDrawings.some(f => f.frame === currentFrame);
        const result = hasCanvasObjects || hasStoredDrawings;
        console.log(`Checking drawings for frame ${currentFrame}: canvas=${hasCanvasObjects}, stored=${hasStoredDrawings}, result=${result}`);
        return result;
      },
      forceSave: () => {
        console.log('API: Force saving current frame');
        
        // Clear any pending debounced saves
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        
        // Immediately save without debounce for critical moments
        saveCurrentFrame();
      },
      getAllFrameDrawings: () => {
        return frameDrawings;
      }
    };

    (window as any).drawingCanvas = api;
    apiAttachedRef.current = true;
    console.log('Drawing canvas API attached to window');

    return () => {
      if (apiAttachedRef.current) {
        delete (window as any).drawingCanvas;
        apiAttachedRef.current = false;
      }
    };
  }, [undoStack, redoStack, getCurrentFrame, frameDrawings, saveCurrentFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto cursor-crosshair"
      style={{ zIndex: 10 }}
    />
  );
};