import { useEffect, useRef, useState, useCallback } from "react";

interface DrawingCanvasProps {
  currentTime?: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

interface DrawingData {
  frame: number;
  paths: Array<{
    type: 'pen' | 'line' | 'rectangle' | 'arrow';
    points: number[];
    color: string;
    strokeWidth: number;
  }>;
}

export const DrawingCanvas = ({ currentTime = 0, videoRef }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [frameDrawings, setFrameDrawings] = useState<DrawingData[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const lastFrameRef = useRef<number>(-1);
  const isInitializedRef = useRef(false);

  // Get current frame number (30fps)
  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    // Set canvas size
    canvas.width = container.clientWidth || 800;
    canvas.height = container.clientHeight || 600;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Configure context
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = currentColor;
    context.lineWidth = 3;

    contextRef.current = context;
    isInitializedRef.current = true;

    console.log('Canvas initialized with size:', canvas.width, 'x', canvas.height);
  }, [currentColor]);

  // Save current frame drawings
  const saveCurrentFrame = useCallback(() => {
    const currentFrame = getCurrentFrame();
    const existingFrame = frameDrawings.find(f => f.frame === currentFrame);
    
    if (existingFrame && existingFrame.paths.length > 0) {
      console.log(`Frame ${currentFrame} already has ${existingFrame.paths.length} paths saved`);
      return;
    }

    // Get current frame data from canvas or existing data
    const currentFrameData = existingFrame || { frame: currentFrame, paths: [] };
    
    setFrameDrawings(prev => {
      const filtered = prev.filter(f => f.frame !== currentFrame);
      if (currentFrameData.paths.length > 0) {
        return [...filtered, currentFrameData];
      }
      return filtered;
    });

    console.log(`Saved frame ${currentFrame} with ${currentFrameData.paths.length} paths`);
  }, [getCurrentFrame, frameDrawings]);

