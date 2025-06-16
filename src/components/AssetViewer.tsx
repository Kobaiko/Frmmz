import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Share2,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MessageSquare, // For timeline comments toggle
  Edit3 // For annotations toggle
} from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { CommentPanel } from "./CommentPanel";
import { DrawingCanvas } from "./DrawingCanvas";
import { VideoTimeline } from "./VideoTimeline"; // Added for timeline features
import { Badge } from "@/components/ui/badge"; // Added for annotation status

interface AssetViewerProps {
  assetId: string;
  onBack: () => void;
}

interface VideoComment {
  id: string;
  timestamp: number;
  content: string; // Used for 'text' in mapped comments
  author: string;
  authorColor?: string; // Optional, as VideoTimeline's Comment type might not use it
  createdAt: Date;
  resolved?: boolean;
  replies?: VideoComment[];
  // For VideoTimeline's Comment type (ensure compatibility)
  text?: string;
  isInternal?: boolean;
  hasDrawing?: boolean;
  parentId?: string;
  commentNumber?: number; // Added, as VideoTimeline uses it
}

export const AssetViewer = ({ assetId, onBack }: AssetViewerProps) => {
  const { assets, loading } = useAssets();
  const [asset, setAsset] = useState<any>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);

  // State from 'main' branch's AssetViewer
  const videoRef = useRef<HTMLVideoElement>(null); // Kept from main
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // State for drawing and annotations (my features)
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [annotations, setAnnotations] = useState(true);
  const [showTimelineComments, setShowTimelineComments] = useState(true);


  // Mock comments (kept from main, ensure structure is compatible with VideoTimeline)
  useEffect(() => {
    const mockComments: VideoComment[] = [
      {
        id: "1",
        timestamp: 15.5,
        content: "Great opening shot! The lighting is perfect here.",
        author: "Sarah Chen",
        authorColor: "#FF6B6B",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: "2",
        timestamp: 32.2,
        content: "Can we adjust the audio levels here? The background music is a bit too loud.",
        author: "Mike Johnson",
        authorColor: "#4ECDC4",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: "3",
        timestamp: 45.8,
        content: "This transition looks smooth. Approved!",
        author: "Emma Wilson",
        authorColor: "#45B7D1",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        resolved: true
      }
    ];
    setComments(mockComments);
  }, []);

  useEffect(() => {
    if (assets && assets.length > 0) {
      const foundAsset = assets.find(a => a.id === assetId);
      setAsset(foundAsset);
    }
  }, [assets, assetId]);

  // Video event listeners (from main branch)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      if (video) { // Add null check for video
        setVolume(video.volume);
        setIsMuted(video.muted);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    // Set initial duration if video metadata is already loaded
    if (video.readyState >= 1) { // HAVE_METADATA
        handleDurationChange();
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [asset]); // Depends on asset loading, which loads the video src

  const handleAddComment = (timestamp: number, content: string) => {
    const newComment: VideoComment = {
      id: Date.now().toString(),
      timestamp,
      content,
      author: "Current User",
      authorColor: "#8B5CF6",
      createdAt: new Date(),
      resolved: false
    };
    setComments(prev => [...prev, newComment]);
  };

  // Modified to use videoRef directly
  const handleCommentClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      // If video is paused, play it to show the frame, then pause? Or just seek.
      // For now, just seek. User can play if they want.
    }
  };

  // Video control functions (from main branch)
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause();
    else video.play();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  // Seek from main timeline progress bar
  const handleMainTimelineSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  // Seek from VideoTimeline component
  const handleVideoTimelineSeek = (time: number) => {
    if (videoRef.current && isFinite(time)) {
        videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return '0:00'; // Added seconds < 0 check
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        {/* ... loading spinner ... */}
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        {/* ... asset not found ... */}
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Map comments for VideoTimeline (ensure compatibility)
  const mappedTimelineComments: VideoComment[] = comments.map((comment, index) => ({
    ...comment,
    text: comment.content, // Assuming content is the main text
    commentNumber: index + 1, // VideoTimeline uses commentNumber
    // Ensure other fields like isInternal, hasDrawing are defaulted if not present
    isInternal: comment.isInternal ?? false,
    hasDrawing: comment.hasDrawing ?? false,
  }));

  return (
    <div className="h-screen bg-black flex text-white"> {/* Added text-white here */}
      <div className="flex-1 flex flex-col">
        {/* Header (from main) */}
        <div className="h-14 bg-black/95 border-b border-gray-800 flex items-center justify-between px-6">
          {/* ... header content ... */}
           <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-400 hover:text-white h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-white font-medium">{asset.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 px-2 text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 px-2 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>

        <div className="flex-1 relative bg-black">
          {asset.file_type === 'video' ? (
            <>
              <video
                ref={videoRef}
                src={asset.file_url}
                className="w-full h-full object-contain"
                playsInline
                controls={false} // We use custom controls
                onClick={togglePlayPause} // Added onClick to video for play/pause
              />
              <DrawingCanvas
                currentTime={currentTime} // Pass currentTime
                videoRef={videoRef}
                isDrawingMode={isDrawingMode}
                annotations={annotations} // Use toggleable annotations state
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 md:p-6"> {/* Responsive padding */}
                {/* Integrated VideoTimeline */}
                <div className="mb-3"> {/* Margin for spacing */}
                  <VideoTimeline
                    currentTime={currentTime}
                    duration={duration}
                    comments={showTimelineComments ? mappedTimelineComments : []}
                    onTimeClick={handleVideoTimelineSeek}
                    previewVideoRef={videoRef} // Use main videoRef for previews
                    timeFormat={'timecode'}
                    assetId={asset.id}
                  />
                </div>

                {/* Main Progress Bar (from main) */}
                <div
                  className="w-full h-2 bg-gray-600 rounded-full cursor-pointer group mb-3" // Added group and mb
                  onClick={handleMainTimelineSeek}
                >
                  <div
                    className="h-full bg-pink-500 rounded-full transition-all duration-100 group-hover:bg-pink-400" // Added hover effect
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control Buttons (from main, with additions) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Button variant="ghost" size="lg" onClick={togglePlayPause} className="text-white hover:bg-white/20 w-10 h-10 md:w-12 md:h-12">
                      {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6" /> : <Play className="h-5 w-5 md:h-6 md:w-6" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20 p-2">
                      {isMuted ? <VolumeX className="h-4 w-4 md:h-5 md:w-5" /> : <Volume2 className="h-4 w-4 md:h-5 md:w-5" />}
                    </Button>
                    <span className="text-white text-xs md:text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAnnotations(!annotations)}
                        className={`text-white hover:bg-white/20 p-2 ${annotations ? 'text-pink-500' : ''}`}
                        title={annotations ? "Hide Annotations" : "Show Annotations"}
                    >
                        <Edit3 className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTimelineComments(!showTimelineComments)}
                        className={`text-white hover:bg-white/20 p-2 ${showTimelineComments ? 'text-pink-500' : ''}`}
                        title={showTimelineComments ? "Hide Timeline Comments" : "Show Timeline Comments"}
                    >
                        <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    {/* Settings button can be for other things like playback speed, quality */}
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                         <Settings className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Fallback for non-video files (from main)
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Preview not available for {asset.file_type} files</p>
                <Button 
                  onClick={() => window.open(asset.file_url, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Open File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Sidebar (from main) */}
      {asset.file_type === 'video' && (
        <div className="w-80 bg-gray-900 border-l border-gray-800">
          <CommentPanel
            comments={mappedTimelineComments} // Use mapped comments for consistency if needed
            currentTime={currentTime}
            onCommentClick={handleCommentClick}
            onDeleteComment={(commentId) => {
              setComments(prev => prev.filter(comment => comment.id !== commentId));
            }}
            onReplyComment={(parentId, text) => {
              console.log('Reply to:', parentId, text);
            }}
            onAddComment={(text) => handleAddComment(currentTime, text)}
            onStartDrawing={() => setIsDrawingMode(!isDrawingMode)}
            isDrawingMode={isDrawingMode}
          />
        </div>
      )}
    </div>
  );
};
