import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { VideoSettingsMenu } from "./VideoSettingsMenu";
import { VideoGuides } from "./VideoGuides";
import { CommentInput } from "./CommentInput";
import { DrawingCanvas } from "./DrawingCanvas";
import { VideoTimeline } from "./VideoTimeline";
import { useVideoKeyboardShortcuts } from "@/hooks/useVideoKeyboardShortcuts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  MessageCircle, 
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Send,
  ArrowLeft,
  Download,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  ChevronDown,
  PenTool,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Eye,
  Trash2,
  Reply,
  Smile
} from "lucide-react";

interface VideoComment {
  id: string;
  timestamp: number;
  content: string;
  author: string;
  authorColor: string;
  createdAt: Date;
  resolved?: boolean;
  attachments?: any[];
  hasDrawing?: boolean;
  hasTimestamp?: boolean;
  parentId?: string; // For replies
}

interface VideoReviewInterfaceProps {
  asset: any;
  comments: VideoComment[];
  onAddComment: (timestamp: number, content: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentTime: number;
  onCommentClick: (timestamp: number) => void;
  onBack: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isMuted: boolean;
  showControls: boolean;
  onMouseMove: () => void;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

type TimestampFormat = 'seconds' | 'timecode' | 'frames';

// Simple Reply Input Component
const SimpleReplyInput = ({ 
  onSubmit, 
  onCancel, 
  replyingTo 
}: { 
  onSubmit: (text: string, attachments?: File[]) => void;
  onCancel: () => void;
  replyingTo: string;
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😀', '😂', '😍', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏'];

  const handleSubmit = () => {
    if (text.trim() || attachments.length > 0) {
      onSubmit(text.trim(), attachments);
      setText("");
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-3 space-y-3 mt-3">
      <div className="text-sm text-gray-400">
        Replying to <span className="text-white font-medium">{replyingTo}</span>
      </div>
      
      {/* Attachments Display */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-600 rounded p-2">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4" />
                <span className="text-sm text-white truncate flex-1">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-white w-6 h-6 p-0"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your reply..."
        className="bg-gray-600 border-gray-500 text-white placeholder:text-gray-400 min-h-[60px] resize-none"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-white w-8 h-8 p-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-white w-8 h-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg p-2 grid grid-cols-5 gap-1 shadow-lg z-10">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => addEmoji(emoji)}
                    className="w-8 h-8 p-0 text-lg hover:bg-gray-700"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() && attachments.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export const VideoReviewInterface = ({ 
  asset,
  comments, 
  onAddComment, 
  onDeleteComment,
  currentTime,
  onCommentClick,
  onBack,
  videoRef,
  isPlaying,
  duration,
  volume,
  isMuted,
  showControls,
  onMouseMove,
  onTogglePlayPause,
  onToggleMute,
  onSeek,
  formatTime,
  progress
}: VideoReviewInterfaceProps) => {
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLooping, setIsLooping] = useState(false);
  const [timestampFormat, setTimestampFormat] = useState<TimestampFormat>('seconds');
  const [internalVolume, setInternalVolume] = useState(volume);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSpeedHoverOpen, setIsSpeedHoverOpen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  // Video settings state
  const [quality, setQuality] = useState('720p');
  const [guides, setGuides] = useState({
    enabled: false,
    ratio: '16:9',
    mask: false
  });
  const [zoom, setZoom] = useState('Fit');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Available playback speeds (slow to fast)
  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const captureVideoFrame = () => {
    const video = videoRef.current;
    if (!video) {
      console.error('Video element not found');
      return null;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video dimensions are not available');
      return null;
    }

    if (video.readyState < 2) {
      console.error('Video not ready for frame capture');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      // Use smaller dimensions for thumbnail
      const maxWidth = 320;
      const maxHeight = 180;
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      if (aspectRatio > maxWidth / maxHeight) {
        canvas.width = maxWidth;
        canvas.height = maxWidth / aspectRatio;
      } else {
        canvas.height = maxHeight;
        canvas.width = maxHeight * aspectRatio;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get 2D context');
        return null;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('Frame captured successfully:', canvas.width, 'x', canvas.height);
      return canvas;
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  };

  const handleDownloadStill = async () => {
    console.log('Starting download still process...');
    
    const canvas = captureVideoFrame();
    if (!canvas) {
      toast({
        title: "Error",
        description: "Failed to capture video frame. Please ensure the video is playing and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create blob from canvas
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.name || 'video'}_frame_${Math.floor(currentTime)}s.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Frame downloaded successfully"
      });
      
      console.log('Frame downloaded successfully');
    } catch (error) {
      console.error('Error downloading frame:', error);
      toast({
        title: "Error",
        description: "Failed to download frame",
        variant: "destructive"
      });
    }
  };

  const handleSetFrameAsThumb = async () => {
    console.log('Starting set frame as thumbnail process...');
    
    const canvas = captureVideoFrame();
    if (!canvas) {
      toast({
        title: "Error",
        description: "Failed to capture video frame. Please ensure the video is playing and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert canvas to blob with high compression
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.6); // Lower quality for smaller file size
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      console.log('Blob created, size:', Math.round(blob.size / 1024), 'KB');

      // Check if blob is too large (limit to 1MB for safety)
      if (blob.size > 1024 * 1024) {
        throw new Error('Image file too large. Please try a different frame.');
      }

      // Upload thumbnail to Supabase storage
      const fileName = `thumbnails/${asset.id}_${Date.now()}.jpg`;
      console.log('Uploading to path:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData.path);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Update asset record with new thumbnail URL
      const { data: updateData, error: updateError } = await supabase
        .from('assets')
        .update({ 
          thumbnail_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id)
        .select();

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('Database updated successfully:', updateData);

      toast({
        title: "Success",
        description: "Frame saved as thumbnail"
      });

    } catch (error) {
      console.error('Error setting thumbnail:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set frame as thumbnail",
        variant: "destructive"
      });
    }
  };

  const handleZoomChange = (newZoom: string) => {
    const video = videoRef.current;
    if (!video) return;

    setZoom(newZoom);
    
    switch (newZoom) {
      case 'Fit':
        video.style.transform = 'scale(1)';
        video.style.objectFit = 'contain';
        video.style.transformOrigin = 'center center';
        setZoomLevel(1);
        console.log('Zoom: Fit to screen');
        break;
      case 'Fill':
        video.style.transform = 'scale(1)';
        video.style.objectFit = 'cover';
        video.style.transformOrigin = 'center center';
        setZoomLevel(1);
        console.log('Zoom: Fill screen');
        break;
      case 'Zoom In':
        const newZoomIn = Math.min(zoomLevel * 1.25, 5);
        video.style.transform = `scale(${newZoomIn})`;
        video.style.objectFit = 'contain';
        video.style.transformOrigin = 'center center';
        setZoomLevel(newZoomIn);
        console.log('Zoom In to:', Math.round(newZoomIn * 100) + '%');
        break;
      case 'Zoom Out':
        const newZoomOut = Math.max(zoomLevel * 0.8, 0.25);
        video.style.transform = `scale(${newZoomOut})`;
        video.style.objectFit = 'contain';
        video.style.transformOrigin = 'center center';
        setZoomLevel(newZoomOut);
        console.log('Zoom Out to:', Math.round(newZoomOut * 100) + '%');
        break;
      case '100%':
        video.style.transform = 'scale(1)';
        video.style.objectFit = 'none';
        video.style.transformOrigin = 'center center';
        setZoomLevel(1);
        console.log('Zoom: 100% actual size');
        break;
      default:
        video.style.transform = 'scale(1)';
        video.style.objectFit = 'contain';
        video.style.transformOrigin = 'center center';
        setZoomLevel(1);
    }
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
  };

  const handleSpeedHoverChange = (open: boolean) => {
    setIsSpeedHoverOpen(open);
  };

  // Enable keyboard shortcuts - fix the function signature
  useVideoKeyboardShortcuts({
    videoRef,
    volume: internalVolume,
    isPlaying,
    setVolume: setInternalVolume,
    onZoomChange: handleZoomChange,
    onPlaybackSpeedChange: handlePlaybackSpeedChange
  });

  const handleAddComment = (text: string, attachments?: any[], isInternal?: boolean, attachTime?: boolean, hasDrawing?: boolean) => {
    if (text.trim() || attachments?.length || hasDrawing) {
      console.log('VideoReviewInterface: Adding comment with hasDrawing:', hasDrawing);
      onAddComment(
        attachTime ? currentTime : -1,
        text.trim(),
        attachments,
        isInternal,
        attachTime,
        hasDrawing
      );
      
      // Reset drawing mode after comment
      if (isDrawingMode) {
        setIsDrawingMode(false);
      }
    }
  };

  const handleReply = (commentId: string) => {
    console.log('Reply button clicked:', { commentId });
    setReplyingTo(commentId);
  };

  const handleSubmitReply = (text: string, attachments?: File[]) => {
    console.log('Submitting reply:', { replyingTo, text });
    if (replyingTo && text.trim()) {
      // Find the parent comment to get its timestamp or use -1 for general replies
      const parentComment = comments.find(c => c.id === replyingTo);
      const replyTimestamp = parentComment?.timestamp ?? -1;
      
      // Add the reply comment with parentId - this is the key fix
      onAddComment(
        replyTimestamp,
        text,
        attachments ? Array.from(attachments).map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        })) : undefined,
        false, // Not internal
        false, // No timestamp attachment
        false, // No drawing
        replyingTo // Pass the parentId here
      );
      
      setReplyingTo(null);
    }
  };

  const handleCancelReply = () => {
    console.log('Reply cancelled');
    setReplyingTo(null);
  };

  const handleStartDrawing = () => {
    console.log('Drawing mode activated');
    setIsDrawingMode(true);
    
    // Pause video when entering drawing mode
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handlePauseVideo = () => {
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleCommentClickFromTimeline = (timestamp: number, commentId?: string) => {
    onCommentClick(timestamp);
    if (commentId) {
      setHighlightedCommentId(commentId);
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedCommentId(null);
      }, 3000);
    }
  };

  const toggleLoop = () => {
    const video = videoRef.current;
    if (video) {
      video.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const video = videoRef.current;
    if (video) {
      const volumeValue = newVolume[0] / 100;
      video.volume = volumeValue;
      video.muted = volumeValue === 0;
      setInternalVolume(volumeValue);
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted || internalVolume === 0) {
      // Unmute
      video.muted = false;
      const newVolume = internalVolume === 0 ? 0.5 : internalVolume;
      video.volume = newVolume;
      setInternalVolume(newVolume);
    } else {
      // Mute
      video.muted = true;
      setInternalVolume(0);
    }
  };

  const getVideoFrameRate = () => {
    // Try to get frame rate from video metadata, fallback to 30fps
    const video = videoRef.current;
    if (video) {
      // Check if the video has frame rate information
      // Most videos default to 30fps, but we can try to detect common rates
      return 30; // Default to 30fps for now
    }
    return 30;
  };

  const formatTimestamp = (seconds: number, format: TimestampFormat) => {
    if (!isFinite(seconds) || seconds < 0) return '00:00:00:00';
    
    switch (format) {
      case 'frames':
        const fps = getVideoFrameRate();
        const totalFrames = Math.floor(seconds * fps);
        return totalFrames.toString();
      
      case 'timecode':
        const tcHours = Math.floor(seconds / 3600);
        const tcMinutes = Math.floor((seconds % 3600) / 60);
        const tcSecs = Math.floor(seconds % 60);
        const tcFrames = Math.floor((seconds % 1) * 30); // Using 30fps for timecode
        return `${tcHours.toString().padStart(2, '0')}:${tcMinutes.toString().padStart(2, '0')}:${tcSecs.toString().padStart(2, '0')}:${tcFrames.toString().padStart(2, '0')}`;
      
      case 'seconds':
      default:
        return formatTime(seconds);
    }
  };

  const handleQualityChange = (newQuality: string) => {
    const video = videoRef.current;
    if (!video) return;

    const wasPlaying = !video.paused;
    const currentTimeBeforeChange = video.currentTime;

    setQuality(newQuality);
    
    // Simulate quality change by adjusting video properties
    // In a real implementation, you would switch to different video sources
    switch (newQuality) {
      case '2160p':
        video.style.filter = 'contrast(1.1) saturate(1.1)';
        console.log('Quality changed to 4K (2160p)');
        break;
      case '1080p':
        video.style.filter = 'contrast(1.05) saturate(1.05)';
        console.log('Quality changed to Full HD (1080p)');
        break;
      case '720p':
        video.style.filter = 'contrast(1.0) saturate(1.0)';
        console.log('Quality changed to HD (720p)');
        break;
      case '540p':
        video.style.filter = 'contrast(0.95) saturate(0.95) blur(0.2px)';
        console.log('Quality changed to SD (540p)');
        break;
      case '360p':
        video.style.filter = 'contrast(0.9) saturate(0.9) blur(0.5px)';
        console.log('Quality changed to SD (360p)');
        break;
      default:
        video.style.filter = 'none';
    }

    // Maintain playback state and position
    video.currentTime = currentTimeBeforeChange;
    if (wasPlaying) {
      video.play();
    }
  };

  const handleGuidesToggle = () => {
    setGuides(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleGuidesRatioChange = (ratio: string) => {
    setGuides(prev => ({ ...prev, ratio, enabled: true }));
  };

  const handleGuidesMaskToggle = () => {
    setGuides(prev => ({ ...prev, mask: !prev.mask }));
  };

  const getFileIcon = (file: any) => {
    if (file.type?.startsWith('image/')) return <ImageIcon className="h-3 w-3" />;
    if (file.type?.startsWith('video/')) return <Video className="h-3 w-3" />;
    if (file.type === 'application/pdf') return <FileText className="h-3 w-3" />;
    return <File className="h-3 w-3" />;
  };

  // Organize comments: separate main comments from replies
  const mainComments = comments.filter(comment => !comment.parentId);
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parentId) {
      if (!acc[comment.parentId]) {
        acc[comment.parentId] = [];
      }
      acc[comment.parentId].push(comment);
    }
    return acc;
  }, {} as Record<string, VideoComment[]>);

  const sortedComments = [...mainComments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter(comment =>
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  console.log('Comments passed to VideoReviewInterface:', comments);
  console.log('Comments with drawings:', comments.filter(c => c.hasDrawing));

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-black flex fixed inset-0 z-50">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Top Header Bar */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <span className="text-white font-medium">{asset.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div 
            ref={videoContainerRef}
            className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
            onMouseMove={onMouseMove}
          >
            {asset.file_type === 'video' ? (
              <>
                <video
                  ref={videoRef}
                  src={asset.file_url}
                  className="max-w-full max-h-full transition-transform duration-200"
                  style={{ objectFit: 'contain' }}
                  playsInline
                  controls={false}
                  crossOrigin="anonymous"
                  onLoadedData={() => {
                    console.log('Video loaded and ready for frame capture');
                  }}
                  onError={(e) => {
                    console.error('Video error:', e);
                  }}
                  onCanPlay={() => {
                    console.log('Video can start playing');
                  }}
                />

                {/* Hidden preview video for timeline hover */}
                <video
                  ref={previewVideoRef}
                  src={asset.file_url}
                  className="hidden"
                  playsInline
                  muted
                  crossOrigin="anonymous"
                />
                
                {/* Drawing Canvas Overlay */}
                <DrawingCanvas
                  currentTime={currentTime}
                  videoRef={videoRef}
                  isDrawingMode={isDrawingMode}
                  annotations={true}
                />
                
                {/* Video Guides Overlay */}
                <VideoGuides
                  videoRef={videoRef}
                  containerRef={videoContainerRef}
                  guides={guides}
                />
                
                {/* Video Controls Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="p-6">
                    {/* Video Timeline with comment markers and hover preview */}
                    <VideoTimeline 
                      currentTime={currentTime}
                      duration={duration}
                      comments={comments}
                      onTimeClick={handleCommentClickFromTimeline}
                      previewVideoRef={previewVideoRef}
                      timeFormat={timestampFormat}
                      assetId={asset.id}
                    />

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={onTogglePlayPause}
                          className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const video = videoRef.current;
                            if (video) {
                              video.loop = !isLooping;
                              setIsLooping(!isLooping);
                            }
                          }}
                          className={`text-white hover:bg-white/20 ${isLooping ? 'bg-white/20' : ''}`}
                        >
                          <Repeat className="h-5 w-5" />
                        </Button>

                        {/* Playback Speed Control */}
                        <HoverCard open={isSpeedHoverOpen} onOpenChange={handleSpeedHoverChange}>
                          <HoverCardTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsSpeedHoverOpen(!isSpeedHoverOpen)}
                              className="text-white hover:bg-white/20 px-3 py-2 text-sm font-mono"
                            >
                              {playbackSpeed}x
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent 
                            side="top" 
                            className="w-auto p-4 bg-gray-800 border-gray-700"
                          >
                            <div className="space-y-3">
                              <div className="text-white text-sm font-medium">Playback speed</div>
                              <div className="flex items-center space-x-2">
                                {playbackSpeeds.map((speed) => (
                                  <Button
                                    key={speed}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePlaybackSpeedChange(speed)}
                                    className={`text-white text-sm font-mono px-3 py-1 rounded ${
                                      playbackSpeed === speed 
                                        ? 'bg-pink-500 hover:bg-pink-600' 
                                        : 'hover:bg-gray-700'
                                    }`}
                                  >
                                    {speed}x
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        
                        {/* Volume Control with separate tooltips */}
                        <div className="relative">
                          {/* Keyboard shortcut tooltip on top */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {/* Volume slider on hover to the right */}
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleMuteToggle}
                                      className="text-white hover:bg-white/20"
                                    >
                                      {isMuted || internalVolume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent 
                                    side="right" 
                                    align="center"
                                    className="w-auto p-2 bg-gray-800 border-gray-700"
                                  >
                                    <div className="space-y-1">
                                      <div className="text-white text-xs">Volume</div>
                                      <Slider
                                        value={[isMuted ? 0 : Math.round(internalVolume * 100)]}
                                        onValueChange={handleVolumeChange}
                                        max={100}
                                        step={1}
                                        className="w-12"
                                      />
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="bg-gray-800 border-gray-700 text-white px-3 py-2"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">
                                  {isMuted || internalVolume === 0 ? 'Unmute' : 'Mute'}
                                </span>
                                <div className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                                  M
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Centered Timestamp with Format Dropdown */}
                      <div className="absolute left-1/2 transform -translate-x-1/2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="text-white text-lg font-mono hover:bg-white/20 flex items-center space-x-2"
                            >
                              <span>{formatTimestamp(currentTime, timestampFormat)} / {formatTimestamp(duration, timestampFormat)}</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem 
                              onClick={() => setTimestampFormat('seconds')}
                              className="text-white hover:bg-gray-700"
                            >
                              Standard (MM:SS)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setTimestampFormat('timecode')}
                              className="text-white hover:bg-gray-700"
                            >
                              Timecode (HH:MM:SS:FF)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setTimestampFormat('frames')}
                              className="text-white hover:bg-gray-700"
                            >
                              Frames
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Right side controls */}
                      <div className="flex items-center space-x-4">
                        <div className="text-white text-sm opacity-75">
                          {Math.round(progress)}% complete
                        </div>
                        <VideoSettingsMenu
                          quality={quality}
                          availableQualities={['2160p', '1080p', '720p', '540p', '360p']}
                          onQualityChange={handleQualityChange}
                          guides={guides}
                          onGuidesToggle={handleGuidesToggle}
                          onGuidesRatioChange={handleGuidesRatioChange}
                          onGuidesMaskToggle={handleGuidesMaskToggle}
                          zoom={zoom}
                          onZoomChange={handleZoomChange}
                          encodeComments={false}
                          setEncodeComments={() => {}}
                          annotations={true}
                          setAnnotations={() => {}}
                          onSetFrameAsThumb={handleSetFrameAsThumb}
                          onDownloadStill={handleDownloadStill}
                          currentTime={currentTime}
                          formatTime={formatTime}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
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

        {/* Comments Panel */}
        {asset.file_type === 'video' && (
          <div className="w-96 border-l border-gray-700 flex-shrink-0 bg-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-white font-medium">All comments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search comments..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center justify-between text-sm">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-sm">
                      Sort thread by... <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      Newest first
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      Oldest first
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      By timestamp
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimestamp(currentTime, timestampFormat)}</span>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sortedComments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No comments found</p>
                  {searchQuery && (
                    <p className="text-gray-500 text-sm mt-1">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              ) : (
                sortedComments.map((comment, index) => {
                  console.log(`Rendering comment ${comment.id}:`, {
                    hasDrawing: comment.hasDrawing,
                    hasTimestamp: comment.hasTimestamp,
                    timestamp: comment.timestamp
                  });
                  
                  const commentReplies = repliesMap[comment.id] || [];
                  
                  return (
                    <div key={comment.id} className="space-y-3">
                      {/* Main Comment */}
                      <div className={`bg-gray-700 rounded-lg p-3 group hover:bg-gray-650 transition-colors ${
                        highlightedCommentId === comment.id ? 'ring-2 ring-pink-500 bg-gray-650' : ''
                      }`}>
                        {/* Comment Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="text-gray-400 text-sm font-medium">
                              #{sortedComments.length - index}
                            </span>
                            
                            {/* Show timestamp badge if comment has timestamp */}
                            {comment.hasTimestamp && comment.timestamp >= 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log('Timestamp clicked:', comment.timestamp);
                                  onCommentClick(comment.timestamp);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 h-auto bg-blue-400/10 hover:bg-blue-400/20 rounded flex items-center space-x-1"
                              >
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(comment.timestamp, timestampFormat)}</span>
                              </Button>
                            )}
                            
                            {/* Show drawing icon if comment has drawing */}
                            {comment.hasDrawing && (
                              <div className="flex items-center text-pink-400 bg-pink-400/10 px-2 py-1 rounded text-xs">
                                <PenTool className="w-3 h-3 mr-1" />
                                <span className="text-xs">Drawing</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Comment Content */}
                        <div className="mb-2">
                          <p className="text-gray-200 text-sm leading-relaxed text-left">
                            {comment.content}
                          </p>
                        </div>

                        {/* Comment Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mb-2 space-y-1">
                            {comment.attachments.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center space-x-2 bg-gray-600 rounded p-2 text-xs">
                                {getFileIcon(file)}
                                <span className="text-gray-300 truncate flex-1">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.url || URL.createObjectURL(file), '_blank')}
                                  className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarFallback 
                                className="text-white text-xs"
                                style={{ backgroundColor: comment.authorColor }}
                              >
                                {comment.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-300 text-sm font-medium">{comment.author}</span>
                            <span className="text-gray-500 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                            className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1 h-auto flex items-center space-x-1"
                          >
                            <Reply className="h-3 w-3" />
                            <span>Reply</span>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Reply Input - Show when replying to this comment */}
                      {replyingTo === comment.id && (
                        <div className="ml-6">
                          <SimpleReplyInput
                            onSubmit={handleSubmitReply}
                            onCancel={handleCancelReply}
                            replyingTo={comment.author}
                          />
                        </div>
                      )}
                      
                      {/* Replies under this comment - Show as nested */}
                      {commentReplies.length > 0 && (
                        <div className="ml-6 space-y-2 border-l-2 border-gray-600 pl-4">
                          <div className="text-xs text-gray-400 mb-2">
                            {commentReplies.length} {commentReplies.length === 1 ? 'reply' : 'replies'}
                          </div>
                          {commentReplies
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((reply) => (
                            <div key={reply.id} className="bg-gray-700/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-5 w-5 flex-shrink-0">
                                    <AvatarFallback 
                                      className="text-white text-xs"
                                      style={{ backgroundColor: reply.authorColor }}
                                    >
                                      {reply.author.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-gray-300 text-sm font-medium">{reply.author}</span>
                                  <span className="text-gray-500 text-xs">{formatTimeAgo(reply.createdAt)}</span>
                                  <div className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">Reply</div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteComment(reply.id)}
                                  className="text-gray-400 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-gray-200 text-sm leading-relaxed text-left">
                                {reply.content}
                              </p>
                              {/* Show attachments for replies */}
                              {reply.attachments && reply.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {reply.attachments.map((file, fileIndex) => (
                                    <div key={fileIndex} className="flex items-center space-x-2 bg-gray-600 rounded p-2 text-xs">
                                      {getFileIcon(file)}
                                      <span className="text-gray-300 truncate flex-1">{file.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(file.url || URL.createObjectURL(file), '_blank')}
                                        className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment - Hidden when replying */}
            {!replyingTo && (
              <div className="p-4 border-t border-gray-700">
                <CommentInput
                  onAddComment={handleAddComment}
                  placeholder="Leave your comment..."
                  currentTime={currentTime}
                  onStartDrawing={handleStartDrawing}
                  isDrawingMode={isDrawingMode}
                  onPauseVideo={handlePauseVideo}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="fixed bottom-4 right-4 z-[60]">
        <Toaster />
      </div>
    </TooltipProvider>
  );
};
