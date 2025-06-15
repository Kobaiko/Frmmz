import { useState, useRef, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
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
    console.log('🎬 AdvancedVideoPlayer rendering');
    console.log('🎯 Video player state:', {
      isPlaying: videoPlayer.isPlaying,
      duration: videoPlayer.duration,
      currentTime: videoPlayer.currentTime,
      videoRef: videoPlayer.videoRef?.current ? 'exists' : 'null',
      videoSrc: props.src
    });
    
    // Check if video element exists and log its properties
    if (videoPlayer.videoRef?.current) {
      const video = videoPlayer.videoRef.current;
      console.log('📺 Video element properties:', {
        src: video.src,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        clientWidth: video.clientWidth,
        clientHeight: video.clientHeight,
        offsetWidth: video.offsetWidth,
        offsetHeight: video.offsetHeight,
        style: {
          display: video.style.display,
          width: video.style.width,
          height: video.style.height,
          visibility: video.style.visibility
        }
      });
    }
  }, [videoPlayer.isPlaying, videoPlayer.duration, videoPlayer.currentTime, props.src, videoPlayer.videoRef]);

  return (
    <div className="flex h-screen bg-black">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player Container - FIXED: Simplified video display */}
        <div className="flex-1 flex items-center justify-center bg-black relative min-h-0">
          {/* Main video element with explicit dimensions and visibility */}
          <video
            ref={videoPlayer.videoRef}
            className="w-full h-full object-contain"
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              minWidth: '320px',
              minHeight: '180px',
              display: 'block',
              visibility: 'visible'
            }}
            controls={false}
            playsInline
            crossOrigin="anonymous"
            onLoadStart={() => console.log('🚀 Video load started')}
            onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
            onCanPlay={() => console.log('▶️ Video can play')}
            onLoadedData={() => console.log('📊 Video data loaded')}
            onCanPlayThrough={() => console.log('🎬 Video can play through')}
            onError={(e) => {
              console.error('❌ Video error:', e);
              const target = e.target as HTMLVideoElement;
              if (target?.error) {
                console.error('Video error details:', {
                  code: target.error.code,
                  message: target.error.message
                });
              }
            }}
          />
          
          {/* Hidden preview video for thumbnails */}
          <video
            ref={videoPlayer.previewVideoRef}
            className="hidden"
            muted
            playsInline
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
            <Badge className="bg-blue-600 text-white">
              {videoPlayer.videoRef?.current?.videoWidth}x{videoPlayer.videoRef?.current?.videoHeight}
            </Badge>
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

          {/* Loading indicator */}
          {(!videoPlayer.videoRef?.current?.videoWidth || videoPlayer.videoRef?.current?.readyState < 2) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-5">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Loading video...</p>
                <p className="text-gray-400 text-sm mt-2">Source: {props.src.split('/').pop()}</p>
                <p className="text-gray-300 text-xs mt-1">
                  Ready State: {videoPlayer.videoRef?.current?.readyState || 0}/4
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls Section - Always visible */}
        <div className="bg-gray-900 border-t border-gray-700 p-4 space-y-4 flex-shrink-0">
          {/* Debug Info */}
          <div className="bg-gray-800 p-3 rounded text-white text-sm">
            <div className="grid grid-cols-4 gap-4">
              <div>Playing: {String(videoPlayer.isPlaying)}</div>
              <div>Duration: {videoPlayer.duration.toFixed(1)}s</div>
              <div>Current: {videoPlayer.currentTime.toFixed(1)}s</div>
              <div>Ready: {videoPlayer.videoRef?.current?.readyState || 0}/4</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>Video Size: {videoPlayer.videoRef?.current?.videoWidth || 0}x{videoPlayer.videoRef?.current?.videoHeight || 0}</div>
              <div>Element Size: {videoPlayer.videoRef?.current?.clientWidth || 0}x{videoPlayer.videoRef?.current?.clientHeight || 0}</div>
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
