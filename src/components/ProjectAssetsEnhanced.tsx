import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetGrid } from "./AssetGrid";
import { AssetFilters } from "./AssetFilters";
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Grid3X3, 
  List, 
  Share2,
  Settings,
  Users
} from "lucide-react";

interface ProjectAssetsEnhancedProps {
  projectId: string;
  onBack: () => void;
  onStartFeedback: () => void;
  onAssetOpen?: (assetId: string) => void;
}

export const ProjectAssetsEnhanced = ({ 
  projectId, 
  onBack, 
  onStartFeedback,
  onAssetOpen = () => {}
}: ProjectAssetsEnhancedProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    fileTypes: [],
    status: [],
    uploadedBy: [],
    tags: [],
    dateRange: {},
    sortBy: 'lastModified',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Mock data - in real app this would come from API
  const mockAssets = [
    {
      id: '1',
      name: 'hero_video_final_v3.mp4',
      type: 'video' as const,
      thumbnail: '/placeholder.svg',
      duration: '2:34',
      fileSize: '524 MB',
      status: 'approved' as const,
      uploadedBy: 'Alex Chen',
      uploadedAt: new Date('2024-06-12'),
      lastModified: new Date('2024-06-12'),
      comments: 8,
      views: 23,
      tags: ['hero', 'final', 'approved'],
      resolution: '4K'
    },
    {
      id: '2',
      name: 'product_demo_rough_cut.mov',
      type: 'video' as const,
      thumbnail: '/placeholder.svg',
      duration: '1:45',
      fileSize: '156 MB',
      status: 'needs_review' as const,
      uploadedBy: 'Sarah Kim',
      uploadedAt: new Date('2024-06-11'),
      lastModified: new Date('2024-06-11'),
      comments: 3,
      views: 12,
      tags: ['demo', 'rough'],
      resolution: '1080p'
    },
    {
      id: '3',
      name: 'background_music_v1.mp3',
      type: 'audio' as const,
      thumbnail: '/placeholder.svg',
      fileSize: '12 MB',
      status: 'ready' as const,
      uploadedBy: 'Mike Johnson',
      uploadedAt: new Date('2024-06-10'),
      lastModified: new Date('2024-06-10'),
      comments: 1,
      views: 8,
      tags: ['music', 'background']
    }
  ];

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAssets(mockAssets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  const filteredAssets = mockAssets.filter(asset => {
    // Apply search filter
    if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Apply file type filter
    if (filters.fileTypes.length > 0 && !filters.fileTypes.includes(asset.type)) {
      return false;
    }
    
    // Apply status filter
    if (filters.status.length > 0 && !filters.status.includes(asset.status)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{projectId}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{mockAssets.length} assets</span>
                <span>•</span>
                <span>Last updated 2 hours ago</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>6 collaborators</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View toggle */}
            <div className="flex rounded-lg border border-gray-700 overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-none ${viewMode === 'grid' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-none ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Project
            </Button>
            
            <Button className="bg-pink-600 hover:bg-pink-700" onClick={onStartFeedback}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Assets
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AssetFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableUsers={['Alex Chen', 'Sarah Kim', 'Mike Johnson']}
          availableTags={['hero', 'final', 'approved', 'demo', 'rough', 'music', 'background']}
          totalAssets={mockAssets.length}
          filteredAssets={filteredAssets.length}
        />
      </div>

      {/* Assets content */}
      <div className="p-6">
        <AssetGrid
          assets={filteredAssets}
          viewMode={viewMode}
          selectedAssets={selectedAssets}
          onAssetSelect={handleAssetSelect}
          onAssetOpen={onAssetOpen}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
        />
      </div>
    </div>
  );
};
