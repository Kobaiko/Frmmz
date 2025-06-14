
import { useState, useEffect } from "react";

interface VideoPreviewProps {
  assetId: string;
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  isHovering: boolean;
  hoverTime: number;
  timeFormat: 'timecode' | 'frames' | 'seconds';
  duration: number;
}

export const VideoPreview = ({ 
  assetId, 
  previewVideoRef, 
  isHovering, 
  hoverTime, 
  timeFormat, 
  duration 
}: VideoPreviewProps) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    switch (timeFormat) {
      case 'timecode':
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      case 'frames':
        // Assuming 30fps for frame calculation
        const totalFrames = Math.floor(seconds * 30);
        return `${totalFrames}f`;
      case 'seconds':
        return `${seconds.toFixed(1)}s`;
      default:
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  useEffect(() => {
    if (isHovering && previewVideoRef.current && hoverTime >= 0 && hoverTime <= duration) {
      // Generate preview thumbnail at hover time
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = previewVideoRef.current;
      
      if (ctx && video.videoWidth && video.videoHeight) {
        canvas.width = 160;
        canvas.height = 90;
        
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setPreviewImageUrl(canvas.toDataURL());
        } catch (error) {
          console.warn('Could not generate preview thumbnail:', error);
        }
      }
    }
  }, [isHovering, hoverTime, duration, previewVideoRef]);

  if (!isHovering || hoverTime < 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-2 shadow-xl">
        <div className="w-40 h-24 bg-gray-800 rounded mb-2 overflow-hidden">
          {previewImageUrl ? (
            <img 
              src={previewImageUrl} 
              alt="Video preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
              Preview
            </div>
          )}
        </div>
        <div className="text-center text-xs text-white">
          {formatTime(hoverTime)}
        </div>
      </div>
    </div>
  );
};
