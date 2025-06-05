
import { useRef, useState } from "react";

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

  const updatePreviewFrame = (time: number) => {
    const previewVideo = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    if (!previewVideo || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use the preview video element (doesn't affect main playback)
    previewVideo.currentTime = time;
    
    // Wait for seeked event to ensure frame is loaded
    const handleSeeked = () => {
      canvas.width = 160;
      canvas.height = 90;
      ctx.drawImage(previewVideo, 0, 0, 160, 90);
      setPreviewFrame(canvas.toDataURL());
      previewVideo.removeEventListener('seeked', handleSeeked);
    };

    previewVideo.addEventListener('seeked', handleSeeked);
  };

  // Update preview when hover time changes
  if (isHovering) {
    updatePreviewFrame(hoverTime);
  }

  if (!isHovering) return null;

  return (
    <>
      <canvas
        ref={previewCanvasRef}
        style={{ display: 'none' }}
      />
      <div
        className="absolute -top-32 transform -translate-x-1/2 bg-gray-200 text-black text-xs rounded-lg shadow-xl border border-gray-300 z-20"
        style={{ left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%` }}
      >
        {/* Frame preview */}
        {previewFrame && (
          <div className="mb-1">
            <img 
              src={previewFrame} 
              alt="Frame preview"
              className="rounded-t-lg w-40 h-auto border-b border-gray-300"
            />
          </div>
        )}
        {/* Time display with selected format */}
        <div className="px-3 py-2 text-center font-mono">
          {formatTimeByFormat(hoverTime)}
        </div>
      </div>
    </>
  );
};
