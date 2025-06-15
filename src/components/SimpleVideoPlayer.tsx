
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    console.log('🎬 SimpleVideoPlayer: Setting up video with src:', src);

    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      setDuration(video.duration);
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
      onLoad?.();
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play');
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
      console.log('🚀 Video load started');
      setIsLoading(true);
      setError(null);
    };

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    // Set source and load
    video.src = src;
    video.load();

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [src, onError, onLoad]);

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
    const video = videoRef.current;
    if (!video) return;

    console.log('🔄 Retrying video load...');
    setError(null);
    setIsLoading(true);
    setIsLoaded(false);
    video.load();
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
        preload="metadata"
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center max-w-md p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-white mb-2">Video Error</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <div className="flex space-x-2 justify-center">
              <Button onClick={handleRetry} className="bg-pink-600 hover:bg-pink-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button 
                onClick={() => window.open(src, '_blank')}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
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
                {videoRef.current?.videoWidth}x{videoRef.current?.videoHeight}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
