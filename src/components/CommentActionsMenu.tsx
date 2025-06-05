
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

interface CommentActionsMenuProps {
  onCopyComments: () => void;
  onPasteComments: () => void;
  onPrintComments: () => void;
  onExportComments: () => void;
}

export const CommentActionsMenu = ({
  onCopyComments,
  onPasteComments,
  onPrintComments,
  onExportComments,
}: CommentActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white" align="end">
        <DropdownMenuItem
          onClick={onCopyComments}
          className="hover:bg-gray-700 focus:bg-gray-700"
        >
          <Copy size={16} className="mr-2" />
          Copy Comments
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onPasteComments}
          className="hover:bg-gray-700 focus:bg-gray-700"
        >
          <FileText size={16} className="mr-2" />
          Paste Comments
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onPrintComments}
          className="hover:bg-gray-700 focus:bg-gray-700"
        >
          <Printer size={16} className="mr-2" />
          Print Comments
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-600" />
        <DropdownMenuItem
          onClick={onExportComments}
          className="hover:bg-gray-700 focus:bg-gray-700"
        >
          <Share size={16} className="mr-2" />
          Export Comments
        </DropdownMenuItem>
        <div className="px-2 py-1 text-xs text-gray-400">
          Only visible comments, including filtered and searched, will be copied and exported.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