  // Load drawings for frame
  const loadDrawingsForFrame = useCallback((frame: number) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Find frame data
    const frameData = frameDrawings.find(f => f.frame === frame);
    if (!frameData || frameData.paths.length === 0) {
      console.log(`No drawings found for frame ${frame}`);
      return;
    }

    console.log(`Loading ${frameData.paths.length} paths for frame ${frame}`);

    // Draw all paths for this frame
    frameData.paths.forEach(path => {
      context.strokeStyle = path.color;
      context.lineWidth = path.strokeWidth;

      if (path.type === 'pen') {
        // Draw freehand path
        context.beginPath();
        for (let i = 0; i < path.points.length; i += 2) {
          const x = path.points[i];
          const y = path.points[i + 1];
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      } else if (path.type === 'line') {
        // Draw line
        context.beginPath();
        context.moveTo(path.points[0], path.points[1]);
        context.lineTo(path.points[2], path.points[3]);
        context.stroke();
      } else if (path.type === 'rectangle') {
        // Draw rectangle
        context.beginPath();
        context.rect(path.points[0], path.points[1], path.points[2], path.points[3]);
        context.stroke();
      } else if (path.type === 'arrow') {
        // Draw arrow
        const [x1, y1, x2, y2] = path.points;
        
        // Main line
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        
        // Arrow head
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 15;
        const headAngle = Math.PI / 6;
        
        context.beginPath();
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - headLength * Math.cos(angle - headAngle),
          y2 - headLength * Math.sin(angle - headAngle)
        );
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - headLength * Math.cos(angle + headAngle),
          y2 - headLength * Math.sin(angle + headAngle)
        );
        context.stroke();
      }
    });
  }, [frameDrawings]);

  // Handle frame changes
  useEffect(() => {
    const currentFrame = getCurrentFrame();
    
    if (currentFrame !== lastFrameRef.current && lastFrameRef.current >= 0) {
      console.log(`Frame changed from ${lastFrameRef.current} to ${currentFrame}`);
      
      // Save current frame before switching
      saveCurrentFrame();
      
      // Load new frame
      setTimeout(() => {
        loadDrawingsForFrame(currentFrame);
        lastFrameRef.current = currentFrame;
      }, 50);
    } else if (lastFrameRef.current < 0) {
      // Initial load
      loadDrawingsForFrame(currentFrame);
      lastFrameRef.current = currentFrame;
    }
  }, [currentTime, getCurrentFrame, saveCurrentFrame, loadDrawingsForFrame]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (currentTool === 'pen') {
      context.beginPath();
      context.moveTo(x, y);
      setCurrentPath([x, y]);
    }

    console.log(`Started drawing ${currentTool} at (${x}, ${y})`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context || !isDrawing || !startPoint) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
      // Draw freehand
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
      
      setCurrentPath(prev => [...prev, x, y]);
    } else {
      // For shapes, clear and redraw with preview
      loadDrawingsForFrame(getCurrentFrame());
      
      context.strokeStyle = currentColor;
      context.lineWidth = 3;
      context.globalAlpha = 0.7;

      if (currentTool === 'line') {
        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(x, y);
        context.stroke();
      } else if (currentTool === 'square') {
        const width = x - startPoint.x;
        const height = y - startPoint.y;
        context.beginPath();
        context.rect(startPoint.x, startPoint.y, width, height);
        context.stroke();
      } else if (currentTool === 'arrow') {
        // Draw arrow preview
        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(x, y);
        context.stroke();
        
        // Arrow head
        const angle = Math.atan2(y - startPoint.y, x - startPoint.x);
        const headLength = 15;
        const headAngle = Math.PI / 6;
        
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(
          x - headLength * Math.cos(angle - headAngle),
          y - headLength * Math.sin(angle - headAngle)
        );
        context.moveTo(x, y);
        context.lineTo(
          x - headLength * Math.cos(angle + headAngle),
          y - headLength * Math.sin(angle + headAngle)
        );
        context.stroke();
      }

      context.globalAlpha = 1.0;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context || !isDrawing || !startPoint) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(false);

    const currentFrame = getCurrentFrame();
    let newPath: any = null;

    if (currentTool === 'pen') {
      if (currentPath.length >= 4) {
        newPath = {
          type: 'pen' as const,
          points: [...currentPath, x, y],
          color: currentColor,
          strokeWidth: 3
        };
      }
    } else if (currentTool === 'line') {
      newPath = {
        type: 'line' as const,
        points: [startPoint.x, startPoint.y, x, y],
        color: currentColor,
        strokeWidth: 3
      };
    } else if (currentTool === 'square') {
      const width = x - startPoint.x;
      const height = y - startPoint.y;
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        newPath = {
          type: 'rectangle' as const,
          points: [startPoint.x, startPoint.y, width, height],
          color: currentColor,
          strokeWidth: 3
        };
      }
    } else if (currentTool === 'arrow') {
      const distance = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
      if (distance > 10) {
        newPath = {
          type: 'arrow' as const,
          points: [startPoint.x, startPoint.y, x, y],
          color: currentColor,
          strokeWidth: 3
        };
      }
    }

    if (newPath) {
      setFrameDrawings(prev => {
        const existingFrame = prev.find(f => f.frame === currentFrame);
        if (existingFrame) {
          return prev.map(f => 
            f.frame === currentFrame 
              ? { ...f, paths: [...f.paths, newPath] }
              : f
          );
        } else {
          return [...prev, { frame: currentFrame, paths: [newPath] }];
        }
      });

      console.log(`Added ${currentTool} to frame ${currentFrame}`);
      
      // Redraw the frame with the new path
      setTimeout(() => loadDrawingsForFrame(currentFrame), 50);
    }

    setCurrentPath([]);
    setStartPoint(null);
  };

  // Global API
  useEffect(() => {
    const api = {
      setTool: (tool: string) => {
        console.log(`Setting tool to ${tool}`);
        setCurrentTool(tool);
      },
      setColor: (color: string) => {
        console.log(`Setting color to ${color}`);
        setCurrentColor(color);
        if (contextRef.current) {
          contextRef.current.strokeStyle = color;
        }
      },
      clear: () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;
        
        console.log('Clearing canvas');
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
      },
      undo: () => {
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => {
          const frameData = prev.find(f => f.frame === currentFrame);
          if (frameData && frameData.paths.length > 0) {
            const newPaths = frameData.paths.slice(0, -1);
            if (newPaths.length > 0) {
              return prev.map(f => 
                f.frame === currentFrame 
                  ? { ...f, paths: newPaths }
                  : f
              );
            } else {
              return prev.filter(f => f.frame !== currentFrame);
            }
          }
          return prev;
        });
        
        setTimeout(() => loadDrawingsForFrame(currentFrame), 50);
        console.log('Undo performed');
      },
      redo: () => {
        console.log('Redo not implemented');
      },
      hasDrawingsForCurrentFrame: () => {
        const currentFrame = getCurrentFrame();
        const frameData = frameDrawings.find(f => f.frame === currentFrame);
        const result = frameData ? frameData.paths.length > 0 : false;
        console.log(`Frame ${currentFrame} has drawings: ${result}`);
        return result;
      },
      forceSave: () => {
        console.log('Force saving current frame');
        saveCurrentFrame();
      },
      getAllFrameDrawings: () => {
        return frameDrawings;
      }
    };

    (window as any).drawingCanvas = api;
    console.log('Drawing canvas API attached');

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [currentTool, currentColor, getCurrentFrame, frameDrawings, saveCurrentFrame, loadDrawingsForFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto cursor-crosshair"
      style={{ zIndex: 10 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDrawing) {
          setIsDrawing(false);
          setCurrentPath([]);
          setStartPoint(null);
        }
      }}
    />
  );
};