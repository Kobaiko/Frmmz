
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
  AlertCircle,
  ExternalLink
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
  const [loadingStrategy, setLoadingStrategy] = useState<'default' | 'no-cors' | 'blob' | 'direct'>('default');
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    console.log(`🎬 Trying loading strategy: ${loadingStrategy}`);
    
    // Reset states
    setIsLoading(true);
    setError(null);
    setIsLoaded(false);
    setIsPlaying(false);

    const updateDebugInfo = () => {
      const info = {
        src: video.src,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error ? {
          code: video.error.code,
          message: video.error.message
        } : null,
        strategy: loadingStrategy,
        currentSrc: video.currentSrc,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      };
      setDebugInfo(info);
    };

    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded');
      setDuration(video.duration);
      setIsLoaded(true);
      setIsLoading(false);
      updateDebugInfo();
      onLoad?.();
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play');
      setIsLoaded(true);
      setIsLoading(false);
      updateDebugInfo();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleError = () => {
      console.error('❌ Video error with strategy:', loadingStrategy);
      
      // Try next strategy
      if (loadingStrategy === 'default') {
        setLoadingStrategy('no-cors');
        return;
      } else if (loadingStrategy === 'no-cors') {
        setLoadingStrategy('blob');
        return;
      } else if (loadingStrategy === 'blob') {
        setLoadingStrategy('direct');
        return;
      }
      
      // All strategies failed
      setError('Video could not be loaded with any method');
      setIsLoading(false);
      updateDebugInfo();
      onError?.('All loading strategies failed');
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    // Try different loading strategies
    const loadVideo = async () => {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();

        switch (loadingStrategy) {
          case 'default':
            video.crossOrigin = 'anonymous';
            video.src = src;
            break;
            
          case 'no-cors':
            video.removeAttribute('crossOrigin');
            video.src = src;
            break;
            
          case 'blob':
            try {
              const response = await fetch(src, { mode: 'no-cors' });
              const blob = await response.blob();
              video.src = URL.createObjectURL(blob);
            } catch {
              video.src = src;
            }
            break;
            
          case 'direct':
            // Remove all CORS restrictions and use direct URL
            video.removeAttribute('crossOrigin');
            video.src = src;
            video.controls = true; // Fallback to native controls
            break;
        }

        video.preload = 'metadata';
        video.load();
        updateDebugInfo();
        
        // Timeout check
        setTimeout(() => {
          if (video.readyState === 0) {
            handleError();
          }
        }, 5000);
        
      } catch (err) {
        console.error('Load strategy failed:', err);
        handleError();
      }
    };

    loadVideo();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [src, loadingStrategy, onError, onLoad]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

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
    setLoadingStrategy('default');
  };

  const handleUseNativeFallback = () => {
    setLoadingStrategy('direct');
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
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
        style={{ 
          backgroundColor: 'black',
          display: loadingStrategy === 'direct' ? 'block' : (isLoaded ? 'block' : 'none')
        }}
      />

      {/* Loading Overlay */}
      {isLoading && !error && loadingStrategy !== 'direct' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95">
          <div className="text-center max-w-lg p-6">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-white text-lg mb-3">Loading Video...</h3>
            <p className="text-gray-400 mb-4">Strategy: {loadingStrategy}</p>
            
            <div className="bg-gray-800 rounded-lg p-4 text-left space-y-2 text-sm">
              <div className="text-blue-400">🔗 File: {src.split('/').pop()}</div>
              <div className="text-yellow-400">🔄 Method: {loadingStrategy}</div>
              <div className="text-green-400">📱 Ready: {debugInfo.readyState || 0}/4</div>
              <div className="text-purple-400">🌐 Network: {debugInfo.networkState || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95">
          <div className="text-center max-w-lg p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">Video Loading Failed</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            
            <div className="bg-gray-800 rounded-lg p-4 text-left mb-6 space-y-2 text-sm">
              <div className="text-red-400">❌ All strategies failed</div>
              <div className="text-gray-400">📁 File: {src.split('/').pop()}</div>
              <div className="text-gray-400">🔄 Last strategy: {loadingStrategy}</div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleUseNativeFallback}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Use Native Player
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                
                <Button 
                  onClick={() => window.open(src, '_blank')}
                  variant="outline"
                  className="border-blue-600 text-blue-400"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Direct
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay - only show if not using direct/native controls */}
      {isLoaded && !error && loadingStrategy !== 'direct' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
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
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-600/80 text-white border-0">
                {loadingStrategy}
              </Badge>
              {debugInfo.videoWidth && (
                <Badge className="bg-blue-600/80 text-white border-0">
                  {debugInfo.videoWidth}×{debugInfo.videoHeight}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
