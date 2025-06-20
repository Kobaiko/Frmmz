
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, FileText, Printer, Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  createdAt: Date;
  parentId?: string;
  isInternal?: boolean;
  hasDrawing?: boolean;
}

interface CommentActionsMenuProps {
  comments: Comment[];
  onCopyComments?: () => void;
  onPasteComments?: () => void;
  onPrintComments?: () => void;
  onExportComments?: () => void;
}

export const CommentActionsMenu = ({
  comments,
  onCopyComments,
  onPasteComments,
  onPrintComments,
  onExportComments,
}: CommentActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyComments = () => {
    const commentsText = comments.map(comment => {
      const timestamp = comment.timestamp !== -1 ? `[${Math.floor(comment.timestamp / 60)}:${Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}] ` : '';
      const replyIndicator = comment.parentId ? '↳ ' : '';
      return `${replyIndicator}${timestamp}${comment.author}: ${comment.text}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(commentsText).then(() => {
      toast({
        title: "Comments copied",
        description: `${comments.length} comments copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Unable to copy comments to clipboard",
        variant: "destructive",
      });
    });
    
    setIsOpen(false);
    onCopyComments?.();
  };

  const handlePasteComments = () => {
    navigator.clipboard.readText().then((text) => {
      toast({
        title: "Paste comments",
        description: "Paste functionality would process the clipboard content",
      });
    }).catch(() => {
      toast({
        title: "Paste failed",
        description: "Unable to read clipboard content",
        variant: "destructive",
      });
    });
    setIsOpen(false);
    onPasteComments?.();
  };

  const handlePrintComments = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const commentsHtml = comments.map(comment => {
        const timestamp = comment.timestamp !== -1 ? `[${Math.floor(comment.timestamp / 60)}:${Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}] ` : '';
        const replyIndicator = comment.parentId ? '<div style="margin-left: 20px; border-left: 2px solid #ccc; padding-left: 10px;">' : '<div>';
        const badges = [];
        if (comment.hasDrawing) badges.push('<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">Drawing</span>');
        if (comment.isInternal) badges.push('<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">Internal</span>');
        if (comment.parentId) badges.push('<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">Reply</span>');
        
        return `${replyIndicator}
          <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #ccc; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <strong>${comment.author}</strong> 
              ${timestamp}
              ${badges.join(' ')}
            </div>
            <div style="margin-top: 8px; line-height: 1.4;">${comment.text}</div>
            <div style="margin-top: 8px; color: #666; font-size: 12px;">${comment.createdAt.toLocaleString()}</div>
          </div>
        </div>`;
      }).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Comments Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            </style>
          </head>
          <body>
            <h1>Comments Report</h1>
            <p><strong>Total Comments:</strong> ${comments.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            ${commentsHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast({
      title: "Comments printed",
      description: "Opening print dialog",
    });
    
    setIsOpen(false);
    onPrintComments?.();
  };

  const handleExportComments = () => {
    const commentsData = comments.map(comment => ({
      id: comment.id,
      author: comment.author,
      content: comment.text,
      timestamp: comment.timestamp,
      createdAt: comment.createdAt.toISOString(),
      videoTime: comment.timestamp !== -1 ? `${Math.floor(comment.timestamp / 60)}:${Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}` : 'General',
      isReply: !!comment.parentId,
      parentId: comment.parentId || '',
      isInternal: comment.isInternal || false,
      hasDrawing: comment.hasDrawing || false
    }));

    const csvContent = [
      'ID,Author,Content,Video Time,Created At,Is Reply,Parent ID,Is Internal,Has Drawing',
      ...commentsData.map(comment => 
        `"${comment.id}","${comment.author}","${comment.content.replace(/"/g, '""')}","${comment.videoTime}","${comment.createdAt}","${comment.isReply}","${comment.parentId}","${comment.isInternal}","${comment.hasDrawing}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comments-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Comments exported",
      description: `${comments.length} comments exported as CSV file`,
    });
    
    setIsOpen(false);
    onExportComments?.();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-gray-800 border-gray-700 text-white z-50" 
        align="end"
        side="bottom"
      >
        <DropdownMenuItem
          onClick={handleCopyComments}
          className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
        >
          <Copy size={16} className="mr-2" />
          Copy Comments
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handlePasteComments}
          className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
        >
          <FileText size={16} className="mr-2" />
          Paste Comments
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handlePrintComments}
          className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
        >
          <Printer size={16} className="mr-2" />
          Print Comments
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-600" />
        <DropdownMenuItem
          onClick={handleExportComments}
          className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
        >
          <Share size={16} className="mr-2" />
          Export Comments
        </DropdownMenuItem>
        <div className="px-2 py-1 text-xs text-gray-400 border-t border-gray-600 mt-1">
          Only visible comments, including filtered and searched, will be copied and exported.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
