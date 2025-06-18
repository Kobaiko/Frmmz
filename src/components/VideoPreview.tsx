
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
      const video = previewVideoRef.current;
      
      // Wait for the video to seek to the correct time
      const handleSeeked = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.videoWidth && video.videoHeight) {
          canvas.width = 160;
          canvas.height = 90;
          
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setPreviewImageUrl(dataUrl);
            console.log('Generated preview thumbnail for time:', hoverTime);
          } catch (error) {
            console.warn('Could not generate preview thumbnail:', error);
            setPreviewImageUrl('');
          }
        }
      };

      // Set the time and wait for seek completion
      video.currentTime = hoverTime;
      video.addEventListener('seeked', handleSeeked, { once: true });
      
      // Cleanup function
      return () => {
        video.removeEventListener('seeked', handleSeeked);
      };
    }
  }, [isHovering, hoverTime, duration, previewVideoRef]);

  if (!isHovering || hoverTime < 0) {
    return null;
  }

  return (
    <div className="bg-gray-900/95 border border-gray-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
      <div className="w-40 h-24 bg-gray-800 rounded mb-2 overflow-hidden">
        {previewImageUrl ? (
          <img 
            src={previewImageUrl} 
            alt="Video preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
            Loading...
          </div>
        )}
      </div>
      <div className="text-center text-xs text-white font-medium">
        {formatTime(hoverTime)}
      </div>
    </div>
  );
};
