
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit, CopyIcon, Trash2 } from "lucide-react";

interface CommentContextMenuProps {
  children: React.ReactNode;
  onEdit: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

export const CommentContextMenu = ({
  children,
  onEdit,
  onCopyLink,
  onDelete,
}: CommentContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-gray-800 border-gray-600 text-white">
        <ContextMenuItem 
          onClick={onEdit}
          className="hover:bg-gray-700 focus:bg-gray-700"
        >
          <Edit size={16} className="mr-2" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onCopyLink}
          className="hover:bg-gray-700 focus:bg-gray-700"
        >
          <CopyIcon size={16} className="mr-2" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-gray-600" />
        <ContextMenuItem 
          onClick={onDelete}
          className="hover:bg-red-600 focus:bg-red-600 text-red-400"
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
