
import { useRef, useState, useEffect } from "react";

interface VideoPreviewProps {
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  isHovering: boolean;
  hoverTime: number;
  timeFormat: 'timecode' | 'frames' | 'standard';
  duration: number;
}

export const VideoPreview = ({ 
  previewVideoRef, 
  isHovering, 
  hoverTime, 
  timeFormat, 
  duration 
}: VideoPreviewProps) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewFrame, setPreviewFrame] = useState<string>('');

  const formatTimeByFormat = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps
    
    switch (timeFormat) {
      case 'timecode':
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
      case 'frames':
        const totalFrames = Math.floor(seconds * 30); // Assuming 30fps
        return `${totalFrames}`;
      case 'standard':
        if (hours > 0) {
          return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      default:
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }
  };

  useEffect(() => {
    if (!isHovering) {
      setPreviewFrame('');
      return;
    }

    const video = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const onSeeked = () => {
      canvas.width = 160;
      canvas.height = 90;
      ctx.drawImage(video, 0, 0, 160, 90);
      setPreviewFrame(canvas.toDataURL());
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = hoverTime;

    return () => {
      video.removeEventListener('seeked', onSeeked);
    };
  }, [isHovering, hoverTime, previewVideoRef]);

  return (
    <>
      <canvas ref={previewCanvasRef} className="hidden" />
      {isHovering && previewFrame && (
        <div
          className="absolute -top-32 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700 z-20 pointer-events-none"
          style={{ left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%` }}
        >
          <img 
            src={previewFrame} 
            alt="Frame preview"
            className="rounded-t-lg w-40 h-auto border-b border-gray-700"
          />
          <div className="px-3 py-2 text-center font-mono">
            {formatTimeByFormat(hoverTime)}
          </div>
        </div>
      )}
    </>
  );
};
