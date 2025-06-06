import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line } from "fabric";

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
  const isInitializedRef = useRef(false);
  const currentToolRef = useRef("pen");
  const currentColorRef = useRef("#ff6b35");
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastFrameRef = useRef<number>(-1);
  const apiAttachedRef = useRef(false);

  // Get current frame number (30fps)
  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Save current frame immediately
  const saveCurrentFrame = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
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
        return [...filtered, newDrawing];
      });
    } else {
      setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
    }
  }, [getCurrentFrame]);

  // Load drawings for a specific frame
  const loadDrawingsForFrame = useCallback((frame: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    console.log(`Loading drawings for frame ${frame}`);
    
    const frameDrawing = frameDrawings.find(f => f.frame === frame);
    
    if (frameDrawing && frameDrawing.canvasData) {
      console.log(`Found saved drawings for frame ${frame}`);
      try {
        canvas.loadFromJSON(frameDrawing.canvasData).then(() => {
          canvas.renderAll();
          console.log(`Successfully loaded ${canvas.getObjects().length} objects for frame ${frame}`);
        });
      } catch (error) {
        console.error('Error loading frame drawings:', error);
        canvas.clear();
        canvas.renderAll();
      }
    } else {
      console.log(`No drawings found for frame ${frame}, clearing canvas`);
      canvas.clear();
      canvas.renderAll();
    }
  }, [frameDrawings]);

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
      setTimeout(() => saveCurrentFrame(), 100);
    };

    const handleObjectAdded = () => {
      console.log('Object added to canvas');
      setTimeout(() => saveCurrentFrame(), 100);
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

    const handleMouseUp = (e: any) => {
      if (!isDrawingRef.current || currentToolRef.current === "pen" || !startPointRef.current) return;

      const pointer = canvas.getPointer(e.e);
      console.log(`Finishing ${currentToolRef.current} drawing at`, pointer);
      
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
        
        canvas.renderAll();
        
        // Save immediately after adding shape
        setTimeout(() => saveCurrentFrame(), 100);
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
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      isInitializedRef.current = false;
      apiAttachedRef.current = false;
    };
  }, [getCurrentFrame, loadDrawingsForFrame, saveCurrentFrame]);

  // Handle frame changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const currentFrame = getCurrentFrame();
    
    if (currentFrame !== lastFrameRef.current) {
      console.log(`Frame changed from ${lastFrameRef.current} to ${currentFrame}`);
      
      // Save current frame before switching
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
  }, [getCurrentFrame, frameDrawings, saveCurrentFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto cursor-crosshair"
      style={{ zIndex: 10 }}
    />
  );
};