
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export type CommentType = 'all' | 'public' | 'internal';

interface CommentTypeFilterProps {
  selectedType: CommentType;
  onTypeChange: (type: CommentType) => void;
  commentCounts: {
    all: number;
    public: number;
    internal: number;
  };
}

export const CommentTypeFilter = ({
  selectedType,
  onTypeChange,
  commentCounts,
}: CommentTypeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const typeOptions = [
    { value: 'all' as CommentType, label: 'All comments', count: commentCounts.all },
    { value: 'public' as CommentType, label: 'Public comments', count: commentCounts.public },
    { value: 'internal' as CommentType, label: 'Internal comments', count: commentCounts.internal },
  ];

  const currentType = typeOptions.find(option => option.value === selectedType);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-white hover:bg-gray-700 justify-between w-full"
        >
          <span>{currentType?.label}</span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-600 text-white w-56" align="start">
        {typeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onTypeChange(option.value)}
            className="hover:bg-gray-700 focus:bg-gray-700 flex items-center justify-between"
          >
            <span>{option.label}</span>
            <span className="text-gray-400 text-sm">{option.count}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
