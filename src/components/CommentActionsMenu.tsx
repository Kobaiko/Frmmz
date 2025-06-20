
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

interface CommentActionsMenuProps {
  comments: any[];
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
      return `${timestamp}${comment.author}: ${comment.text}`;
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
    toast({
      title: "Paste comments",
      description: "Paste functionality would be implemented here",
    });
    setIsOpen(false);
    onPasteComments?.();
  };

  const handlePrintComments = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const commentsHtml = comments.map(comment => {
        const timestamp = comment.timestamp !== -1 ? `[${Math.floor(comment.timestamp / 60)}:${Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}] ` : '';
        return `<div style="margin-bottom: 16px; padding: 12px; border: 1px solid #ccc;">
          <strong>${comment.author}</strong> ${timestamp}<br>
          <div style="margin-top: 8px;">${comment.text}</div>
        </div>`;
      }).join('');
      
      printWindow.document.write(`
        <html>
          <head><title>Comments</title></head>
          <body>
            <h1>Comments</h1>
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
      author: comment.author,
      content: comment.text,
      timestamp: comment.timestamp,
      createdAt: comment.createdAt,
      videoTime: comment.timestamp !== -1 ? `${Math.floor(comment.timestamp / 60)}:${Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}` : 'General'
    }));

    const csvContent = [
      'Author,Content,Video Time,Created At',
      ...commentsData.map(comment => 
        `"${comment.author}","${comment.content.replace(/"/g, '""')}","${comment.videoTime}","${comment.createdAt}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comments.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Comments exported",
      description: "Comments have been exported as CSV file",
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
        className="w-56 bg-gray-800 border-gray-600 text-white z-50" 
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
