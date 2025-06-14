
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
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  comments: Comment[];
  onTimeClick: (timestamp: number) => void;
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
    currentTime: props.currentTime,
    onTimeUpdate: props.onTimeUpdate,
    onDurationChange: props.onDurationChange
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
      currentTime: props.currentTime,
      videoRef: videoPlayer.videoRef?.current ? 'exists' : 'null'
    });
  }, [videoPlayer.isPlaying, videoPlayer.duration, props.currentTime]);

  return (
    <div className="flex h-screen bg-black">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player Container */}
        <div className="flex-1 relative bg-gray-900">
          <VideoPlayer {...props} />
          
          {/* Video Overlay Info */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <Badge className="bg-black/60 text-white border-gray-600">
              Fit
            </Badge>
            {props.annotations && (
              <Badge className="bg-green-600 text-white">
                Annotations On
              </Badge>
            )}
          </div>

          {/* Real-time Indicators */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="bg-black/60 text-white px-2 py-1 rounded flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs">Live</span>
            </div>
            <Badge className="bg-black/60 text-white border-gray-600">
              3 viewers
            </Badge>
          </div>
        </div>

        {/* FIXED Controls Section - ALWAYS VISIBLE with bright background */}
        <div className="bg-red-900 border-t-4 border-yellow-500 p-6 space-y-6 flex-shrink-0 min-h-[250px]">
          <div className="text-yellow-400 text-lg font-bold mb-4">🚨 CONTROLS SECTION - THIS SHOULD BE VISIBLE 🚨</div>
          
          {/* Debug Info */}
          <div className="bg-blue-900 p-4 rounded text-white">
            <div className="text-sm">Debug Info:</div>
            <div className="text-xs">isPlaying: {String(videoPlayer.isPlaying)}</div>
            <div className="text-xs">duration: {videoPlayer.duration}</div>
            <div className="text-xs">currentTime: {props.currentTime}</div>
          </div>
          
          {/* Timeline */}
          <div className="bg-green-900 p-4 rounded">
            <div className="text-white text-sm mb-2">Timeline Component:</div>
            <VideoTimeline
              currentTime={props.currentTime}
              duration={videoPlayer.duration}
              comments={props.comments}
              onTimeClick={props.onTimeClick}
              previewVideoRef={videoPlayer.previewVideoRef}
              timeFormat={videoPlayer.timeFormat}
              assetId={props.src}
            />
          </div>
          
          {/* Simple Video Controls */}
          <div className="bg-purple-900 p-4 rounded">
            <div className="text-white text-sm mb-2">Simple Video Controls:</div>
            <SimpleVideoControls
              isPlaying={videoPlayer.isPlaying}
              onTogglePlayPause={videoPlayer.togglePlayPause}
              volume={videoPlayer.volume}
              onVolumeToggle={videoPlayer.handleVolumeToggle}
              currentTime={props.currentTime}
              duration={videoPlayer.duration}
            />
          </div>
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
