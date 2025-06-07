import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

  // Reset state when attachment changes
  useEffect(() => {
    if (attachment) {
      console.log('📎 Loading attachment:', attachment);
      setIsLoading(true);
      setError(false);
      
      // For non-previewable files, set loading to false immediately
      const fileType = getFileType(attachment);
      if (!['image', 'video', 'audio', 'pdf'].includes(fileType)) {
        setTimeout(() => setIsLoading(false), 100);
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
    console.log('❌ Content failed to load');
    setError(true);
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading && !error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <File size={48} className="text-gray-500" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">Unable to preview</h3>
            <p className="text-gray-400 text-sm mb-4">
              This file type cannot be previewed in the browser.
            </p>
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              <Download size={16} className="mr-2" />
              Download File
            </Button>
          </div>
        </div>
      );
    }

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
            />
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
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-[70vh]">
            <iframe
              src={attachment.url}
              className="w-full h-full rounded-lg border border-gray-600"
              title={`PDF: ${getFileName()}`}
              onLoad={handleLoadSuccess}
              onError={handleLoadError}
            />
          </div>
        );
      
      default:
        // For other file types, show file info and download option
        return (
          <div className="flex flex-col items-center justify-center p-12 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-700 rounded-full">
                {getFileIcon()}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">{getFileName()}</h3>
                <p className="text-gray-400 text-sm">
                  {fileType === 'archive' ? 'Archive file' : 
                   fileType === 'document' ? 'Document file' : 
                   'File attachment'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              <Download size={16} className="mr-2" />
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-600 text-white p-0"
        showCloseButton={false}
      >
        {/* Custom Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <span className="text-lg font-medium">Attachment {attachmentIndex + 1}</span>
            <span className="text-sm text-gray-400">({getFileName()})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
            >
              <X size={20} />
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