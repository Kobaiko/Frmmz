
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ChevronDown, ChevronRight, Hash, User } from "lucide-react";

export interface CommentFilters {
  annotations: boolean;
  attachments: boolean;
  completed: boolean;
  incomplete: boolean;
  unread: boolean;
  mentionsAndReactions: boolean;
}

interface CommentFilterMenuProps {
  filters: CommentFilters;
  onFiltersChange: (filters: CommentFilters) => void;
  onClearFilters: () => void;
}

export const CommentFilterMenu = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: CommentFilterMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof CommentFilters, value: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Filter size={16} />
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full ml-1" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-gray-800 border-gray-600 text-white p-0" align="start">
        <div className="p-4">
          <div className="text-sm font-medium mb-3 text-gray-300">Filter by...</div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="annotations"
                checked={filters.annotations}
                onCheckedChange={(checked) => 
                  handleFilterChange('annotations', checked as boolean)
                }
                className="border-gray-500"
              />
              <label htmlFor="annotations" className="text-sm cursor-pointer flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                Annotations
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="attachments"
                checked={filters.attachments}
                onCheckedChange={(checked) => 
                  handleFilterChange('attachments', checked as boolean)
                }
                className="border-gray-500"
              />
              <label htmlFor="attachments" className="text-sm cursor-pointer flex items-center">
                <div className="w-4 h-4 bg-gray-500 rounded mr-2 flex items-center justify-center">
                  <div className="w-2 h-1 bg-white rounded-sm" />
                </div>
                Attachments
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={filters.completed}
                onCheckedChange={(checked) => 
                  handleFilterChange('completed', checked as boolean)
                }
                className="border-gray-500"
              />
              <label htmlFor="completed" className="text-sm cursor-pointer flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                  <div className="w-2 h-1 bg-white rounded-sm transform rotate-45" />
                </div>
                Completed
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incomplete"
                checked={filters.incomplete}
                onCheckedChange={(checked) => 
                  handleFilterChange('incomplete', checked as boolean)
                }
                className="border-gray-500"
              />
              <label htmlFor="incomplete" className="text-sm cursor-pointer flex items-center">
                <div className="w-4 h-4 border-2 border-gray-500 rounded-full mr-2" />
                Incomplete
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="unread"
                checked={filters.unread}
                onCheckedChange={(checked) => 
                  handleFilterChange('unread', checked as boolean)
                }
                className="border-gray-500"
              />
              <label htmlFor="unread" className="text-sm cursor-pointer flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2" />
                Unread
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mentionsAndReactions"
                checked={filters.mentionsAndReactions}
                onCheckedChange={(checked) => 
                  handleFilterChange('mentionsAndReactions', checked as boolean)
                }
                className="border-gray-500"
              />
              <label htmlFor="mentionsAndReactions" className="text-sm cursor-pointer flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-2 flex items-center justify-center">
                  <span className="text-xs text-white">@</span>
                </div>
                Mentions and reactions
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm text-gray-300">
                <Hash size={14} className="mr-1" />
                Hashtag
              </div>
              <ChevronRight size={14} className="text-gray-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-300">
                <User size={14} className="mr-1" />
                Person
              </div>
              <ChevronRight size={14} className="text-gray-500" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="w-full text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
