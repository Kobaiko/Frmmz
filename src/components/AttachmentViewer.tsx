import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  Archive,
  FileType
} from "lucide-react";

interface AttachmentViewerProps {
  attachment: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset state when attachment changes
  useEffect(() => {
    if (attachment) {
      setIsLoading(true);
      setError(false);
    }
  }, [attachment]);

  if (!attachment) return null;

  // Enhanced file type detection
  const getFileType = (url: string) => {
    // Check data URLs first
    if (url.startsWith('data:')) {
      const mimeType = url.split(';')[0].split(':')[1];
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
      if (mimeType.includes('pdf')) return 'pdf';
      return 'file';
    }
    
    // For blob URLs and regular URLs, check file extensions
    const extension = url.split('.').pop()?.toLowerCase();
    
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
    if (attachment.startsWith('blob:') || attachment.startsWith('data:')) {
      return `attachment-${attachmentIndex + 1}`;
    }
    return attachment.split('/').pop() || `attachment-${attachmentIndex + 1}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment;
    link.download = getFileName();
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('📁 Downloaded attachment:', getFileName());
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
              src={attachment}
              alt={`Attachment ${attachmentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => {
                console.log('✅ Image loaded successfully');
                setIsLoading(false);
              }}
              onError={() => {
                console.log('❌ Image failed to load');
                setError(true);
                setIsLoading(false);
              }}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="flex items-center justify-center max-h-[70vh]">
            <video
              src={attachment}
              controls
              className="max-w-full max-h-full rounded-lg"
              onLoadedData={() => {
                console.log('✅ Video loaded successfully');
                setIsLoading(false);
              }}
              onError={() => {
                console.log('❌ Video failed to load');
                setError(true);
                setIsLoading(false);
              }}
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
              src={attachment}
              controls
              className="w-full max-w-md"
              onLoadedData={() => {
                console.log('✅ Audio loaded successfully');
                setIsLoading(false);
              }}
              onError={() => {
                console.log('❌ Audio failed to load');
                setError(true);
                setIsLoading(false);
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-[70vh]">
            <iframe
              src={attachment}
              className="w-full h-full rounded-lg border border-gray-600"
              title={`PDF: ${getFileName()}`}
              onLoad={() => {
                console.log('✅ PDF loaded successfully');
                setIsLoading(false);
              }}
              onError={() => {
                console.log('❌ PDF failed to load');
                setError(true);
                setIsLoading(false);
              }}
            />
          </div>
        );
      
      default:
        // For other file types, show file info and download option immediately
        setTimeout(() => setIsLoading(false), 100);
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
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
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-600 text-white">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center space-x-3">
            {getFileIcon()}
            <span>Attachment {attachmentIndex + 1}</span>
            <span className="text-sm text-gray-400">({getFileName()})</span>
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="pb-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};