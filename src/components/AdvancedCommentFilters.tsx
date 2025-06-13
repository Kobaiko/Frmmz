
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, Search, Calendar as CalendarIcon, Users, Tag, Clock } from "lucide-react";

interface AdvancedCommentFiltersProps {
  onFilterChange: (filters: CommentFilters) => void;
}

export interface CommentFilters {
  search: string;
  author: string;
  status: string;
  dateRange: { from: Date | null; to: Date | null };
  tags: string[];
  type: string;
}

export const AdvancedCommentFilters = ({ onFilterChange }: AdvancedCommentFiltersProps) => {
  const [filters, setFilters] = useState<CommentFilters>({
    search: '',
    author: '',
    status: 'all',
    dateRange: { from: null, to: null },
    tags: [],
    type: 'all'
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (newFilters: Partial<CommentFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared: CommentFilters = {
      search: '',
      author: '',
      status: 'all',
      dateRange: { from: null, to: null },
      tags: [],
      type: 'all'
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = Object.values(filters).filter(value => {
    if (typeof value === 'string') return value !== '' && value !== 'all';
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return value.from || value.to;
    return false;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search comments..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="border-gray-600 text-gray-300"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-blue-600">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Author</label>
            <Select value={filters.author} onValueChange={(value) => updateFilters({ author: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="All authors" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All authors</SelectItem>
                <SelectItem value="john-doe">John Doe</SelectItem>
                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                <SelectItem value="mike-chen">Mike Chen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Type</label>
            <Select value={filters.type} onValueChange={(value) => updateFilters({ type: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="drawing">Drawings</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center col-span-full">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filters.dateRange.from || undefined,
                      to: filters.dateRange.to || undefined
                    }}
                    onSelect={(range) => updateFilters({ 
                      dateRange: { 
                        from: range?.from || null, 
                        to: range?.to || null 
                      } 
                    })}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={clearFilters} variant="ghost" size="sm" className="text-gray-400">
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
