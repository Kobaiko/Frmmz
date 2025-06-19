
import { useRef, useEffect } from 'react';
import { Canvas, FabricObject } from 'fabric';

interface DrawingCanvasProps {
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  isDrawingMode: boolean;
  annotations: boolean;
  onDrawingComplete?: (hasDrawing: boolean) => void;
}

export const DrawingCanvas = ({ 
  currentTime, 
  videoRef, 
  isDrawingMode, 
  annotations,
  onDrawingComplete 
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Initialize Fabric.js canvas
    const fabricCanvas = new Canvas(canvas, {
      isDrawingMode: isDrawingMode,
      selection: false,
    });

    fabricCanvasRef.current = fabricCanvas;

    // Set up drawing brush
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = 3;
      fabricCanvas.freeDrawingBrush.color = '#FF4500'; // Orange color
    }

    // Position canvas over video
    const updateCanvasPosition = () => {
      const videoRect = video.getBoundingClientRect();
      const container = video.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      
      canvas.style.position = 'absolute';
      canvas.style.left = `${videoRect.left - containerRect.left}px`;
      canvas.style.top = `${videoRect.top - containerRect.top}px`;
      canvas.style.width = `${videoRect.width}px`;
      canvas.style.height = `${videoRect.height}px`;
      canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
      canvas.style.zIndex = isDrawingMode ? '10' : '5';
      
      fabricCanvas.setDimensions({
        width: videoRect.width,
        height: videoRect.height
      });
    };

    // Listen for drawing events
    fabricCanvas.on('path:created', () => {
      console.log('Drawing path created');
      // Check if there are any objects on the canvas
      const hasObjects = fabricCanvas.getObjects().length > 0;
      onDrawingComplete?.(hasObjects);
    });

    fabricCanvas.on('object:added', () => {
      console.log('Drawing object added');
      // Check if there are any objects on the canvas
      const hasObjects = fabricCanvas.getObjects().length > 0;
      onDrawingComplete?.(hasObjects);
    });

    fabricCanvas.on('object:removed', () => {
      console.log('Drawing object removed');
      // Check if there are any objects on the canvas
      const hasObjects = fabricCanvas.getObjects().length > 0;
      onDrawingComplete?.(hasObjects);
    });

    updateCanvasPosition();
    
    // Update position on resize
    const handleResize = () => updateCanvasPosition();
    window.addEventListener('resize', handleResize);
    
    // Update position when video loads
    video.addEventListener('loadedmetadata', updateCanvasPosition);

    return () => {
      window.removeEventListener('resize', handleResize);
      video.removeEventListener('loadedmetadata', updateCanvasPosition);
      fabricCanvas.dispose();
    };
  }, [videoRef, isDrawingMode, onDrawingComplete]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = isDrawingMode;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
        canvas.style.zIndex = isDrawingMode ? '10' : '5';
      }
    }
  }, [isDrawingMode]);

  // Function to clear all drawings
  const clearDrawings = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      onDrawingComplete?.(false);
    }
  };

  // Function to check if canvas has drawings
  const hasDrawings = () => {
    return fabricCanvasRef.current ? fabricCanvasRef.current.getObjects().length > 0 : false;
  };

  // Expose methods to parent component
  useEffect(() => {
    if (fabricCanvasRef.current) {
      (fabricCanvasRef.current as any).clearDrawings = clearDrawings;
      (fabricCanvasRef.current as any).hasDrawings = hasDrawings;
    }
  }, [fabricCanvasRef.current]);

  if (!annotations) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{ 
        zIndex: isDrawingMode ? 10 : 5,
        pointerEvents: isDrawingMode ? 'auto' : 'none'
      }}
    />
  );
};
