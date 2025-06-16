
import { useEffect } from "react";

interface UseVideoKeyboardShortcutsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  volume: number;
  isPlaying: boolean;
  setVolume: (volume: number) => void;
  onZoomChange: (zoom: string) => void;
  onPlaybackSpeedChange: (speed: number) => void;
}

export const useVideoKeyboardShortcuts = ({
  videoRef,
  volume,
  isPlaying,
  setVolume,
  onZoomChange,
  onPlaybackSpeedChange
}: UseVideoKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      // Handle Cmd/Ctrl + 0 for 100% zoom first (needs to prevent default)
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        onZoomChange('100%');
        return;
      }

      // Only prevent default for our specific shortcuts
      const shortcutKeys = ['k', ' ', 'm', 't', 'y', '+', '=', '-'];
      if (!shortcutKeys.includes(e.key.toLowerCase())) {
        return;
      }

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
            // Unmute
            video.muted = false;
            const newVolume = volume === 0 ? 0.5 : volume;
            video.volume = newVolume;
            setVolume(newVolume);
          } else {
            // Mute
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
    };

    // Add event listener to the window to capture all keydown events
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, isPlaying, videoRef, setVolume, onZoomChange, onPlaybackSpeedChange]);
};
