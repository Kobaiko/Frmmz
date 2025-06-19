import { useEffect, useRef, useState, useCallback } from "react";

interface DrawingCanvasProps {
  currentTime?: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
  isDrawingMode?: boolean;
  annotations?: boolean;
  onDrawingStateChange?: (hasDrawing: boolean) => void;
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
}

export const DrawingCanvas = ({ 
  currentTime = 0, 
  videoRef, 
  isDrawingMode = false, 
  annotations = true,
  onDrawingStateChange
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [frameDrawings, setFrameDrawings] = useState<FrameDrawing[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [undoHistory, setUndoHistory] = useState<FrameDrawing[][]>([]);
  const [redoHistory, setRedoHistory] = useState<FrameDrawing[][]>([]);

  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Check if current frame has drawings and notify parent
  const checkCurrentFrameDrawings = useCallback(() => {
    const currentFrame = getCurrentFrame();
    const frameData = frameDrawings.find(f => f.frame === currentFrame);
    const hasDrawings = frameData ? frameData.paths.length > 0 : false;
    
    if (onDrawingStateChange) {
      onDrawingStateChange(hasDrawings);
    }
    
    return hasDrawings;
  }, [getCurrentFrame, frameDrawings, onDrawingStateChange]);

  // Update drawing state whenever frameDrawings or currentTime changes
  useEffect(() => {
    checkCurrentFrameDrawings();
  }, [checkCurrentFrameDrawings]);

  // Initialize canvas to match video dimensions exactly
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;
    
    if (!canvas || !video) return false;

    if (video.videoWidth === 0 || video.videoHeight === 0) return false;

    const videoContainer = video.parentElement;
    if (!videoContainer) return false;

    const videoRect = video.getBoundingClientRect();
    const containerRect = videoContainer.getBoundingClientRect();
    
    const relativeTop = videoRect.top - containerRect.top;
    const relativeLeft = videoRect.left - containerRect.left;
    
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
    
    canvas.style.position = 'absolute';
    canvas.style.top = relativeTop + 'px';
    canvas.style.left = relativeLeft + 'px';
    canvas.style.width = videoRect.width + 'px';
    canvas.style.height = videoRect.height + 'px';
    canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
    canvas.style.zIndex = '10';

    const context = canvas.getContext('2d');
    if (!context) return false;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    contextRef.current = context;
    
    return true;
  }, [videoRef, isDrawingMode]);

  // Setup canvas when video is ready
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    const handleVideoReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && !isInitialized) {
        const success = initializeCanvas();
        if (success) {
          setIsInitialized(true);
        }
      }
    };

    if (video.readyState >= 2) {
      handleVideoReady();
    }

    video.addEventListener('loadeddata', handleVideoReady);
    video.addEventListener('canplay', handleVideoReady);
    video.addEventListener('resize', handleVideoReady);
    
    return () => {
      video.removeEventListener('loadeddata', handleVideoReady);
      video.removeEventListener('canplay', handleVideoReady);
      video.removeEventListener('resize', handleVideoReady);
    };
  }, [initializeCanvas, isInitialized]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isInitialized) {
        setIsInitialized(false);
        setTimeout(() => {
          const success = initializeCanvas();
          if (success) {
            setIsInitialized(true);
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized, initializeCanvas]);

  // Update canvas pointer events when drawing mode changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && isInitialized) {
      canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
    }
  }, [isDrawingMode, isInitialized]);

  // Draw a single path
  const drawPath = useCallback((path: DrawingPath, context: CanvasRenderingContext2D) => {
    context.save();
    context.strokeStyle = path.color;
    context.lineWidth = path.strokeWidth;

    if (path.type === 'pen' && path.points.length >= 4) {
      context.beginPath();
      context.moveTo(path.points[0], path.points[1]);
      for (let i = 2; i < path.points.length; i += 2) {
        context.lineTo(path.points[i], path.points[i + 1]);
      }
      context.stroke();
    } else if (path.type === 'line' && path.points.length >= 4) {
      context.beginPath();
      context.moveTo(path.points[0], path.points[1]);
      context.lineTo(path.points[2], path.points[3]);
      context.stroke();
    } else if (path.type === 'rectangle' && path.points.length >= 4) {
      context.beginPath();
      context.rect(path.points[0], path.points[1], path.points[2], path.points[3]);
      context.stroke();
    } else if (path.type === 'arrow' && path.points.length >= 4) {
      const [x1, y1, x2, y2] = path.points;
      
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      
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

    context.restore();
  }, []);

  // Redraw canvas for current frame
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    if (!canvas || !context || !isInitialized) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!annotations) return;

    const currentFrame = getCurrentFrame();
    const frameData = frameDrawings.find(f => f.frame === currentFrame);
    
    if (frameData) {
      frameData.paths.forEach(path => drawPath(path, context));
    }
  }, [isInitialized, annotations, getCurrentFrame, frameDrawings, drawPath]);

  // Save state to history before making changes
  const saveToHistory = useCallback(() => {
    setUndoHistory(prev => [...prev, frameDrawings]);
    setRedoHistory([]); // Clear redo history when new action is performed
  }, [frameDrawings]);

  // Redraw when time changes or annotations toggle
  useEffect(() => {
    if (isInitialized) {
      redrawCanvas();
    }
  }, [currentTime, annotations, frameDrawings, redrawCanvas, isInitialized]);

  // Add path to current frame
  const addPathToFrame = useCallback((path: DrawingPath) => {
    const currentFrame = getCurrentFrame();
    
    saveToHistory(); // Save current state before adding new path
    
    setFrameDrawings(prev => {
      const existingIndex = prev.findIndex(f => f.frame === currentFrame);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          paths: [...updated[existingIndex].paths, path]
        };
        return updated;
      } else {
        return [...prev, { frame: currentFrame, paths: [path] }];
      }
    });
  }, [getCurrentFrame, saveToHistory]);

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    return { x, y };
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode || !isInitialized) return;
    
    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    if (currentTool === 'pen') {
      setCurrentPath([x, y]);
    }

    console.log(`Started drawing ${currentTool} at (${x}, ${y})`);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingMode || !isDrawing || !startPoint || !isInitialized) return;
    
    const context = contextRef.current;
    if (!context) return;

    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === 'pen') {
      const newPath = [...currentPath, x, y];
      setCurrentPath(newPath);
      
      const previewPath: DrawingPath = {
        type: 'pen',
        points: newPath,
        color: currentColor,
        strokeWidth: 3
      };
      
      redrawCanvas();
      drawPath(previewPath, context);
    } else {
      redrawCanvas();
      
      let previewPath: DrawingPath | null = null;
      
      if (currentTool === 'line') {
        previewPath = {
          type: 'line',
          points: [startPoint.x, startPoint.y, x, y],
          color: currentColor,
          strokeWidth: 3
        };
      } else if (currentTool === 'square') {
        previewPath = {
          type: 'rectangle',
          points: [startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y],
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
      
      if (previewPath) {
        drawPath(previewPath, context);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawingMode || !isDrawing || !startPoint || !isInitialized) return;

    const { x, y } = getCanvasCoordinates(e);
    let finalPath: DrawingPath | null = null;

    if (currentTool === 'pen' && currentPath.length >= 4) {
      finalPath = {
        type: 'pen',
        points: [...currentPath, x, y],
        color: currentColor,
        strokeWidth: 3
      };
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

    if (finalPath) {
      addPathToFrame(finalPath);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
  };

  // Global API for drawing tools with redo functionality
  useEffect(() => {
    const api = {
      setTool: (tool: string) => {
        setCurrentTool(tool);
      },
      setColor: (color: string) => {
        setCurrentColor(color);
      },
      clear: () => {
        saveToHistory();
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => {
          const updated = prev.filter(f => f.frame !== currentFrame);
          return updated;
        });
      },
      undo: () => {
        if (undoHistory.length > 0) {
          const previousState = undoHistory[undoHistory.length - 1];
          setRedoHistory(prev => [frameDrawings, ...prev]);
          setFrameDrawings(previousState);
          setUndoHistory(prev => prev.slice(0, -1));
        }
      },
      redo: () => {
        if (redoHistory.length > 0) {
          const nextState = redoHistory[0];
          setUndoHistory(prev => [...prev, frameDrawings]);
          setFrameDrawings(nextState);
          setRedoHistory(prev => prev.slice(1));
        }
      },
      hasDrawingsForCurrentFrame: () => {
        return checkCurrentFrameDrawings();
      }
    };

    (window as any).drawingCanvas = api;

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [getCurrentFrame, frameDrawings, undoHistory, redoHistory, saveToHistory, checkCurrentFrameDrawings]);

  if (!videoRef?.current) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute ${isDrawingMode ? 'cursor-crosshair' : ''}`}
      style={{ 
        opacity: annotations ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: isDrawingMode ? 'auto' : 'none'
      }}
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
