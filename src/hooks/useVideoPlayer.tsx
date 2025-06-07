import { useEffect, useRef, useState } from "react";

interface UseVideoPlayerProps {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

export const useVideoPlayer = ({ 
  src, 
  currentTime, 
  onTimeUpdate, 
  onDurationChange 
}: UseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>();
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['1080p', '720p', '540p', '360p']);
  const [maxQuality, setMaxQuality] = useState('1080p');
  const [isLooping, setIsLooping] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'timecode' | 'frames' | 'standard'>('timecode');

  // High-frequency time update for frame-accurate display
  const updateTime = () => {
    const video = videoRef.current;
    if (video && !video.paused) {
      onTimeUpdate(video.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const previewVideo = previewVideoRef.current;
    if (!video) return;

    console.log('🎬 Loading video source:', src);

    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded successfully');
      const videoDuration = video.duration;
      setDuration(videoDuration);
      
      // Set up preview video
      if (previewVideo) {
        previewVideo.src = src;
        previewVideo.muted = true;
        console.log('🔗 Preview video source set');
      }
      
      // Determine max quality based on video resolution
      const videoHeight = video.videoHeight;
      let maxQual = '360p';
      let availableQuals = ['360p'];
      
      if (videoHeight >= 2160) {
        maxQual = '2160p';
        availableQuals = ['2160p', '1080p', '720p', '540p', '360p'];
      } else if (videoHeight >= 1080) {
        maxQual = '1080p';
        availableQuals = ['1080p', '720p', '540p', '360p'];
      } else if (videoHeight >= 720) {
        maxQual = '720p';
        availableQuals = ['720p', '540p', '360p'];
      } else if (videoHeight >= 540) {
        maxQual = '540p';
        availableQuals = ['540p', '360p'];
      }
      
      setMaxQuality(maxQual);
      setQuality(maxQual);
      setAvailableQualities(availableQuals);
      
      console.log(`📺 Video resolution: ${video.videoWidth}x${videoHeight}, Max quality: ${maxQual}`);
      
      if (onDurationChange) {
        onDurationChange(videoDuration);
      }
    };

    const handleLoadStart = () => {
      console.log('🚀 Video load started');
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play');
    };

    const handleError = (e: Event) => {
      console.error('❌ Video loading error:', e);
      const target = e.target as HTMLVideoElement;
      if (target && target.error) {
        console.error('Video error details:', {
          code: target.error.code,
          message: target.error.message,
          networkState: target.networkState,
          readyState: target.readyState
        });
      }
    };

    const handleTimeUpdate = () => {
      // Only use this for fallback when not using high-frequency updates
      if (!isPlaying) {
        onTimeUpdate(video.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      // Start high-frequency time updates for frame-accurate display
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      // Stop high-frequency updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Set video source with CORS attributes for external URLs
    video.crossOrigin = 'anonymous';
    video.src = src;
    console.log('🔗 Video source set with CORS anonymous');

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      
      // Clean up animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [src, onTimeUpdate, onDurationChange]);

  // Simple loop effect - just set the loop attribute
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.loop = isLooping;
      console.log(`Loop ${isLooping ? 'enabled' : 'disabled'}`);
    }
  }, [isLooping]);

  // 🔥 FIXED: Frame-accurate seeking for drawings! Changed threshold from 0.5 to 0.016 (1 frame at 60fps)
  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - currentTime) > 0.016) {
      console.log(`🎯 FRAME-ACCURATE SEEK: ${video.currentTime.toFixed(3)}s → ${currentTime.toFixed(3)}s (diff: ${Math.abs(video.currentTime - currentTime).toFixed(3)}s)`);
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleLoop = () => {
    setIsLooping(prev => !prev);
  };

  const handleSpeedChange = (speeds: number[]) => {
    const speed = speeds[0];
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.muted || volume === 0) {
      video.muted = false;
      const newVolume = volume === 0 ? 0.5 : volume;
      video.volume = newVolume;
      setVolume(newVolume);
    } else {
      video.muted = true;
      setVolume(0);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
      videoRef.current.muted = volumeValue === 0;
    }
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      console.log(`Quality changed to: ${newQuality}`);
      videoRef.current.currentTime = currentTime;
    }
  };

  return {
    videoRef,
    previewVideoRef,
    duration,
    isPlaying,
    volume,
    playbackSpeed,
    quality,
    availableQualities,
    maxQuality,
    isLooping,
    timeFormat,
    setTimeFormat,
    togglePlayPause,
    toggleLoop,
    handleSpeedChange,
    handleVolumeToggle,
    handleVolumeChange,
    handleQualityChange
  };
};
