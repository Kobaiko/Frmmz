import { useState, useEffect, useRef } from "react"; // Added useRef
import { Badge } from "@/components/ui/badge";
import { Users, Settings, Activity, Clock, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PresenceSystem } from "./PresenceSystem";
import { MediaProcessingStatus } from "./MediaProcessingStatus";
import { Card, CardContent } from "@/components/ui/card";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { VideoTimeline } from "./VideoTimeline";
import { DrawingCanvas } from "./DrawingCanvas";

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor?: string;
  createdAt: Date;
  resolved?: boolean;
  replies?: VideoComment[];
}

interface AdvancedVideoPlayerProps {
  src: string;
  comments: VideoComment[];
  isDrawingMode: boolean;
  onDrawingModeChange: (enabled: boolean) => void;
  annotations: boolean;
  setAnnotations: (enabled: boolean) => void;
  assetId: string;
  onReady?: (controls: {
    seek: (time: number) => void;
    togglePlayPause: () => void;
  }) => void;
  onTimeUpdate?: (time: number) => void;
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

  const {
    videoRef,
    previewVideoRef,
    duration,
    currentTime,
    togglePlayPause,
    handleSeek,
  } = useVideoPlayer({ src: props.src });

  useEffect(() => {
    if (props.onReady) {
      props.onReady({ seek: handleSeek, togglePlayPause });
    }
  }, [props.onReady, handleSeek, togglePlayPause]);

  useEffect(() => {
    if (props.onTimeUpdate) {
      props.onTimeUpdate(currentTime);
    }
  }, [currentTime, props.onTimeUpdate]);

  const mappedCommentsForTimeline = props.comments.map(comment => ({
    id: comment.id,
    text: comment.content,
    author: comment.author,
    timestamp: comment.timestamp,
    createdAt: comment.createdAt,
    isInternal: false, // Assuming default, adjust if actual data is available
    hasDrawing: false, // Assuming default, adjust if actual data is available
    // parentId and attachments are not in VideoComment, handle if needed
  }));

  return (
    <div className="flex h-screen bg-black">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-black relative min-h-0">
          <video ref={videoRef} className="w-full h-full object-contain" onClick={togglePlayPause} />
          <DrawingCanvas
            videoRef={videoRef}
            isDrawingMode={props.isDrawingMode}
            annotations={props.annotations}
            currentTime={currentTime}
          />
          <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
            <Badge className="bg-black/60 text-white border-gray-600">Fit</Badge>
            {props.annotations && (
              <Badge className="bg-green-600 text-white">Annotations On</Badge>
            )}
          </div>
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <div className="bg-black/60 text-white px-2 py-1 rounded flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs">Live</span>
            </div>
            <Badge className="bg-black/60 text-white border-gray-600">3 viewers</Badge>
          </div>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-sm p-3 border-t border-gray-700/50">
          <VideoTimeline
            currentTime={currentTime}
            duration={duration}
            comments={mappedCommentsForTimeline}
            onTimeClick={handleSeek}
            previewVideoRef={previewVideoRef}
            timeFormat={'timecode'} // Or make this a prop if needed
            assetId={props.assetId}
          />
        </div>
      </div>
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="presence"><Users className="h-3 w-3" /></TabsTrigger>
            <TabsTrigger value="processing"><Zap className="h-3 w-3" /></TabsTrigger>
            <TabsTrigger value="activity"><Activity className="h-3 w-3" /></TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-3 w-3" /></TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="presence" className="mt-0">
              <PresenceSystem
                currentAssetId={props.assetId}
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
                    <div
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-700 p-2 rounded-md"
                      onClick={() => props.setAnnotations(!props.annotations)} // Toggle annotations
                    >
                      <span className="text-sm text-white">Annotations</span>
                      <Badge className={`${props.annotations ? "bg-green-600" : "bg-gray-600"} transition-colors`}>
                        {props.annotations ? "On" : "Off"}
                      </Badge>
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
