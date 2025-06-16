import React from 'react';

interface VideoPreviewProps {
  isHovering: boolean;
  hoverTime: number;
  duration: number;
  // previewVideoRef is no longer directly used by this component's render method
  // as VideoTimeline handles the seeking of the referenced video.
  // We keep it in props if VideoTimeline still passes it, but it's unused here.
  previewVideoRef?: React.RefObject<HTMLVideoElement>;
  timeFormat?: 'timecode' | 'frames' | 'seconds';
  assetId?: string;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  isHovering,
  hoverTime,
  duration,
}) => {
  if (!isHovering || duration === 0) { // also check duration to prevent division by zero
    return null;
  }

  const previewWidth = 120; // Example width for the time display box
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%', // Position above the timeline
    left: `calc(${(hoverTime / duration) * 100}% - ${previewWidth / 2}px)`,
    width: `${previewWidth}px`,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: '8px', // Increased padding
    borderRadius: '6px', // Slightly more rounded
    color: 'white',
    textAlign: 'center',
    zIndex: 100,
    pointerEvents: 'none',
    transform: 'translateY(-12px)', // Slightly more offset
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // Added shadow for better depth
    fontSize: '13px', // Slightly larger font
  };

  return (
    <div style={positionStyle}>
      {/*
        Visual preview (thumbnail or video frame) would go here.
        For now, the main video element itself will be seeking,
        so this component primarily shows the time.
      */}
      {formatTime(hoverTime)}
    </div>
  );
};
