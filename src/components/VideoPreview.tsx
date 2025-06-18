
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
      // Small delay to ensure video has seeked to the correct time
      const generatePreview = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const video = previewVideoRef.current;
        
        if (ctx && video && video.videoWidth && video.videoHeight) {
          canvas.width = 160;
          canvas.height = 90;
          
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setPreviewImageUrl(canvas.toDataURL());
          } catch (error) {
            console.warn('Could not generate preview thumbnail:', error);
            setPreviewImageUrl('');
          }
        }
      };

      // Wait a bit for the video to seek
      const timeoutId = setTimeout(generatePreview, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isHovering, hoverTime, duration, previewVideoRef]);

  if (!isHovering || hoverTime < 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl pointer-events-none">
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
      <div className="text-center text-xs text-white font-medium">
        {formatTime(hoverTime)}
      </div>
    </div>
  );
};
