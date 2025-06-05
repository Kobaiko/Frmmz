
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";

export type SortOption = 'timecode' | 'oldest' | 'newest' | 'commenter' | 'completed';

interface CommentSortMenuProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const CommentSortMenu = ({
  sortBy,
  onSortChange,
}: CommentSortMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'timecode' as SortOption, label: 'Timecode (Default)' },
    { value: 'oldest' as SortOption, label: 'Oldest' },
    { value: 'newest' as SortOption, label: 'Newest' },
    { value: 'commenter' as SortOption, label: 'Commenter' },
    { value: 'completed' as SortOption, label: 'Completed' },
  ];

  const currentSort = sortOptions.find(option => option.value === sortBy);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-700 text-xs"
        >
          Sort thread by...
          <ChevronDown size={14} className="ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white" align="start">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className="hover:bg-gray-700 focus:bg-gray-700 flex items-center justify-between"
          >
            <span className="text-sm">{option.label}</span>
            {sortBy === option.value && <Check size={14} className="text-blue-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
