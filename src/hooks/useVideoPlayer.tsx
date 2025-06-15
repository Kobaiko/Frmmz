import { useEffect, useRef, useState, useCallback } from "react";

interface UseVideoPlayerProps {
  src: string;
}

export const useVideoPlayer = ({ src }: UseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>();

  // Core player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  // Quality and format state
  const [quality, setQuality] = useState('1080p');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['1080p']);
  const [maxQuality, setMaxQuality] = useState('1080p');
  const [timeFormat, setTimeFormat] = useState<'timecode' | 'frames' | 'seconds'>('timecode');

  // Loading and error state
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDebugInfo, setVideoDebugInfo] = useState<any>({});
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  const [useDirectPlayback, setUseDirectPlayback] = useState(false);
  
  const updateDebugInfo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const debugInfo = {
      src: video.src,
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
      ended: video.ended,
      networkState: video.networkState,
      canPlayType: {
        mp4: video.canPlayType('video/mp4'),
        webm: video.canPlayType('video/webm'),
        ogg: video.canPlayType('video/ogg')
      },
      error: video.error ? { code: video.error.code, message: video.error.message } : null,
      crossOrigin: video.crossOrigin,
      loadingAttempts
    };
    
    console.log('📊 Video Debug Info:', debugInfo);
    setVideoDebugInfo(debugInfo);
  }, [loadingAttempts]);

  useEffect(() => {
    const video = videoRef.current;
    const previewVideo = previewVideoRef.current;
    if (!video || !previewVideo || !src) return;

    setLoadingAttempts(1);

    console.log('🎬 Setting up video monitoring for:', src);
    setVideoLoaded(false);
    setVideoError(null);

    const metadataTimeout = setTimeout(() => {
      if (video.readyState < 1) { // HAVE_METADATA is 1
        console.error('⏰ Video metadata loading timeout');
        setVideoError('Video format may not be supported or loading timed out.');
      }
    }, 5000);

    const updateTime = () => {
      if (video && !video.paused) {
        setCurrentTime(video.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    
    const handleTimeUpdate = () => {
      if (!isPlaying) {
        setCurrentTime(video.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      console.log('📊 Video metadata loaded');
      clearTimeout(metadataTimeout);
      setDuration(video.duration);
      
      const videoHeight = video.videoHeight;
      let maxQual = '360p', availableQuals = ['360p'];
      if (videoHeight >= 1080) { maxQual = '1080p'; availableQuals = ['1080p', '720p', '540p', '360p']; }
      else if (videoHeight >= 720) { maxQual = '720p'; availableQuals = ['720p', '540p', '360p']; }
      else if (videoHeight >= 540) { maxQual = '540p'; availableQuals = ['540p', '360p']; }
      
      setMaxQuality(maxQual);
      setQuality(maxQual);
      setAvailableQualities(availableQuals);
      
      console.log(`📺 Video resolution: ${video.videoWidth}x${videoHeight}, Max quality: ${maxQual}`);
      updateDebugInfo();
    };

    const handleCanPlay = () => {
      console.log('▶️ Video can play');
      setVideoLoaded(true);
      setVideoError(null);
      clearTimeout(metadataTimeout);
      updateDebugInfo();
    };

    const handleError = (e: Event) => {
      console.error('❌ Video error event:', e);
      const target = e.target as HTMLVideoElement;
      let errorMsg = 'Video format not supported by browser';
      if (target?.error) {
        switch (target.error.code) {
          case 3: errorMsg = 'Video file is corrupted or in unsupported format'; break;
          case 4: errorMsg = 'Video format not supported by this browser'; break;
          default: errorMsg = `Video error: ${target.error.message || 'Unknown error'}`;
        }
      }
      setVideoError(errorMsg);
      setVideoLoaded(false);
      clearTimeout(metadataTimeout);
      updateDebugInfo();
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);

    try {
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.src = src;
      video.load();
      console.log('🔗 Main video source set and load() called');

      if (previewVideo.src !== src) {
        previewVideo.crossOrigin = 'anonymous';
        previewVideo.preload = 'metadata';
        previewVideo.src = src;
        previewVideo.muted = true;
        previewVideo.load();
        console.log('🔗 Preview video source set and load() called');
      }
    } catch (err) {
      console.error('❌ Error setting video source:', err);
      setVideoError('Failed to load video');
    }
    
    updateDebugInfo();

    return () => {
      clearTimeout(metadataTimeout);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.loop = isLooping;
  }, [isLooping]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (video && isFinite(time)) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) isPlaying ? video.pause() : video.play();
  }, [isPlaying]);

  const toggleLoop = useCallback(() => setIsLooping(prev => !prev), []);
  
  const handleSpeedChange = useCallback((speeds: number[]) => {
    const speed = speeds[0];
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, []);
  
  const handleVolumeToggle = useCallback(() => {
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
  }, [volume]);
  
  const handleVolumeChange = useCallback((newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
      videoRef.current.muted = volumeValue === 0;
    }
  }, []);
  
  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality);
  }, []);
  
  const retryVideo = useCallback(() => {
    setVideoError(null);
    setUseDirectPlayback(false);
    setLoadingAttempts(prev => prev + 1); // Increment attempts on retry
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  }, []);

  const forceDirectPlayback = useCallback(() => {
    setUseDirectPlayback(true);
    setVideoError(null);
  }, []);

  return {
    videoRef,
    previewVideoRef,
    duration,
    currentTime,
    setCurrentTime,
    isPlaying,
    volume,
    playbackSpeed,
    quality,
    availableQualities,
    maxQuality,
    isLooping,
    timeFormat,
    setTimeFormat,
    videoLoaded,
    videoError,
    videoDebugInfo,
    useDirectPlayback,
    loadingAttempts,
    togglePlayPause,
    toggleLoop,
    handleSpeedChange,
    handleVolumeToggle,
    handleVolumeChange,
    handleQualityChange,
    handleSeek,
    retryVideo,
    forceDirectPlayback
  };
};
