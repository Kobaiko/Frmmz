
import { useRef, useEffect, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

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
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [hasActiveDrawing, setHasActiveDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Initialize Fabric.js canvas
    const fabricCanvas = new FabricCanvas(canvas, {
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
      setHasActiveDrawing(true);
      onDrawingComplete?.(true);
    });

    fabricCanvas.on('object:added', () => {
      console.log('Drawing object added');
      setHasActiveDrawing(true);
      onDrawingComplete?.(true);
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
