
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
}

export const DrawingCanvas = ({ 
  currentTime = 0, 
  videoRef, 
  isDrawingMode = false, 
  annotations = true 
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff6b35");
  const [frameDrawings, setFrameDrawings] = useState<FrameDrawing[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Initialize canvas to match video dimensions exactly
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;
    
    if (!canvas || !video || canvasInitialized) return;

    // Wait for video to have dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Get the actual rendered size of the video element
    const videoRect = video.getBoundingClientRect();
    const videoComputedStyle = window.getComputedStyle(video);
    
    // Set canvas size to match the video display size exactly
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
    
    // Position canvas to overlay the video exactly
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = videoRect.width + 'px';
    canvas.style.height = videoRect.height + 'px';
    canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    contextRef.current = context;
    setCanvasInitialized(true);
    
    console.log('Canvas initialized:', {
      canvasSize: `${canvas.width}x${canvas.height}`,
      videoSize: `${videoRect.width}x${videoRect.height}`,
      videoNaturalSize: `${video.videoWidth}x${video.videoHeight}`
    });
  }, [videoRef, canvasInitialized, isDrawingMode]);

  // Update canvas pointer events when drawing mode changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvasInitialized) {
      canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
    }
  }, [isDrawingMode, canvasInitialized]);

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
      
      // Draw line
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      
      // Draw arrowhead
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
    
    if (!canvas || !context || !canvasInitialized) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!annotations) return;

    // Get current frame data
    const currentFrame = getCurrentFrame();
    const frameData = frameDrawings.find(f => f.frame === currentFrame);
    
    if (frameData) {
      frameData.paths.forEach(path => drawPath(path, context));
    }
  }, [canvasInitialized, annotations, getCurrentFrame, frameDrawings, drawPath]);

  // Initialize canvas when video is ready
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    const handleVideoReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        initializeCanvas();
      }
    };

    // Check if video is already loaded
    if (video.readyState >= 2) {
      handleVideoReady();
    } else {
      video.addEventListener('loadeddata', handleVideoReady);
      video.addEventListener('canplay', handleVideoReady);
      
      return () => {
        video.removeEventListener('loadeddata', handleVideoReady);
        video.removeEventListener('canplay', handleVideoReady);
      };
    }
  }, [initializeCanvas]);

  // Handle window resize to adjust canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasInitialized) {
        setCanvasInitialized(false);
        // Re-initialize on next frame
        requestAnimationFrame(() => {
          initializeCanvas();
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasInitialized, initializeCanvas]);

  // Redraw when time changes or annotations toggle
  useEffect(() => {
    if (canvasInitialized) {
      redrawCanvas();
    }
  }, [currentTime, annotations, frameDrawings, redrawCanvas, canvasInitialized]);

  // Add path to current frame
  const addPathToFrame = useCallback((path: DrawingPath) => {
    const currentFrame = getCurrentFrame();
    
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
  }, [getCurrentFrame]);

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode || !canvasInitialized) return;
    
    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    if (currentTool === 'pen') {
      setCurrentPath([x, y]);
    }

    console.log(`Started drawing ${currentTool} at (${x}, ${y})`);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingMode || !isDrawing || !startPoint || !canvasInitialized) return;
    
    const context = contextRef.current;
    if (!context) return;

    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === 'pen') {
      const newPath = [...currentPath, x, y];
      setCurrentPath(newPath);
      
      // Draw preview for pen tool
      const previewPath: DrawingPath = {
        type: 'pen',
        points: newPath,
        color: currentColor,
        strokeWidth: 3
      };
      
      redrawCanvas();
      drawPath(previewPath, context);
    } else {
      // Draw preview for other tools
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
    if (!isDrawingMode || !isDrawing || !startPoint || !canvasInitialized) return;

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
      console.log(`Completed ${finalPath.type} drawing`);
    }

    // Reset state
    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
  };

  // Global API for drawing tools
  useEffect(() => {
    const api = {
      setTool: (tool: string) => {
        console.log(`Setting tool to ${tool}`);
        setCurrentTool(tool);
      },
      setColor: (color: string) => {
        console.log(`Setting color to ${color}`);
        setCurrentColor(color);
      },
      clear: () => {
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
        console.log(`Cleared frame ${currentFrame}`);
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
        console.log(`Undo for frame ${currentFrame}`);
      },
      hasDrawingsForCurrentFrame: () => {
        const currentFrame = getCurrentFrame();
        const frameData = frameDrawings.find(f => f.frame === currentFrame);
        return frameData ? frameData.paths.length > 0 : false;
      }
    };

    (window as any).drawingCanvas = api;

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, [getCurrentFrame, frameDrawings, addPathToFrame]);

  if (!videoRef?.current) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${isDrawingMode ? 'cursor-crosshair' : ''}`}
      style={{ 
        zIndex: 10,
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
