
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Tag,
  User,
  FileType,
  Clock,
  SortAsc,
  SortDesc
} from "lucide-react";

interface FilterState {
  search: string;
  fileTypes: string[];
  status: string[];
  uploadedBy: string[];
  tags: string[];
  dateRange: { from?: Date; to?: Date };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AssetFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableUsers: string[];
  availableTags: string[];
  totalAssets: number;
  filteredAssets: number;
}

export const AssetFilters = ({
  filters,
  onFiltersChange,
  availableUsers,
  availableTags,
  totalAssets,
  filteredAssets
}: AssetFiltersProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const fileTypes = [
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
    { id: 'document', label: 'Document', icon: '📄' }
  ];

  const statusOptions = [
    { id: 'processing', label: 'Processing', color: 'bg-yellow-600' },
    { id: 'ready', label: 'Ready', color: 'bg-blue-600' },
    { id: 'needs_review', label: 'Needs Review', color: 'bg-orange-600' },
    { id: 'approved', label: 'Approved', color: 'bg-green-600' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-600' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'uploadedAt', label: 'Upload Date' },
    { value: 'lastModified', label: 'Last Modified' },
    { value: 'fileSize', label: 'File Size' },
    { value: 'duration', label: 'Duration' }
  ];

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      fileTypes: [],
      status: [],
      uploadedBy: [],
      tags: [],
      dateRange: {},
      sortBy: 'lastModified',
      sortOrder: 'desc'
    });
    setActiveFilters([]);
  };

  const removeFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'search':
        updateFilters({ search: '' });
        break;
      case 'fileTypes':
        updateFilters({ fileTypes: filters.fileTypes.filter(t => t !== value) });
        break;
      case 'status':
        updateFilters({ status: filters.status.filter(s => s !== value) });
        break;
      case 'uploadedBy':
        updateFilters({ uploadedBy: filters.uploadedBy.filter(u => u !== value) });
        break;
      case 'tags':
        updateFilters({ tags: filters.tags.filter(t => t !== value) });
        break;
      case 'dateRange':
        updateFilters({ dateRange: {} });
        break;
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    count += filters.fileTypes.length;
    count += filters.status.length;
    count += filters.uploadedBy.length;
    count += filters.tags.length;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search and primary filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        {/* File Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <FileType className="h-4 w-4 mr-2" />
              File Type
              {filters.fileTypes.length > 0 && (
                <Badge className="ml-2 bg-pink-600 text-white">
                  {filters.fileTypes.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-gray-800 border-gray-700 p-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium">File Types</h4>
              {fileTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={filters.fileTypes.includes(type.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ fileTypes: [...filters.fileTypes, type.id] });
                      } else {
                        updateFilters({ fileTypes: filters.fileTypes.filter(t => t !== type.id) });
                      }
                    }}
                  />
                  <label htmlFor={type.id} className="text-gray-300 cursor-pointer flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Status
              {filters.status.length > 0 && (
                <Badge className="ml-2 bg-pink-600 text-white">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-gray-800 border-gray-700 p-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium">Status</h4>
              {statusOptions.map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={status.id}
                    checked={filters.status.includes(status.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ status: [...filters.status, status.id] });
                      } else {
                        updateFilters({ status: filters.status.filter(s => s !== status.id) });
                      }
                    }}
                  />
                  <label htmlFor={status.id} className="text-gray-300 cursor-pointer flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span>{status.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
          className="border-gray-600 text-gray-300 hover:text-white"
        >
          {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>

        {/* Clear filters */}
        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white"
          >
            Clear all ({getActiveFilterCount()})
          </Button>
        )}
      </div>

      {/* Active filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge className="bg-gray-700 text-gray-300 pr-1">
              Search: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-gray-600"
                onClick={() => removeFilter('search')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.fileTypes.map((type) => (
            <Badge key={type} className="bg-gray-700 text-gray-300 pr-1">
              Type: {type}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-gray-600"
                onClick={() => removeFilter('fileTypes', type)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.status.map((status) => (
            <Badge key={status} className="bg-gray-700 text-gray-300 pr-1">
              Status: {status.replace('_', ' ')}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-gray-600"
                onClick={() => removeFilter('status', status)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results summary */}
      <div className="text-sm text-gray-400">
        Showing {filteredAssets} of {totalAssets} assets
        {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''} applied)`}
      </div>
    </div>
  );
};
