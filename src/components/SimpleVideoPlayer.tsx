
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Download,
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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Add cache-busting timestamp to force fresh load
    const cacheBustingSrc = `${src}?t=${Date.now()}&retry=${retryCount}`;
    console.log('🎬 SimpleVideoPlayer: Loading video with cache-busting:', cacheBustingSrc);

    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
      setDuration(video.duration);
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
      onLoad?.();
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play, readyState:', video.readyState);
      setIsLoaded(true);
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      console.log('✅ Video data loaded, readyState:', video.readyState);
      setIsLoaded(true);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      let errorMsg = 'Failed to load video';
      if (target?.error) {
        switch (target.error.code) {
          case 1: errorMsg = 'Video loading aborted'; break;
          case 2: errorMsg = 'Network error'; break;
          case 3: errorMsg = 'Video decode error'; break;
          case 4: errorMsg = 'Video format not supported'; break;
          default: errorMsg = `Video error: ${target.error.message}`;
        }
      }
      console.error('❌ Video error:', errorMsg, e);
      setError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
    };

    const handleLoadStart = () => {
      console.log('🚀 Video load started, readyState:', video.readyState);
      setIsLoading(true);
      setError(null);
    };

    const handleProgress = () => {
      console.log('📶 Video loading progress, readyState:', video.readyState);
      if (video.buffered.length > 0) {
        console.log('📊 Buffered:', video.buffered.end(0), 'of', video.duration);
      }
    };

    const handleSuspend = () => {
      console.log('⏸️ Video loading suspended, readyState:', video.readyState);
    };

    const handleStalled = () => {
      console.log('🚫 Video loading stalled, readyState:', video.readyState);
    };

    // Add all event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('suspend', handleSuspend);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    // Reset video element completely
    video.removeAttribute('src');
    video.load(); // Clear any previous state
    
    // Set new source with cache busting
    video.src = cacheBustingSrc;
    video.preload = 'auto'; // Force aggressive preloading
    video.load(); // Force load

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('suspend', handleSuspend);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [src, onError, onLoad, retryCount]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(e => {
        console.error('Play failed:', e);
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

  const handleRetry = () => {
    console.log('🔄 Retrying video load with cache bust...');
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    setIsLoaded(false);
  };

  const handleForceReload = () => {
    console.log('🔄 Force reloading page to clear all caches...');
    window.location.reload();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={false}
        style={{ backgroundColor: 'black' }}
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white mb-2">Loading video...</p>
            <p className="text-gray-400 text-sm mb-4">Attempt #{retryCount + 1}</p>
            
            {retryCount > 0 && (
              <div className="bg-gray-800 rounded p-3 text-xs text-left space-y-1">
                <p className="text-yellow-400">🔄 Retry #{retryCount}</p>
                <p className="text-blue-400">📊 Cache busting enabled</p>
                <p className="text-green-400">🚀 Aggressive preload: auto</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center max-w-md p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-white mb-2">Video Loading Failed</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            
            <div className="bg-gray-800 rounded p-3 text-xs text-left mb-4 space-y-1">
              <p className="text-red-400">❌ Error: {error}</p>
              <p className="text-gray-400">🔄 Attempts: {retryCount + 1}</p>
              <p className="text-gray-400">📁 Source: {src.split('/').pop()}</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={handleRetry} className="bg-pink-600 hover:bg-pink-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry with Cache Bust
              </Button>
              <Button onClick={handleForceReload} variant="outline" className="border-gray-600 text-gray-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Page Reload
              </Button>
              <Button 
                onClick={() => window.open(src, '_blank')}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Original
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {isLoaded && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                onClick={togglePlayPause}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                onClick={toggleMute}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-black/50 text-white">
                Ready State: {videoRef.current?.readyState || 0}/4
              </Badge>
              {videoRef.current?.videoWidth && (
                <Badge className="bg-black/50 text-white">
                  {videoRef.current.videoWidth}x{videoRef.current.videoHeight}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
