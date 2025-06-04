
import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";

export const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new FabricCanvas(canvasRef.current, {
        isDrawingMode: true,
        width: canvasRef.current.parentElement?.clientWidth || 800,
        height: canvasRef.current.parentElement?.clientHeight || 450,
      });

      const brush = new PencilBrush(fabricCanvasRef.current);
      brush.color = "#ff0000";
      brush.width = 3;
      fabricCanvasRef.current.freeDrawingBrush = brush;
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
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
