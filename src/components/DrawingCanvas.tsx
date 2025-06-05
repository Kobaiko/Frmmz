
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, CircleBrush, SprayBrush } from "fabric";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff0000");

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const parentElement = canvasRef.current.parentElement;
      const width = parentElement?.clientWidth || 800;
      const height = parentElement?.clientHeight || 450;

      fabricCanvasRef.current = new FabricCanvas(canvasRef.current, {
        isDrawingMode: true,
        width: width,
        height: height,
        backgroundColor: 'transparent',
      });

      // Initialize the freeDrawingBrush
      const brush = new PencilBrush(fabricCanvasRef.current);
      brush.color = currentColor;
      brush.width = 3;
      fabricCanvasRef.current.freeDrawingBrush = brush;

      // Listen for window resize to adjust canvas size
      const handleResize = () => {
        if (fabricCanvasRef.current && parentElement) {
          const newWidth = parentElement.clientWidth;
          const newHeight = parentElement.clientHeight;
          fabricCanvasRef.current.setDimensions({
            width: newWidth,
            height: newHeight
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
      fabricCanvasRef.current.freeDrawingBrush.color = currentColor;
    }
  }, [currentColor]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      let brush;
      switch (currentTool) {
        case "circle":
          brush = new CircleBrush(fabricCanvasRef.current);
          break;
        case "spray":
          brush = new SprayBrush(fabricCanvasRef.current);
          break;
        case "pen":
        default:
          brush = new PencilBrush(fabricCanvasRef.current);
          break;
      }
      brush.color = currentColor;
      brush.width = 3;
      fabricCanvasRef.current.freeDrawingBrush = brush;
    }
  }, [currentTool, currentColor]);

  // Expose methods to parent components through global functions
  useEffect(() => {
    (window as any).drawingCanvas = {
      setTool: (tool: string) => {
        setCurrentTool(tool);
        console.log(`Drawing tool changed to: ${tool}`);
      },
      setColor: (color: string) => {
        setCurrentColor(color);
        console.log(`Drawing color changed to: ${color}`);
      },
      clear: () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.clear();
          console.log('Drawing canvas cleared');
        }
      },
      undo: () => {
        if (fabricCanvasRef.current) {
          const objects = fabricCanvasRef.current.getObjects();
          if (objects.length > 0) {
            fabricCanvasRef.current.remove(objects[objects.length - 1]);
            fabricCanvasRef.current.renderAll();
            console.log('Undo drawing action');
          }
        }
      },
      redo: () => {
        // Implement redo functionality
        console.log('Redo drawing action');
      }
    };

    return () => {
      delete (window as any).drawingCanvas;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 10 }}
    />
  );
};
