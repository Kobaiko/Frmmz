import React, { useEffect, useRef } from 'react';

interface VideoPreviewProps {
  previewVideoRef: React.RefObject<HTMLVideoElement>;
  isHovering: boolean;
  hoverTime: number;
  timeFormat: 'timecode' | 'frames' | 'seconds'; // Or other relevant types
  duration: number;
  assetId?: string; // Added assetId as it's in VideoTimeline's props for VideoPreview
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  previewVideoRef,
  isHovering,
  hoverTime,
  timeFormat, // Currently unused, but available for future enhancement
  duration,
  assetId, // Currently unused
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovering && previewVideoRef.current && containerRef.current) {
      // Ensure the preview video's time is updated
      if (hoverTime >= 0 && hoverTime <= duration) {
        previewVideoRef.current.currentTime = hoverTime;
      }
    }
  }, [isHovering, hoverTime, duration, previewVideoRef]);

  if (!isHovering) {
    return null;
  }

  // Calculate position: This is a rough estimate.
  // In a real scenario, this would need to be calculated based on mouse position
  // and timeline dimensions, passed as props or derived.
  const previewWidth = 160; // Example width
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%', // Position above the timeline
    left: `calc(${(hoverTime / duration) * 100}% - ${previewWidth / 2}px)`,
    width: `${previewWidth}px`,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: '4px',
    borderRadius: '4px',
    color: 'white',
    textAlign: 'center',
    zIndex: 100, // Ensure it's above other elements
    pointerEvents: 'none', // So it doesn't interfere with mouse events on the timeline
    transform: 'translateY(-10px)', // Small offset from the timeline
  };

  return (
    <div ref={containerRef} style={positionStyle}>
      {previewVideoRef.current && (
        <video
          ref={previewVideoRef} // Note: This might cause issues if the same ref is used directly by VideoTimeline for its own video element.
                               // It's better if VideoTimeline owns the <video> element and passes the ref,
                               // and this component just uses the passed ref to *control* it or read from it.
                               // For now, we assume VideoTimeline passes a dedicated previewVideoRef.
          style={{ width: '100%', height: 'auto', display: 'block' }}
          muted
          // src will be set by the parent component managing the previewVideoRef
        />
      )}
      <div style={{ fontSize: '12px', marginTop: '4px' }}>
        {formatTime(hoverTime)}
      </div>
    </div>
  );
};

// Export as default if that was the original convention, or keep as named.
// Based on `import { VideoPreview } from "./VideoPreview";` in VideoTimeline.tsx, named export is correct.
