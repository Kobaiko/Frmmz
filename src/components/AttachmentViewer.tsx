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

  // Reset state when attachment changes
  useEffect(() => {
    if (attachment) {
      console.log('📎 Loading attachment:', attachment);
      setError(false);
      setIsLoading(false);
      setShowDownloadOnly(false);
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      const fileType = getFileType(attachment);
      console.log('📎 File type detected:', fileType);
      
      // Check if file is previewable
      const previewableTypes = ['image', 'video', 'audio', 'pdf'];
      
      if (!previewableTypes.includes(fileType)) {
        console.log('📄 Non-previewable file type - showing download only');
        setShowDownloadOnly(true);
        return;
      }
      
      // For previewable files, start loading
      console.log('🖼️ Starting to load previewable file:', fileType);
      setIsLoading(true);
      
      // Set timeout only for media files that might hang
      if (['image', 'video', 'audio'].includes(fileType)) {
        loadingTimeoutRef.current = setTimeout(() => {
          console.log('⏰ Loading timeout - switching to download mode');
          setIsLoading(false);
          setError(true);
          setShowDownloadOnly(true);
        }, 8000); // 8 second timeout for media files
      }
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [attachment]);

  if (!attachment) return null;

  // Enhanced file type detection
  const getFileType = (attachment: AttachmentWithType) => {
    const { type, name } = attachment;
    
    // Use MIME type first
    if (type) {
      if (type.startsWith('image/')) return 'image';
      if (type.startsWith('video/')) return 'video';
      if (type.startsWith('audio/')) return 'audio';
      if (type === 'application/pdf') return 'pdf';
      if (type.includes('text')) return 'text';
    }
    
    // Fallback to extension
    const extension = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '')) return 'image';
    if (['mp4', 'avi', 'mov', 'webm', 'mkv', 'ogv'].includes(extension || '')) return 'video';
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension || '')) return 'audio';
    if (extension === 'pdf') return 'pdf';
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension || '')) return 'text';
    
    return 'file';
  };

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
    console.log('✅ Content loaded successfully');
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
    // Show loading spinner for previewable content
    if (isLoading && !error && !showDownloadOnly) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading {fileType} preview...</span>
        </div>
      );
    }

    // Show download-only interface
    if (showDownloadOnly || error) {
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
    switch (fileType) {
      case 'image':
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
        return (
          <div className="flex items-center justify-center max-h-[70vh]">
            <video
              src={attachment.url}
              controls
              className="max-w-full max-h-full rounded-lg"
              onLoadedData={() => {
                console.log('📹 Video loaded successfully');
                handleLoadSuccess();
              }}
              onError={(e) => {
                console.log('❌ Video failed to load:', e);
                handleLoadError('Video failed to load');
              }}
              onCanPlay={() => {
                console.log('📹 Video can play');
                handleLoadSuccess();
              }}
              style={{ backgroundColor: 'black', maxWidth: '100%', maxHeight: '70vh' }}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
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
              onLoadedData={() => {
                console.log('🎵 Audio loaded successfully');
                handleLoadSuccess();
              }}
              onError={(e) => {
                console.log('❌ Audio failed to load:', e);
                handleLoadError('Audio failed to load');
              }}
              onCanPlay={() => {
                console.log('🎵 Audio can play');
                handleLoadSuccess();
              }}
              preload="metadata"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'pdf':
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
        // Should not reach here for previewable files
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-600 text-white p-0 [&>button]:hidden"
      >
        {/* Accessible title for screen readers */}
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