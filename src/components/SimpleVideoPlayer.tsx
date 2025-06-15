
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
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    console.log('🎬 SimpleVideoPlayer: Starting fresh load attempt', retryCount + 1);
    
    // Reset all states
    setIsLoading(true);
    setError(null);
    setIsLoaded(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const updateDebugInfo = () => {
      const info = {
        src: video.src,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error ? {
          code: video.error.code,
          message: video.error.message
        } : null,
        canPlayType: {
          mp4: video.canPlayType('video/mp4'),
          mp4Codecs: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
        },
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration,
        buffered: video.buffered.length > 0 ? `${video.buffered.end(0)}/${video.duration}` : '0/0',
        currentSrc: video.currentSrc,
        retryCount
      };
      console.log('📊 Video Debug Info:', info);
      setDebugInfo(info);
    };

    const handleLoadStart = () => {
      console.log('🚀 Video load started');
      updateDebugInfo();
    };

    const handleLoadedMetadata = () => {
      console.log('✅ Video metadata loaded successfully');
      setDuration(video.duration);
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
      updateDebugInfo();
      onLoad?.();
    };

    const handleCanPlay = () => {
      console.log('✅ Video can play');
      setIsLoaded(true);
      setIsLoading(false);
      updateDebugInfo();
    };

    const handleCanPlayThrough = () => {
      console.log('✅ Video can play through');
      setIsLoaded(true);
      setIsLoading(false);
      updateDebugInfo();
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
      console.error('❌ Video error event:', e);
      const target = e.target as HTMLVideoElement;
      let errorMsg = 'Video failed to load';
      
      if (target?.error) {
        switch (target.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMsg = 'Video loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMsg = 'Network error while loading video';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMsg = 'Video decode error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = 'Video format not supported';
            break;
          default:
            errorMsg = `Video error: ${target.error.message || 'Unknown error'}`;
        }
      }
      
      console.error('❌ Video error details:', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      setIsLoaded(false);
      updateDebugInfo();
      onError?.(errorMsg);
    };

    const handleProgress = () => {
      console.log('📶 Video loading progress');
      updateDebugInfo();
    };

    const handleSuspend = () => {
      console.log('⏸️ Video loading suspended');
      updateDebugInfo();
    };

    const handleStalled = () => {
      console.log('🚫 Video loading stalled');
      updateDebugInfo();
    };

    const handleEmptied = () => {
      console.log('🗑️ Video emptied');
      updateDebugInfo();
    };

    const handleWaiting = () => {
      console.log('⏳ Video waiting for data');
      updateDebugInfo();
    };

    // Add comprehensive event listeners
    const events = [
      ['loadstart', handleLoadStart],
      ['progress', handleProgress],
      ['suspend', handleSuspend],
      ['stalled', handleStalled],
      ['emptied', handleEmptied],
      ['waiting', handleWaiting],
      ['loadedmetadata', handleLoadedMetadata],
      ['canplay', handleCanPlay],
      ['canplaythrough', handleCanPlayThrough],
      ['timeupdate', handleTimeUpdate],
      ['play', handlePlay],
      ['pause', handlePause],
      ['error', handleError]
    ] as const;

    events.forEach(([event, handler]) => {
      video.addEventListener(event, handler as EventListener);
    });

    // Completely reset video element
    video.pause();
    video.removeAttribute('src');
    video.load();

    // Create cache-busting URL with multiple parameters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const cacheBustingUrl = `${src}?v=${timestamp}&r=${random}&retry=${retryCount}&t=${encodeURIComponent(new Date().toISOString())}`;
    
    console.log('🔗 Setting video source with aggressive cache busting:', cacheBustingUrl);

    // Set video properties for maximum compatibility
    video.preload = 'auto';
    video.muted = false; // Start unmuted
    video.playsInline = true;
    video.controls = false;
    
    // Set source and force load
    video.src = cacheBustingUrl;
    video.load();

    // Initial debug info
    setTimeout(updateDebugInfo, 100);

    // Timeout fallback - if nothing happens in 10 seconds, show error
    const timeoutId = setTimeout(() => {
      if (video.readyState === 0) {
        console.error('⏰ Video loading timeout - ReadyState still 0 after 10 seconds');
        setError('Video loading timeout - network or format issue');
        setIsLoading(false);
        updateDebugInfo();
      }
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      events.forEach(([event, handler]) => {
        video.removeEventListener(event, handler as EventListener);
      });
    };
  }, [src, onError, onLoad, retryCount]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

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

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered');
    setRetryCount(prev => prev + 1);
  };

  const handleDirectOpen = () => {
    console.log('🔗 Opening video directly in new tab');
    window.open(src, '_blank');
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
        style={{ backgroundColor: 'black' }}
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95">
          <div className="text-center max-w-lg p-6">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-white text-lg mb-3">Loading Video...</h3>
            <p className="text-gray-400 mb-4">Attempt #{retryCount + 1}</p>
            
            <div className="bg-gray-800 rounded-lg p-4 text-left space-y-2 text-sm">
              <div className="text-blue-400">🔗 Source: {src.split('/').pop()}</div>
              <div className="text-yellow-400">🔄 Cache Busting: Active</div>
              <div className="text-green-400">📱 Ready State: {debugInfo.readyState || 0}/4</div>
              <div className="text-purple-400">🌐 Network State: {debugInfo.networkState || 0}</div>
              {debugInfo.canPlayType && (
                <div className="text-cyan-400">🎥 MP4 Support: {debugInfo.canPlayType.mp4 || 'unknown'}</div>
              )}
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
              <div className="text-red-400">❌ Error: {error}</div>
              <div className="text-gray-400">🔄 Attempts: {retryCount + 1}</div>
              <div className="text-gray-400">📱 Ready State: {debugInfo.readyState || 0}/4</div>
              <div className="text-gray-400">🌐 Network State: {debugInfo.networkState || 0}</div>
              <div className="text-gray-400">📁 File: {src.split('/').pop()}</div>
              {debugInfo.canPlayType && (
                <div className="text-gray-400">🎥 MP4 Support: {debugInfo.canPlayType.mp4 || 'none'}</div>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRetry} 
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading (#{retryCount + 2})
              </Button>
              
              <Button 
                onClick={handleDirectOpen}
                variant="outline"
                className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Video Directly
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full border-gray-600 text-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {isLoaded && !error && (
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
                Ready: {debugInfo.readyState || 0}/4
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
