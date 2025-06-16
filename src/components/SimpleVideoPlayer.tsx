
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
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
  onTimeUpdate?: (currentTime: number) => void;
}

export const SimpleVideoPlayer = forwardRef<HTMLVideoElement, SimpleVideoPlayerProps>(
  ({ src, onError, onLoad, onTimeUpdate }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Forward the ref to parent component
    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !src) return;

      console.log('🎬 Setting up video with src:', src);
      
      // Reset states
      setIsLoading(true);
      setError(null);
      setIsLoaded(false);
      setIsPlaying(false);

      const handleLoadedMetadata = () => {
        console.log('✅ Video metadata loaded, duration:', video.duration);
        setDuration(video.duration);
      };

      const handleCanPlay = () => {
        console.log('✅ Video can play');
        setIsLoaded(true);
        setIsLoading(false);
        onLoad?.();
      };

      const handleTimeUpdate = () => {
        const newTime = video.currentTime;
        setCurrentTime(newTime);
        onTimeUpdate?.(newTime);
      };

      const handlePlay = () => {
        setIsPlaying(true);
      };
      
      const handlePause = () => {
        setIsPlaying(false);
      };

      const handleError = (e: Event) => {
        console.error('❌ Video error:', e, video.error);
        let errorMessage = 'Failed to load video';
        if (video.error) {
          switch (video.error.code) {
            case 1: errorMessage = 'Video loading aborted'; break;
            case 2: errorMessage = 'Network error'; break;
            case 3: errorMessage = 'Video format not supported'; break;
            case 4: errorMessage = 'Video source not found'; break;
          }
        }
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
      };

      // Add event listeners
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('error', handleError);

      // Set the source directly
      video.src = src;
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    }, [src, onError, onLoad, onTimeUpdate]);

    const togglePlayPause = () => {
      const video = videoRef.current;
      if (!video) return;

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
      video.load();
    };

    const formatTime = (seconds: number) => {
      if (!isFinite(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          controls={false}
          preload="metadata"
        />

        {/* Loading Overlay */}
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading video...</p>
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
              <p className="text-gray-400 mb-4">{error}</p>
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
                {isLoaded ? 'Ready' : 'Loading'}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SimpleVideoPlayer.displayName = "SimpleVideoPlayer";
