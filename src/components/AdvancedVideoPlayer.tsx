
import { useState, useRef, useEffect } from "react";
import { PresenceSystem } from "./PresenceSystem";
import { MediaProcessingStatus } from "./MediaProcessingStatus";
import { VideoTimeline } from "./VideoTimeline";
import { SimpleVideoControls } from "./SimpleVideoControls";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { useVideoKeyboardShortcuts } from "@/hooks/useVideoKeyboardShortcuts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Settings, 
  Layers, 
  Activity,
  Clock,
  Zap
} from "lucide-react";
import type { Comment } from "@/pages/Index";

interface AdvancedVideoPlayerProps {
  src: string;
  comments: Comment[];
  isDrawingMode: boolean;
  onDrawingModeChange: (enabled: boolean) => void;
  annotations: boolean;
  setAnnotations: (enabled: boolean) => void;
}

export const AdvancedVideoPlayer = (props: AdvancedVideoPlayerProps) => {
  const [rightPanelTab, setRightPanelTab] = useState("presence");
  const [processingJobs] = useState([
    {
      id: '1',
      filename: 'hero_video_v2.mp4',
      type: 'video' as const,
      status: 'processing' as const,
      progress: 75,
      fileSize: 524288000,
      duration: '2:34',
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 300000)
    },
    {
      id: '2',
      filename: 'product_demo.mov',
      type: 'video' as const,
      status: 'completed' as const,
      progress: 100,
      fileSize: 157286400,
      duration: '1:45',
      thumbnailUrl: '/placeholder.svg',
      downloadUrl: '/demo-video.mp4',
      startTime: new Date(Date.now() - 600000)
    }
  ]);

  const videoPlayer = useVideoPlayer({
    src: props.src,
  });

  useVideoKeyboardShortcuts({
    videoRef: videoPlayer.videoRef,
    volume: videoPlayer.volume,
    isPlaying: videoPlayer.isPlaying,
    setVolume: (vol) => videoPlayer.handleVolumeChange([vol]),
    onZoomChange: () => {}
  });

  // Debug logging
  useEffect(() => {
    console.log('🎬 AdvancedVideoPlayer rendering with src:', props.src);
    console.log('🎯 Video player state:', {
      isPlaying: videoPlayer.isPlaying,
      duration: videoPlayer.duration,
      currentTime: videoPlayer.currentTime,
      videoLoaded: videoPlayer.videoLoaded,
      videoError: videoPlayer.videoError,
      videoRef: videoPlayer.videoRef?.current ? 'exists' : 'null'
    });
    
    if (videoPlayer.videoRef?.current) {
      const video = videoPlayer.videoRef.current;
      console.log('📺 Video element:', {
        src: video.src,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration
      });
    }
  }, [videoPlayer, props.src]);

  return (
    <div className="flex h-screen bg-black">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player Container */}
        <div className="flex-1 flex items-center justify-center bg-black relative min-h-0">
          {/* Simple video element */}
          <video
            ref={videoPlayer.videoRef}
            src={props.src}
            className="w-full h-full object-contain bg-black"
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block'
            }}
            controls={false}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            onLoadStart={() => console.log('🚀 Video load started')}
            onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
            onCanPlay={() => console.log('▶️ Video can play')}
            onError={(e) => console.error('❌ Video error:', e)}
          />
          
          {/* Hidden preview video for timeline */}
          <video
            ref={videoPlayer.previewVideoRef}
            src={props.src}
            className="hidden"
            muted
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
          />
          
          {/* Video Overlay Info */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
            <Badge className="bg-black/60 text-white border-gray-600">
              Fit
            </Badge>
            {props.annotations && (
              <Badge className="bg-green-600 text-white">
                Annotations On
              </Badge>
            )}
            {videoPlayer.videoRef?.current?.videoWidth && (
              <Badge className="bg-blue-600 text-white">
                {videoPlayer.videoRef.current.videoWidth}x{videoPlayer.videoRef.current.videoHeight}
              </Badge>
            )}
          </div>

          {/* Real-time Indicators */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <div className="bg-black/60 text-white px-2 py-1 rounded flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs">Live</span>
            </div>
            <Badge className="bg-black/60 text-white border-gray-600">
              3 viewers
            </Badge>
          </div>

          {/* Simple loading indicator - only show if video hasn't loaded */}
          {!videoPlayer.videoLoaded && !videoPlayer.videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Loading video...</p>
                <p className="text-gray-400 text-sm mt-2">Ready State: {videoPlayer.videoRef?.current?.readyState || 0}/4</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {videoPlayer.videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <div className="text-center">
                <p className="text-red-400 mb-4">Error: {videoPlayer.videoError}</p>
                <Button onClick={videoPlayer.retryVideo} className="bg-pink-600 hover:bg-pink-700">
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="bg-gray-900 border-t border-gray-700 p-4 space-y-4 flex-shrink-0">
          {/* Debug Info */}
          <div className="bg-gray-800 p-3 rounded text-white text-sm">
            <div className="grid grid-cols-4 gap-4">
              <div>Playing: {String(videoPlayer.isPlaying)}</div>
              <div>Duration: {videoPlayer.duration.toFixed(1)}s</div>
              <div>Current: {videoPlayer.currentTime.toFixed(1)}s</div>
              <div>Loaded: {String(videoPlayer.videoLoaded)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>Video Size: {videoPlayer.videoRef?.current?.videoWidth || 0}x{videoPlayer.videoRef?.current?.videoHeight || 0}</div>
              <div>Ready State: {videoPlayer.videoRef?.current?.readyState || 0}/4</div>
            </div>
          </div>
          
          {/* Timeline */}
          <VideoTimeline
            currentTime={videoPlayer.currentTime}
            duration={videoPlayer.duration}
            comments={props.comments}
            onTimeClick={videoPlayer.handleSeek}
            previewVideoRef={videoPlayer.previewVideoRef}
            timeFormat={videoPlayer.timeFormat}
            assetId={props.src}
          />
          
          {/* Simple Video Controls */}
          <SimpleVideoControls
            isPlaying={videoPlayer.isPlaying}
            onTogglePlayPause={videoPlayer.togglePlayPause}
            volume={videoPlayer.volume}
            onVolumeToggle={videoPlayer.handleVolumeToggle}
            currentTime={videoPlayer.currentTime}
            duration={videoPlayer.duration}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="presence" className="text-xs">
              <Users className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="processing" className="text-xs">
              <Zap className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Activity className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="presence" className="mt-0">
              <PresenceSystem 
                currentAssetId="current-video"
                onUserClick={(userId) => console.log('User clicked:', userId)}
              />
            </TabsContent>

            <TabsContent value="processing" className="mt-0">
              <MediaProcessingStatus 
                jobs={processingJobs}
                onRetry={(jobId) => console.log('Retry job:', jobId)}
                onPreview={(jobId) => console.log('Preview job:', jobId)}
                onDownload={(jobId) => console.log('Download job:', jobId)}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white">Recent Activity</span>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-400">
                      <div>• Alex Chen added a comment at 0:32</div>
                      <div>• Sarah Kim approved the video</div>
                      <div>• New version uploaded by Mike</div>
                      <div>• Processing completed for v2.1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Video Quality</span>
                      <Badge className="bg-gray-700 text-white">
                        {videoPlayer.quality}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Playback Speed</span>
                      <Badge className="bg-gray-700 text-white">
                        {videoPlayer.playbackSpeed}x
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Time Format</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const formats = ['timecode', 'frames', 'seconds'] as const;
                          const currentIndex = formats.indexOf(videoPlayer.timeFormat);
                          const nextFormat = formats[(currentIndex + 1) % formats.length];
                          videoPlayer.setTimeFormat(nextFormat);
                        }}
                        className="border-gray-600 text-gray-300 text-xs h-6"
                      >
                        {videoPlayer.timeFormat}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
