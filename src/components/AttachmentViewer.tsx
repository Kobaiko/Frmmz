
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Download, 
  X, 
  FileText, 
  File, 
  Image as ImageIcon,
  Video,
  Music,
  Archive
} from "lucide-react";

interface AttachmentWithType {
  url: string;
  type: string;
  name: string;
}

interface AttachmentViewerProps {
  attachment: AttachmentWithType | null;
  attachmentIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentViewer = ({ 
  attachment, 
  attachmentIndex = 0,
  isOpen, 
  onClose 
}: AttachmentViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showDownloadOnly, setShowDownloadOnly] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Enhanced file type detection
  const getFileType = (attachment: AttachmentWithType) => {
    const { type, name } = attachment;
    
    console.log('🔍 Detecting file type for:', { name, type });
    
    const extension = name?.split('.').pop()?.toLowerCase() || '';
    
    // Use MIME type first (most reliable)
    if (type) {
      if (type.startsWith('image/')) {
        console.log('✅ Detected as IMAGE via MIME');
        return 'image';
      }
      if (type.startsWith('video/')) {
        console.log('✅ Detected as VIDEO via MIME');
        return 'video';
      }
      if (type.startsWith('audio/')) {
        console.log('✅ Detected as AUDIO via MIME');
        return 'audio';
      }
      if (type === 'application/pdf') {
        console.log('✅ Detected as PDF via MIME');
        return 'pdf';
      }
      if (type.includes('text')) {
        console.log('✅ Detected as TEXT via MIME');
        return 'text';
      }
    }
    
    // Fallback to extension
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'].includes(extension)) {
      console.log('✅ Detected as IMAGE via extension');
      return 'image';
    }
    if (['mp4', 'avi', 'mov', 'webm', 'mkv', 'ogv', 'flv', 'wmv', 'm4v'].includes(extension)) {
      console.log('✅ Detected as VIDEO via extension');
      return 'video';
    }
    if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(extension)) {
      console.log('✅ Detected as AUDIO via extension');
      return 'audio';
    }
    if (extension === 'pdf') {
      console.log('✅ Detected as PDF via extension');
      return 'pdf';
    }
    if (['txt', 'md', 'json', 'xml', 'csv', 'log', 'rtf'].includes(extension)) {
      console.log('✅ Detected as TEXT via extension');
      return 'text';
    }
    
    console.log('❌ Unknown file type - defaulting to FILE');
    return 'file';
  };

  // Reset state when attachment changes
  useEffect(() => {
    if (attachment) {
      console.log('📎 AttachmentViewer: Loading new attachment:', attachment);
      
      // Reset all states
      setError(false);
      setIsLoading(false);
      setShowDownloadOnly(false);
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      const fileType = getFileType(attachment);
      console.log('📋 Final detected file type:', fileType);
      
      // Check if file type is previewable
      const previewableTypes = ['image', 'video', 'audio', 'pdf', 'text'];
      const isPreviewable = previewableTypes.includes(fileType);
      
      console.log('🔍 Is previewable?', isPreviewable, '(type:', fileType, ')');
      
      if (!isPreviewable) {
        console.log('⭐ Non-previewable file - showing download interface');
        setShowDownloadOnly(true);
        return;
      }
      
      // For previewable files, start loading
      console.log('🚀 Starting preview loading for', fileType);
      setIsLoading(true);
      
      // Set reasonable timeout for different file types
      const timeoutDuration = fileType === 'pdf' || fileType === 'text' ? 15000 : 30000;
      console.log(`⏱️ Setting ${timeoutDuration/1000} second timeout for ${fileType} file`);
      
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ TIMEOUT: File took too long to load - switching to download mode');
        setIsLoading(false);
        setError(true);
        setShowDownloadOnly(true);
      }, timeoutDuration);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [attachment]);

  if (!attachment) return null;

  const fileType = getFileType(attachment);

  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return <ImageIcon size={20} className="text-blue-400" />;
      case 'video': return <Video size={20} className="text-purple-400" />;
      case 'audio': return <Music size={20} className="text-green-400" />;
      case 'pdf': return <FileText size={20} className="text-red-400" />;
      case 'text': return <FileText size={20} className="text-blue-400" />;
      case 'archive': return <Archive size={20} className="text-orange-400" />;
      default: return <File size={20} className="text-gray-400" />;
    }
  };

  // Truncate filename with ellipsis
  const getTruncatedFileName = (maxLength = 40) => {
    const name = attachment.name || `attachment-${attachmentIndex + 1}`;
    if (name.length <= maxLength) return name;
    
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const maxNameLength = maxLength - (extension ? extension.length + 4 : 3);
    
    if (extension) {
      return `${nameWithoutExt.substring(0, maxNameLength)}...${extension}`;
    }
    return `${name.substring(0, maxLength - 3)}...`;
  };

  const getFullFileName = () => {
    return attachment.name || `attachment-${attachmentIndex + 1}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = getFullFileName();
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('📁 Downloaded attachment:', getFullFileName());
  };

  const handleLoadSuccess = () => {
    console.log('✅ Content loaded successfully for:', fileType);
    setIsLoading(false);
    setError(false);
    
    // Clear timeout since loading succeeded
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const handleLoadError = (errorMessage?: string) => {
    console.log('❌ Content failed to load:', errorMessage || 'Unknown error');
    setError(true);
    setIsLoading(false);
    setShowDownloadOnly(true);
    
    // Clear timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const renderContent = () => {
    console.log('🎨 Rendering content - isLoading:', isLoading, 'error:', error, 'showDownloadOnly:', showDownloadOnly, 'fileType:', fileType);
    
    // Show loading spinner for previewable content
    if (isLoading && !error && !showDownloadOnly) {
      console.log('⏳ Showing loading spinner');
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading {fileType} preview...</span>
        </div>
      );
    }

    // Show download-only interface
    if (showDownloadOnly || error) {
      console.log('📥 Showing download interface');
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-6">
          <div className="p-4 bg-gray-700 rounded-full">
            {getFileIcon()}
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-lg font-medium text-white mb-2 break-words">
              {getTruncatedFileName(50)}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {error ? 'Unable to preview this file in the browser.' : 
               'File ready for download'}
            </p>
            <div className="flex justify-center">
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 px-6 py-3"
              >
                <Download size={16} />
                <span>Download File</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show preview for supported file types
    console.log('🖼️ Rendering preview for type:', fileType);
    switch (fileType) {
      case 'image':
        console.log('🖼️ Rendering image preview');
        return (
          <div className="flex items-center justify-center max-h-[70vh] overflow-hidden">
            <img
              src={attachment.url}
              alt={getFullFileName()}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => {
                console.log('🖼️ Image loaded successfully');
                handleLoadSuccess();
              }}
              onError={(e) => {
                console.log('❌ Image failed to load:', e);
                handleLoadError('Image failed to load');
              }}
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
            />
          </div>
        );
      
      case 'video':
        console.log('📹 Rendering video preview');
        return (
          <div className="flex items-center justify-center max-h-[70vh]">
            <video
              ref={videoRef}
              src={attachment.url}
              controls
              className="max-w-full max-h-full rounded-lg"
              onLoadedMetadata={() => {
                console.log('📹 Video metadata loaded successfully');
                handleLoadSuccess();
              }}
              onCanPlay={() => {
                console.log('📹 Video can play');
                handleLoadSuccess();
              }}
              onError={(e) => {
                console.log('❌ Video failed to load:', e);
                handleLoadError('Video failed to load');
              }}
              style={{ backgroundColor: 'black', maxWidth: '100%', maxHeight: '70vh' }}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        console.log('🎵 Rendering audio preview');
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <span className="text-lg font-medium text-white break-words max-w-md">
                {getTruncatedFileName(40)}
              </span>
            </div>
            <audio
              src={attachment.url}
              controls
              className="w-full max-w-md"
              onLoadedMetadata={() => {
                console.log('🎵 Audio metadata loaded successfully');
                handleLoadSuccess();
              }}
              onCanPlay={() => {
                console.log('🎵 Audio can play');
                handleLoadSuccess();
              }}
              onError={(e) => {
                console.log('❌ Audio failed to load:', e);
                handleLoadError('Audio failed to load');
              }}
              preload="metadata"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'pdf':
        console.log('📄 Rendering PDF preview');
        return (
          <div className="h-[70vh] w-full">
            <iframe
              src={attachment.url}
              className="w-full h-full rounded-lg border border-gray-600"
              title={getFullFileName()}
              onLoad={() => {
                console.log('📄 PDF loaded successfully');
                handleLoadSuccess();
              }}
              onError={(e) => {
                console.log('❌ PDF failed to load:', e);
                handleLoadError('PDF failed to load');
              }}
            />
          </div>
        );
      
      case 'text':
        console.log('📝 Rendering text preview');
        return (
          <div className="max-h-[70vh] overflow-auto bg-gray-800 rounded-lg p-4">
            <iframe
              src={attachment.url}
              className="w-full min-h-[400px] bg-white rounded"
              title={getFullFileName()}
              onLoad={() => {
                console.log('📝 Text file loaded successfully');
                handleLoadSuccess();
              }}
              onError={(e) => {
                console.log('❌ Text file failed to load:', e);
                handleLoadError('Text file failed to load');
              }}
            />
          </div>
        );
      
      default:
        console.log('❓ Unknown file type for preview:', fileType);
        setShowDownloadOnly(true);
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-600 text-white p-0 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">
          Attachment Viewer - {getFullFileName()}
        </DialogTitle>
        
        {/* Custom Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {getFileIcon()}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-lg font-medium">Attachment {attachmentIndex + 1}</span>
              <span 
                className="text-sm text-gray-400 truncate"
                title={getFullFileName()}
              >
                {getTruncatedFileName(60)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 px-4 py-2"
            >
              <Download size={14} />
              <span>Download</span>
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
            >
              <X size={18} />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
