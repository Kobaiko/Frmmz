
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Rect, Line, FabricObject } from "fabric";

interface DrawingCanvasProps {
  currentTime?: number;
  onDrawingStart?: () => void;
}

interface FrameDrawing {
  frame: number;
  objects: any[];
}

export const DrawingCanvas = ({ currentTime = 0, onDrawingStart }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [frameDrawings, setFrameDrawings] = useState<FrameDrawing[]>([]);
  const tempObjectRef = useRef<FabricObject | null>(null);

  // Get current frame number (30fps)
  const getCurrentFrame = () => Math.floor(currentTime * 30);

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

      // Save drawing when pen tool creates a path
      canvas.on('path:created', (e) => {
        const currentFrame = getCurrentFrame();
        const pathData = e.path.toObject();
        
        setFrameDrawings(prev => {
          const existingFrame = prev.find(f => f.frame === currentFrame);
          if (existingFrame) {
            return prev.map(f => 
              f.frame === currentFrame 
                ? { ...f, objects: [...f.objects, pathData] }
                : f
            );
          } else {
            return [...prev, { frame: currentFrame, objects: [pathData] }];
          }
        });
        
        console.log(`Saved pen drawing for frame ${currentFrame}`);
      });

      // Mouse events for shape drawing
      canvas.on('mouse:down', (e) => {
        if (currentTool !== "pen" && e.pointer) {
          // Pause video when starting to draw
          if (onDrawingStart) {
            onDrawingStart();
          }
          
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
        const currentFrame = getCurrentFrame();
        
        // Remove temporary object
        if (tempObjectRef.current) {
          canvas.remove(tempObjectRef.current);
          tempObjectRef.current = null;
        }
        
        let finalObjects: any[] = [];

        if (currentTool === "line") {
          const lineData = {
            type: 'line',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            stroke: currentColor,
            strokeWidth: 3
          };
          finalObjects.push(lineData);
        } else if (currentTool === "square") {
          const left = Math.min(startPoint.x, endPoint.x);
          const top = Math.min(startPoint.y, endPoint.y);
          const width = Math.abs(endPoint.x - startPoint.x);
          const height = Math.abs(endPoint.y - startPoint.y);
          
          const rectData = {
            type: 'rect',
            left,
            top,
            width,
            height,
            fill: 'transparent',
            stroke: currentColor,
            strokeWidth: 3
          };
          finalObjects.push(rectData);
        } else if (currentTool === "arrow") {
          const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
          const headLength = 20;
          
          const mainLineData = {
            type: 'line',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y,
            stroke: currentColor,
            strokeWidth: 3
          };
          
          const head1Data = {
            type: 'line',
            x1: endPoint.x,
            y1: endPoint.y,
            x2: endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
            y2: endPoint.y - headLength * Math.sin(angle - Math.PI / 6),
            stroke: currentColor,
            strokeWidth: 3
          };
          
          const head2Data = {
            type: 'line',
            x1: endPoint.x,
            y1: endPoint.y,
            x2: endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
            y2: endPoint.y - headLength * Math.sin(angle + Math.PI / 6),
            stroke: currentColor,
            strokeWidth: 3
          };
          
          finalObjects.push(mainLineData, head1Data, head2Data);
        }
        
        // Save objects for current frame
        if (finalObjects.length > 0) {
          setFrameDrawings(prev => {
            const existingFrame = prev.find(f => f.frame === currentFrame);
            if (existingFrame) {
              return prev.map(f => 
                f.frame === currentFrame 
                  ? { ...f, objects: [...f.objects, ...finalObjects] }
                  : f
              );
            } else {
              return [...prev, { frame: currentFrame, objects: finalObjects }];
            }
          });
          
          console.log(`Saved ${currentTool} with ${finalObjects.length} objects for frame ${currentFrame}`);
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

  // Update canvas when frame changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const currentFrame = getCurrentFrame();
    
    // Clear canvas
    canvas.clear();
    canvas.backgroundColor = 'transparent';
    
    // Load drawings for current frame
    const frameDrawing = frameDrawings.find(f => f.frame === currentFrame);
    if (frameDrawing) {
      frameDrawing.objects.forEach(objData => {
        let fabricObj: FabricObject | null = null;
        
        if (objData.type === 'path') {
          // Handle pen drawings
          fabricObj = new FabricObject(objData);
        } else if (objData.type === 'line') {
          fabricObj = new Line([objData.x1, objData.y1, objData.x2, objData.y2], {
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth,
            selectable: false,
            evented: false,
          });
        } else if (objData.type === 'rect') {
          fabricObj = new Rect({
            left: objData.left,
            top: objData.top,
            width: objData.width,
            height: objData.height,
            fill: objData.fill,
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth,
            selectable: false,
            evented: false,
          });
        }
        
        if (fabricObj) {
          canvas.add(fabricObj);
        }
      });
    }
    
    canvas.renderAll();
    console.log(`Loaded drawings for frame ${currentFrame}`);
  }, [currentTime, frameDrawings]);

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
        // Pause video when switching to drawing tool
        if (tool !== "pen" && onDrawingStart) {
          onDrawingStart();
        }
        console.log(`Drawing tool changed to: ${tool}`);
      },
      setColor: (color: string) => {
        setCurrentColor(color);
        console.log(`Drawing color changed to: ${color}`);
      },
      clear: () => {
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
        
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.clear();
          fabricCanvasRef.current.backgroundColor = 'transparent';
          fabricCanvasRef.current.renderAll();
        }
        console.log(`Cleared drawings for frame ${currentFrame}`);
      },
      undo: () => {
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => {
          const frameDrawing = prev.find(f => f.frame === currentFrame);
          if (frameDrawing && frameDrawing.objects.length > 0) {
            return prev.map(f => 
              f.frame === currentFrame 
                ? { ...f, objects: f.objects.slice(0, -1) }
                : f
            );
          }
          return prev;
        });
        console.log(`Undo action for frame ${currentFrame}`);
      },
      redo: () => {
        // Simplified redo - just log for now
        console.log('Redo action performed');
      }
    };

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [frameDrawings, onDrawingStart]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
