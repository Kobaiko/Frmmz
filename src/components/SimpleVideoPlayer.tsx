
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface SimpleVideoPlayerProps {
  src: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

export const SimpleVideoPlayer = ({ src, onError, onLoad }: SimpleVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readyState, setReadyState] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      console.log('❌ No video element or src provided');
      return;
    }

    console.log('🎬 Setting up video:', src);
    console.log('🔍 Video element:', video);
    console.log('🌐 Current origin:', window.location.origin);
    console.log('📍 Current URL:', window.location.href);
    
    // Reset states
    setIsLoading(true);
    setError(null);
    setIsLoaded(false);
    setIsPlaying(false);
    setReadyState(0);

    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded, duration:', video.duration);
      setDuration(video.duration);
      setReadyState(video.readyState);
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play, ready state:', video.readyState);
      setIsLoaded(true);
      setIsLoading(false);
      setReadyState(video.readyState);
      onLoad?.();
    };

    const handleCanPlayThrough = () => {
      console.log('✅ Video can play through, ready state:', video.readyState);
      setIsLoaded(true);
      setIsLoading(false);
      setReadyState(video.readyState);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setReadyState(video.readyState);
    };

    const handlePlay = () => {
      console.log('▶️ Video playing');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('⏸️ Video paused');
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error('❌ Video error event:', e);
      console.error('❌ Video error details:', video.error);
      console.error('❌ Network state:', video.networkState);
      console.error('❌ Ready state:', video.readyState);
      
      let errorMessage = 'Failed to load video';
      if (video.error) {
        switch (video.error.code) {
          case 1:
            errorMessage = 'Video loading aborted';
            break;
          case 2:
            errorMessage = 'Network error loading video';
            break;
          case 3:
            errorMessage = 'Video format not supported';
            break;
          case 4:
            errorMessage = 'Video source not found';
            break;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setReadyState(video.readyState);
      onError?.(errorMessage);
    };

    const handleLoadStart = () => {
      console.log('🔄 Video load start');
      setIsLoading(true);
      setReadyState(video.readyState);
    };

    const handleProgress = () => {
      console.log('📊 Video loading progress, ready state:', video.readyState);
      setReadyState(video.readyState);
    };

    const handleSuspend = () => {
      console.log('⏳ Video loading suspended');
      setReadyState(video.readyState);
    };

    const handleStalled = () => {
      console.log('🚫 Video loading stalled');
      setReadyState(video.readyState);
    };

    const handleWaiting = () => {
      console.log('⌛ Video waiting for data');
      setReadyState(video.readyState);
    };

    // Add all event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('suspend', handleSuspend);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);

    // Set video properties
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    
    // Set source and load
    console.log('🔗 Setting video src to:', src);
    video.src = src;
    video.load();

    // Log initial state
    setTimeout(() => {
      console.log('📊 Initial video state after 100ms:');
      console.log('  - Ready state:', video.readyState);
      console.log('  - Network state:', video.networkState);
      console.log('  - Duration:', video.duration);
      console.log('  - Current src:', video.currentSrc);
    }, 100);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('suspend', handleSuspend);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
    };
  }, [src, onError, onLoad]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    console.log('🎮 Toggle play/pause, current state:', isPlaying, 'ready state:', video.readyState);

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(e => {
        console.error('❌ Play failed:', e);
        setError('Failed to play video');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    video.currentTime = newTime;
  };

  const handleRetry = () => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log('🔄 Retrying video load');
    setError(null);
    setIsLoading(true);
    setReadyState(0);
    video.load();
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getReadyStateText = (state: number) => {
    switch (state) {
      case 0: return 'No data';
      case 1: return 'Metadata';
      case 2: return 'Current data';
      case 3: return 'Future data';
      case 4: return 'Enough data';
      default: return 'Unknown';
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        controls={false}
      />

      {/* Debug Info Overlay */}
      <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded font-mono">
        <div>Ready: {readyState}/4 ({getReadyStateText(readyState)})</div>
        <div>Loaded: {isLoaded ? 'Yes' : 'No'}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
      </div>

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading video...</p>
            <p className="text-gray-400 text-sm mt-2">Ready State: {readyState}/4</p>
            <p className="text-gray-400 text-xs mt-1">{src.split('/').pop()}</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center max-w-md p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">Video Loading Failed</h3>
            <p className="text-gray-400 mb-2">{error}</p>
            <p className="text-gray-500 text-sm mb-4">Ready State: {readyState}/4</p>
            <Button 
              onClick={handleRetry}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {isLoaded && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-gray-600 rounded-full mb-3 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-pink-600 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                onClick={togglePlayPause}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                onClick={toggleMute}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <Badge className="bg-green-600/80 text-white border-0">
              Ready {readyState}/4
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};
