
import { useEffect, useState } from "react";

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
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRects = () => {
      if (videoRef.current && containerRef.current) {
        setVideoRect(videoRef.current.getBoundingClientRect());
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };

    updateRects();
    window.addEventListener('resize', updateRects);
    
    return () => window.removeEventListener('resize', updateRects);
  }, [videoRef, containerRef, guides.enabled]);

  if (!guides.enabled || !videoRef.current || !videoRect || !containerRect) return null;

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

  // Calculate guide dimensions based on the video's actual display size
  const videoDisplayWidth = videoRect.width;
  const videoDisplayHeight = videoRect.height;
  
  const guideWidth = aspectRatio > 1 ? videoDisplayWidth : videoDisplayHeight * aspectRatio;
  const guideHeight = aspectRatio > 1 ? videoDisplayWidth / aspectRatio : videoDisplayHeight;
  
  // Center the guides within the video
  const left = (videoDisplayWidth - guideWidth) / 2;
  const top = (videoDisplayHeight - guideHeight) / 2;

  // Position relative to the container
  const videoLeft = videoRect.left - containerRect.left;
  const videoTop = videoRect.top - containerRect.top;

  return (
    <>
      {/* Guide lines */}
      <div
        className="absolute border-2 border-yellow-400 border-dashed pointer-events-none z-10"
        style={{
          left: `${videoLeft + left}px`,
          top: `${videoTop + top}px`,
          width: `${guideWidth}px`,
          height: `${guideHeight}px`,
        }}
      />
      
      {/* Mask overlay */}
      {guides.mask && (
        <>
          {/* Top mask */}
          {top > 0 && (
            <div
              className="absolute bg-black/60 pointer-events-none z-5"
              style={{
                left: `${videoLeft}px`,
                top: `${videoTop}px`,
                width: `${videoDisplayWidth}px`,
                height: `${top}px`,
              }}
            />
          )}
          
          {/* Bottom mask */}
          {top + guideHeight < videoDisplayHeight && (
            <div
              className="absolute bg-black/60 pointer-events-none z-5"
              style={{
                left: `${videoLeft}px`,
                top: `${videoTop + top + guideHeight}px`,
                width: `${videoDisplayWidth}px`,
                height: `${videoDisplayHeight - (top + guideHeight)}px`,
              }}
            />
          )}
          
          {/* Left mask */}
          {left > 0 && (
            <div
              className="absolute bg-black/60 pointer-events-none z-5"
              style={{
                left: `${videoLeft}px`,
                top: `${videoTop + top}px`,
                width: `${left}px`,
                height: `${guideHeight}px`,
              }}
            />
          )}
          
          {/* Right mask */}
          {left + guideWidth < videoDisplayWidth && (
            <div
              className="absolute bg-black/60 pointer-events-none z-5"
              style={{
                left: `${videoLeft + left + guideWidth}px`,
                top: `${videoTop + top}px`,
                width: `${videoDisplayWidth - (left + guideWidth)}px`,
                height: `${guideHeight}px`,
              }}
            />
          )}
        </>
      )}
    </>
  );
};
