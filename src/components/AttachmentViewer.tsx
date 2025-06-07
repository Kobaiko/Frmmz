import { useState, useEffect } from "react";
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

  // Reset state when attachment changes
  useEffect(() => {
    if (attachment) {
      console.log('📎 Loading attachment:', attachment);
      setError(false);
      setIsLoading(false);
      setShowDownloadOnly(false);
      
      const fileType = getFileType(attachment);
      console.log('📎 File type detected:', fileType);
      
      // For PDFs from blob URLs (uploaded files), show download only
      // Regular URL PDFs can sometimes be previewed
      if (fileType === 'pdf' && attachment.url.startsWith('blob:')) {
        console.log('📄 PDF blob URL detected - showing download only');
        setShowDownloadOnly(true);
        return;
      }
      
      // For non-previewable files, show download only
      if (!['image', 'video', 'audio', 'pdf'].includes(fileType)) {
        console.log('📄 Non-previewable file type - showing download only');
        setShowDownloadOnly(true);
        return;
      }
      
      // For previewable files, start with loading state
      if (['image', 'video', 'audio'].includes(fileType)) {
        console.log('🖼️ Previewable file - starting to load');
        setIsLoading(true);
      }
    }
  }, [attachment]);

  if (!attachment) return null;

  // Enhanced file type detection using MIME type and extension
  const getFileType = (attachment: AttachmentWithType) => {
    const { type, url, name } = attachment;
    
    // Use MIME type first (most reliable for uploaded files)
    if (type) {
      if (type.startsWith('image/')) return 'image';
      if (type.startsWith('video/')) return 'video';
      if (type.startsWith('audio/')) return 'audio';
      if (type === 'application/pdf') return 'pdf';
      if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'archive';
      if (type.includes('text') || type.includes('document')) return 'document';
    }
    
    // Fallback to extension detection
    const fileName = name || url;
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension || '')) {
      return 'image';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
      return 'video';
    }
    if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension || '')) {
      return 'audio';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return 'archive';
    }
    if (['txt', 'md', 'rtf', 'doc', 'docx'].includes(extension || '')) {
      return 'document';
    }
    
    return 'file';
  };

  const fileType = getFileType(attachment);

  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return <ImageIcon size={20} className="text-blue-400" />;
      case 'video': return <Video size={20} className="text-purple-400" />;
      case 'audio': return <Music size={20} className="text-green-400" />;
      case 'pdf': return <FileText size={20} className="text-red-400" />;
      case 'document': return <FileText size={20} className="text-blue-400" />;
      case 'archive': return <Archive size={20} className="text-orange-400" />;
      default: return <File size={20} className="text-gray-400" />;
    }
  };

  const getFileName = () => {
    return attachment.name || `attachment-${attachmentIndex + 1}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = getFileName();
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('📁 Downloaded attachment:', getFileName());
  };

  const handleLoadSuccess = () => {
    console.log('✅ Content loaded successfully');
    setIsLoading(false);
    setError(false);
  };

  const handleLoadError = () => {
    console.log('❌ Content failed to load - showing download option');
    setError(true);
    setIsLoading(false);
    setShowDownloadOnly(true);
  };

  const renderContent = () => {
    // Show loading spinner
    if (isLoading && !error && !showDownloadOnly) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      );
    }

    // Show download-only interface
    if (showDownloadOnly || error || (!isLoading && !['image', 'video', 'audio', 'pdf'].includes(fileType))) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-6">
          <div className="p-4 bg-gray-700 rounded-full">
            {getFileIcon()}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">{getFileName()}</h3>
            <p className="text-gray-400 text-sm mb-6">
              {error ? 'Unable to preview this file in the browser.' : 
               fileType === 'pdf' ? 'PDF file ready for download' :
               fileType === 'archive' ? 'Archive file' : 
               fileType === 'document' ? 'Document file' : 
               'File attachment'}
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
              alt={getFileName()}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={handleLoadSuccess}
              onError={handleLoadError}
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
              onLoadedData={handleLoadSuccess}
              onError={handleLoadError}
              style={{ backgroundColor: 'black' }}
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
              <span className="text-lg font-medium text-white">{getFileName()}</span>
            </div>
            <audio
              src={attachment.url}
              controls
              className="w-full max-w-md"
              onLoadedData={handleLoadSuccess}
              onError={handleLoadError}
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
              className="w-full h-full rounded-lg"
              title={getFileName()}
              onLoad={handleLoadSuccess}
              onError={handleLoadError}
            />
          </div>
        );
      
      default:
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
          Attachment Viewer - {getFileName()}
        </DialogTitle>
        
        {/* Custom Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div className="flex flex-col">
              <span className="text-lg font-medium">Attachment {attachmentIndex + 1}</span>
              <span className="text-sm text-gray-400">{getFileName()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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