
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
  const isInitializedRef = useRef(false);
  const redrawTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current frame number (30fps) - STABLE
  const getCurrentFrame = useCallback(() => Math.floor(currentTime * 30), [currentTime]);

  // Initialize canvas ONCE - STABLE
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef?.current;
    
    if (!canvas || !video || isInitializedRef.current) {
      return false;
    }

    // Wait for video to have dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return false;
    }

    // Get video element's rendered size
    const videoRect = video.getBoundingClientRect();
    
    // Set canvas to match video size exactly
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
    
    // Position canvas to overlay video perfectly
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = `${videoRect.width}px`;
    canvas.style.height = `${videoRect.height}px`;

    const context = canvas.getContext('2d');
    if (!context) {
      return false;
    }

    // Configure context for smooth drawing
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = currentColor;
    context.lineWidth = 3;

    contextRef.current = context;
    isInitializedRef.current = true;
    
    console.log('✅ Canvas initialized successfully:', canvas.width, 'x', canvas.height);
    return true;
  }, [videoRef, currentColor]);

  // Draw a single path on canvas - STABLE
  const drawPath = useCallback((path: DrawingPath, context: CanvasRenderingContext2D, isPreview = false) => {
    context.save();
    context.strokeStyle = path.color;
    context.lineWidth = path.strokeWidth;
    
    if (isPreview) {
      context.globalAlpha = 0.7;
    }

    if (path.type === 'pen') {
      if (path.points.length >= 4) {
        context.beginPath();
        context.moveTo(path.points[0], path.points[1]);
        for (let i = 2; i < path.points.length; i += 2) {
          context.lineTo(path.points[i], path.points[i + 1]);
        }
        context.stroke();
      }
    } else if (path.type === 'line') {
      if (path.points.length >= 4) {
        context.beginPath();
        context.moveTo(path.points[0], path.points[1]);
        context.lineTo(path.points[2], path.points[3]);
        context.stroke();
      }
    } else if (path.type === 'rectangle') {
      if (path.points.length >= 4) {
        context.beginPath();
        context.rect(path.points[0], path.points[1], path.points[2], path.points[3]);
        context.stroke();
      }
    } else if (path.type === 'arrow') {
      if (path.points.length >= 4) {
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
    }

    context.restore();
  }, []);

  // Redraw canvas - DEBOUNCED AND STABLE
  const redrawCanvas = useCallback(() => {
    // Clear any pending redraw
    if (redrawTimeoutRef.current) {
      clearTimeout(redrawTimeoutRef.current);
    }

    redrawTimeoutRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      
      if (!canvas || !context || !isInitializedRef.current) {
        return;
      }

      // Clear canvas completely
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Only draw if annotations are enabled
      if (!annotations) {
        return;
      }

      const currentFrame = getCurrentFrame();
      const frameData = frameDrawings.find(f => f.frame === currentFrame);
      
      if (frameData && frameData.paths.length > 0) {
        console.log(`🎨 Redrawing ${frameData.paths.length} paths for frame ${currentFrame}`);
        frameData.paths.forEach(path => {
          drawPath(path, context);
        });
      }

      // Draw pending path if exists (for preview during drawing)
      if (pendingPathRef.current && isDrawingMode) {
        drawPath(pendingPathRef.current, context, true);
      }
    }, 16); // Debounce to ~60fps
  }, [getCurrentFrame, frameDrawings, drawPath, annotations, isDrawingMode]);

  // Add path to current frame - STABLE
  const addPathToFrame = useCallback((path: DrawingPath) => {
    const currentFrame = getCurrentFrame();
    
    setFrameDrawings(prev => {
      const existingFrameIndex = prev.findIndex(f => f.frame === currentFrame);
      
      if (existingFrameIndex >= 0) {
        const newFrameDrawings = [...prev];
        newFrameDrawings[existingFrameIndex] = {
          ...newFrameDrawings[existingFrameIndex],
          paths: [...newFrameDrawings[existingFrameIndex].paths, path],
          timestamp: Date.now()
        };
        console.log(`✅ Added ${path.type} to frame ${currentFrame}, total paths: ${newFrameDrawings[existingFrameIndex].paths.length}`);
        return newFrameDrawings;
      } else {
        const newFrameDrawing = {
          frame: currentFrame,
          paths: [path],
          timestamp: Date.now()
        };
        console.log(`✅ Created new frame ${currentFrame} with ${path.type}`);
        return [...prev, newFrameDrawing];
      }
    });
  }, [getCurrentFrame]);

  // Initialize canvas when video is ready - ONCE ONLY
  useEffect(() => {
    const video = videoRef?.current;
    if (!video || isInitializedRef.current) return;

    const handleVideoReady = () => {
      if (initializeCanvas()) {
        // Only redraw after successful initialization
        setTimeout(() => redrawCanvas(), 50);
      }
    };

    if (video.readyState >= 2 && video.videoWidth > 0) {
      handleVideoReady();
    } else {
      const handleLoad = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          handleVideoReady();
          video.removeEventListener('loadeddata', handleLoad);
          video.removeEventListener('canplay', handleLoad);
        }
      };
      
      video.addEventListener('loadeddata', handleLoad);
      video.addEventListener('canplay', handleLoad);
      
      return () => {
        video.removeEventListener('loadeddata', handleLoad);
        video.removeEventListener('canplay', handleLoad);
      };
    }
  }, []); // No dependencies to prevent re-runs

  // Handle frame changes - ONLY when frame actually changes
  useEffect(() => {
    const currentFrame = getCurrentFrame();
    
    if (currentFrame !== lastFrameRef.current && isInitializedRef.current) {
      console.log(`🎬 Frame change: ${lastFrameRef.current} → ${currentFrame}`);
      lastFrameRef.current = currentFrame;
      
      // Clear pending path only if not actively drawing
      if (!isDrawing) {
        pendingPathRef.current = null;
      }
      
      redrawCanvas();
    }
  }, [currentTime]); // ONLY currentTime dependency

  // Redraw when annotations toggle or frameDrawings change
  useEffect(() => {
    if (isInitializedRef.current) {
      redrawCanvas();
    }
  }, [annotations]);

  // Redraw when frameDrawings change - but with specific length check to avoid over-triggering
  useEffect(() => {
    if (isInitializedRef.current) {
      redrawCanvas();
    }
  }, [frameDrawings.length]);

  // Mouse event handlers - STABLE
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isInitializedRef.current) return;
    
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
    if (!isDrawingMode || !isDrawing || !startPoint || !isInitializedRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
      const newPath = [...currentPath, x, y];
      setCurrentPath(newPath);
      
      pendingPathRef.current = {
        type: 'pen',
        points: newPath,
        color: currentColor,
        strokeWidth: 3
      };
    } else {
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

    redrawCanvas();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isDrawing || !startPoint || !isInitializedRef.current) return;

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

    // Add final path if valid
    if (finalPath) {
      addPathToFrame(finalPath);
      console.log(`✅ COMPLETED: ${finalPath.type} drawing on frame ${getCurrentFrame()}`);
    }

    // Reset drawing state
    setCurrentPath([]);
    setStartPoint(null);
  };

  // Global API for drawing tools - STABLE
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
        console.log('🗑️ Clearing current frame drawings');
        const currentFrame = getCurrentFrame();
        setFrameDrawings(prev => prev.filter(f => f.frame !== currentFrame));
        pendingPathRef.current = null;
        if (isInitializedRef.current) {
          redrawCanvas();
        }
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
        console.log('↶ Undo performed for frame', currentFrame);
      },
      redo: () => {
        console.log('↷ Redo not implemented');
      },
      hasDrawingsForCurrentFrame: () => {
        const currentFrame = getCurrentFrame();
        const frameData = frameDrawings.find(f => f.frame === currentFrame);
        const result = frameData ? frameData.paths.length > 0 : false;
        console.log(`🔍 Frame ${currentFrame} has drawings:`, result);
        return result;
      },
      forceSave: () => {
        console.log('💾 Force save - drawings are automatically saved');
      },
      getAllFrameDrawings: () => {
        console.log('📊 Total frames with drawings:', frameDrawings.length);
        return frameDrawings;
      }
    };

    (window as any).drawingCanvas = api;
    console.log('🔗 Drawing canvas API attached');

    return () => {
      delete (window as any).drawingCanvas;
      if (redrawTimeoutRef.current) {
        clearTimeout(redrawTimeoutRef.current);
      }
    };
  }, [currentTool, currentColor, getCurrentFrame, frameDrawings, addPathToFrame, redrawCanvas]);

  // Don't render if video isn't ready
  if (!videoRef?.current) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${isDrawingMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      style={{ 
        zIndex: 10,
        opacity: annotations ? 1 : 0,
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
