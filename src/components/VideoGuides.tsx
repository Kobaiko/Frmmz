
import { useRef } from "react";

interface VideoGuidesProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  guides: {
    enabled: boolean;
    ratio: string;
    mask: boolean;
  };
}

export const VideoGuides = ({ videoRef, containerRef, guides }: VideoGuidesProps) => {
  if (!guides.enabled || !videoRef.current) return null;

  const video = videoRef.current;
  const videoRect = video.getBoundingClientRect();
  const containerRect = containerRef.current?.getBoundingClientRect();
  
  if (!containerRect) return null;

  const videoWidth = videoRect.width;
  const videoHeight = videoRect.height;
  
  let aspectRatio = 1;
  switch (guides.ratio) {
    case '2.35':
      aspectRatio = 2.35;
      break;
    case '1.85':
      aspectRatio = 1.85;
      break;
    case '16:9':
      aspectRatio = 16/9;
      break;
    case '9:16':
      aspectRatio = 9/16;
      break;
    case '4:3':
      aspectRatio = 4/3;
      break;
    case '1:1':
      aspectRatio = 1;
      break;
  }

  const guideWidth = aspectRatio > 1 ? videoWidth : videoHeight * aspectRatio;
  const guideHeight = aspectRatio > 1 ? videoWidth / aspectRatio : videoHeight;
  
  const left = (videoWidth - guideWidth) / 2;
  const top = (videoHeight - guideHeight) / 2;

  return (
    <>
      {/* Guide lines */}
      <div
        className="absolute border-2 border-yellow-400 border-dashed pointer-events-none"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${guideWidth}px`,
          height: `${guideHeight}px`,
          zIndex: 5
        }}
      />
      
      {/* Mask overlay */}
      {guides.mask && (
        <>
          {/* Top mask */}
          {top > 0 && (
            <div
              className="absolute bg-black pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: `${videoWidth}px`,
                height: `${top}px`,
                zIndex: 4
              }}
            />
          )}
          
          {/* Bottom mask */}
          {top + guideHeight < videoHeight && (
            <div
              className="absolute bg-black pointer-events-none"
              style={{
                left: 0,
                top: `${top + guideHeight}px`,
                width: `${videoWidth}px`,
                height: `${videoHeight - (top + guideHeight)}px`,
                zIndex: 4
              }}
            />
          )}
          
          {/* Left mask */}
          {left > 0 && (
            <div
              className="absolute bg-black pointer-events-none"
              style={{
                left: 0,
                top: `${top}px`,
                width: `${left}px`,
                height: `${guideHeight}px`,
                zIndex: 4
              }}
            />
          )}
          
          {/* Right mask */}
          {left + guideWidth < videoWidth && (
            <div
              className="absolute bg-black pointer-events-none"
              style={{
                left: `${left + guideWidth}px`,
                top: `${top}px`,
                width: `${videoWidth - (left + guideWidth)}px`,
                height: `${guideHeight}px`,
                zIndex: 4
              }}
            />
          )}
        </>
      )}
    </>
  );
};
