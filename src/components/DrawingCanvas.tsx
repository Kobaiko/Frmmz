import { useEffect, useRef, useState, useCallback } from "react";

interface DrawingCanvasProps {
  currentTime?: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isDrawingMode?: boolean;
  annotations?: boolean;
}

interface DrawingPath {
  type: 'pen' | 'line' | 'rectangle' | 'arrow';
  points: number[];
  color: string;
  strokeWidth: number;
}

interface FrameDrawing {
  frame: number;
  paths: DrawingPath[];
  timestamp: number;
}

export const DrawingCanvas = ({ currentTime = 0, videoRef, isDrawingMode = false, annotations = true }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [frameDrawings, setFrameDrawings] = useState<FrameDrawing[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const lastFrameRef = useRef<number>(-1);
  const pendingPathRef = useRef<DrawingPath | null>(null);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current frame number (30fps)
  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Initialize canvas properly
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const container = canvas.parentElement;
    if (!container) return false;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 600;

    const context = canvas.getContext('2d');
    if (!context) return false;

    // Configure context for drawing
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = currentColor;
    context.lineWidth = 3;

    contextRef.current = context;
    
    console.log('✅ Canvas INITIALIZED:', canvas.width, 'x', canvas.height);
    return true;
  }, [currentColor]);

  // Initialize canvas when component mounts or when container size changes
  useEffect(() => {
    const initWithRetry = () => {
      if (initializeCanvas()) {
        // Canvas initialized successfully, now redraw existing content
        setTimeout(() => {
          redrawCanvas();
        }, 50);
      } else {
        // Retry initialization after a short delay
        initializationTimeoutRef.current = setTimeout(initWithRetry, 100);
      }
    };

    initWithRetry();

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, []);

  // Draw a single path on canvas
  const drawPath = useCallback((path: DrawingPath, context: CanvasRenderingContext2D, isPreview = false) => {
    context.save();
    context.strokeStyle = path.color;
    context.lineWidth = path.strokeWidth;
    
    if (isPreview) {
      context.globalAlpha = 0.7;
    }

    if (path.type === 'pen') {
      // Draw freehand path
      if (path.points.length >= 4) {
        context.beginPath();
        context.moveTo(path.points[0], path.points[1]);
        for (let i = 2; i < path.points.length; i += 2) {
          context.lineTo(path.points[i], path.points[i + 1]);
        }
        context.stroke();
      }
    } else if (path.type === 'line') {
      // Draw line
      if (path.points.length >= 4) {
        context.beginPath();
        context.moveTo(path.points[0], path.points[1]);
        context.lineTo(path.points[2], path.points[3]);
        context.stroke();
      }
    } else if (path.type === 'rectangle') {
      // Draw rectangle
      if (path.points.length >= 4) {
        context.beginPath();
        context.rect(path.points[0], path.points[1], path.points[2], path.points[3]);
        context.stroke();
      }
    } else if (path.type === 'arrow') {
      // Draw arrow
      if (path.points.length >= 4) {
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
    }

    context.restore();
  }, []);

  // Redraw all paths for current frame
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) {
      console.log('❌ Cannot redraw - canvas or context missing');
      return;
    }

    // Always clear canvas first
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw if annotations are enabled
    if (!annotations) {
      console.log('🔇 Annotations disabled - canvas cleared but drawings preserved');
      return;
    }

    const currentFrame = getCurrentFrame();
    const frameData = frameDrawings.find(f => f.frame === currentFrame);
    
    if (frameData && frameData.paths.length > 0) {
      console.log(`🎨 Redrawing ${frameData.paths.length} paths for frame ${currentFrame}`);
      frameData.paths.forEach(path => {
        drawPath(path, context);
      });
    } else {
      console.log(`📭 No drawings for frame ${currentFrame}`);
    }

    // Draw pending path if exists (for preview during drawing)
    if (pendingPathRef.current && isDrawingMode) {
      drawPath(pendingPathRef.current, context, true);
    }
  }, [getCurrentFrame, frameDrawings, drawPath, annotations, isDrawingMode]);

  // Add path to current frame - PERSISTENT STORAGE
  const addPathToFrame = useCallback((path: DrawingPath) => {
    const currentFrame = getCurrentFrame();
    
    setFrameDrawings(prev => {
      const existingFrameIndex = prev.findIndex(f => f.frame === currentFrame);
      
      if (existingFrameIndex >= 0) {
        // Update existing frame
        const newFrameDrawings = [...prev];
        newFrameDrawings[existingFrameIndex] = {
          ...newFrameDrawings[existingFrameIndex],
          paths: [...newFrameDrawings[existingFrameIndex].paths, path],
          timestamp: Date.now()
        };
        console.log(`✅ Added ${path.type} to existing frame ${currentFrame}. Total paths: ${newFrameDrawings[existingFrameIndex].paths.length}`);
        return newFrameDrawings;
      } else {
        // Create new frame
        const newFrameDrawing = {
          frame: currentFrame,
          paths: [path],
          timestamp: Date.now()
        };
        console.log(`✅ Created new frame ${currentFrame} with ${path.type}. Total frames: ${prev.length + 1}`);
        return [...prev, newFrameDrawing];
      }
    });

    console.log(`💾 PERSISTENT: Added ${path.type} to frame ${currentFrame}`);
  }, [getCurrentFrame]);

  // Handle frame changes - PRESERVE DRAWINGS
  useEffect(() => {
    const currentFrame = getCurrentFrame();
    
    if (currentFrame !== lastFrameRef.current) {
      console.log(`🎬 Frame changed from ${lastFrameRef.current} to ${currentFrame}`);
      lastFrameRef.current = currentFrame;
      
      // Clear any pending path
      pendingPathRef.current = null;
      
      // Redraw canvas for new frame - this will show existing drawings
      setTimeout(() => {
        redrawCanvas();
      }, 50);
    }
  }, [currentTime, getCurrentFrame, redrawCanvas]);

  // Redraw when frameDrawings change OR annotations toggle - MAINTAIN PERSISTENCE
  useEffect(() => {
    redrawCanvas();
  }, [frameDrawings, redrawCanvas, annotations]);

  // Mouse event handlers - Only work in drawing mode AND when annotations are visible
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return; // Drawing should work regardless of annotations visibility
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (currentTool === 'pen') {
      setCurrentPath([x, y]);
    }

    console.log(`🖱️ Started drawing ${currentTool} at (${x}, ${y})`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return; // Drawing should work regardless of annotations visibility
    
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing || !startPoint) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
      // For pen, add to current path and update preview
      const newPath = [...currentPath, x, y];
      setCurrentPath(newPath);
      
      pendingPathRef.current = {
        type: 'pen',
        points: newPath,
        color: currentColor,
        strokeWidth: 3
      };
    } else {
      // For shapes, create preview path
      let previewPath: DrawingPath | null = null;

      if (currentTool === 'line') {
        previewPath = {
          type: 'line',
          points: [startPoint.x, startPoint.y, x, y],
          color: currentColor,
          strokeWidth: 3
        };
      } else if (currentTool === 'square') {
        const width = x - startPoint.x;
        const height = y - startPoint.y;
        previewPath = {
          type: 'rectangle',
          points: [startPoint.x, startPoint.y, width, height],
          color: currentColor,
          strokeWidth: 3
        };
      } else if (currentTool === 'arrow') {
        previewPath = {
          type: 'arrow',
          points: [startPoint.x, startPoint.y, x, y],
          color: currentColor,
          strokeWidth: 3
        };
      }

      pendingPathRef.current = previewPath;
    }

    // Redraw with preview
    redrawCanvas();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(false);

    let finalPath: DrawingPath | null = null;

    if (currentTool === 'pen') {
      if (currentPath.length >= 4) {
        finalPath = {
          type: 'pen',
          points: [...currentPath, x, y],
          color: currentColor,
          strokeWidth: 3
        };
      }
    } else if (currentTool === 'line') {
      finalPath = {
        type: 'line',
        points: [startPoint.x, startPoint.y, x, y],
        color: currentColor,
        strokeWidth: 3
      };
    } else if (currentTool === 'square') {
      const width = x - startPoint.x;
      const height = y - startPoint.y;
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        finalPath = {
          type: 'rectangle',
          points: [startPoint.x, startPoint.y, width, height],
          color: currentColor,
          strokeWidth: 3
        };
      }
    } else if (currentTool === 'arrow') {
      const distance = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
      if (distance > 10) {
        finalPath = {
          type: 'arrow',
          points: [startPoint.x, startPoint.y, x, y],
          color: currentColor,
          strokeWidth: 3
        };
      }
    }

    // Clear pending path
    pendingPathRef.current = null;

    // Add final path if valid - THIS MAKES IT PERSISTENT
    if (finalPath) {
      addPathToFrame(finalPath);
      console.log(`✅ COMPLETED: ${finalPath.type} drawing - NOW PERSISTENT`);
    }

    // Reset drawing state
    setCurrentPath([]);
    setStartPoint(null);
  };

  // Global API for drawing tools
  useEffect(() => {
    const api = {
      setTool: (tool: string) => {
        console.log(`🔧 Setting tool to ${tool}`);
        setCurrentTool(tool);
      },
      setColor: (color: string) => {
        console.log(`🎨 Setting color to ${color}`);
        setCurrentColor(color);
      },
      clear: () => {
        console.log('🗑️ Clearing canvas');
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
        pendingPathRef.current = null;
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
                  ? { ...f, paths: newPaths, timestamp: Date.now() }
                  : f
              );
            } else {
              return prev.filter(f => f.frame !== currentFrame);
            }
          }
          return prev;
        });
        console.log('↶ Undo performed');
      },
      redo: () => {
        console.log('↷ Redo not implemented');
      },
      hasDrawingsForCurrentFrame: () => {
        const currentFrame = getCurrentFrame();
        const frameData = frameDrawings.find(f => f.frame === currentFrame);
        const result = frameData ? frameData.paths.length > 0 : false;
        console.log(`🔍 Frame ${currentFrame} has drawings: ${result}`);
        return result;
      },
      forceSave: () => {
        console.log('💾 Force save - drawings are automatically saved');
        // Drawings are automatically saved when completed, no action needed
      },
      getAllFrameDrawings: () => {
        return frameDrawings;
      }
    };

    (window as any).drawingCanvas = api;
    console.log('🔗 Drawing canvas API attached');

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [currentTool, currentColor, getCurrentFrame, frameDrawings, addPathToFrame]);

  // Always render the canvas - visibility controlled by annotations prop
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${isDrawingMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      style={{ 
        zIndex: 10,
        opacity: annotations ? 1 : 0, // Smooth hide/show instead of removing from DOM
        transition: 'opacity 0.2s ease-in-out'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDrawing) {
          setIsDrawing(false);
          setCurrentPath([]);
          setStartPoint(null);
          pendingPathRef.current = null;
          redrawCanvas();
        }
      }}
    />
  );
};