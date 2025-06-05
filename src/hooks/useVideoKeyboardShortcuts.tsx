
import { useEffect } from "react";

interface UseVideoKeyboardShortcutsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  volume: number;
  isPlaying: boolean;
  setVolume: (volume: number) => void;
  onZoomChange: (zoom: string) => void;
}

export const useVideoKeyboardShortcuts = ({
  videoRef,
  volume,
  isPlaying,
  setVolume,
  onZoomChange
}: UseVideoKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      e.preventDefault();

      switch (e.key.toLowerCase()) {
        case 'k':
        case ' ':
          if (isPlaying) {
            video.pause();
          } else {
            video.play();
          }
          break;
        case 'm':
          if (video.muted || volume === 0) {
            video.muted = false;
            const newVolume = volume === 0 ? 0.5 : volume;
            video.volume = newVolume;
            setVolume(newVolume);
          } else {
            video.muted = true;
            setVolume(0);
          }
          break;
        case 't':
          onZoomChange('Fit');
          break;
        case 'y':
          onZoomChange('Fill');
          break;
        case '+':
        case '=':
          onZoomChange('Zoom In');
          break;
        case '-':
          onZoomChange('Zoom Out');
          break;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        onZoomChange('100%');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying, videoRef, setVolume, onZoomChange]);
};
