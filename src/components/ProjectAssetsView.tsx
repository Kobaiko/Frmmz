
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetGrid } from "./AssetGrid";
import { AssetFilters } from "./AssetFilters";
import { useAssets } from "@/hooks/useAssets";
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Grid3X3, 
  List, 
  Share2,
  Users,
  FileVideo
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectAssetsViewProps {
  projectId: string;
  projectName: string;
  onBack: () => void;
  onAssetOpen: (assetId: string) => void;
}

export const ProjectAssetsView = ({ 
  projectId,
  projectName, 
  onBack, 
  onAssetOpen 
}: ProjectAssetsViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    fileTypes: [],
    status: [],
    uploadedBy: [],
    tags: [],
    dateRange: {},
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const { assets, loading, uploadAsset } = useAssets(projectId);

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAssets(filteredAssets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'video/*,image/*,audio/*,application/*';
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      for (const file of files) {
        const asset = await uploadAsset(file, projectId);
        if (asset) {
          // Open the first uploaded asset in the viewer
          setTimeout(() => {
            onAssetOpen(asset.id);
          }, 500);
        }
      }
    };
    
    input.click();
  };

  const handleCreateFolder = () => {
    console.log('📁 Create folder clicked');
    // TODO: Implement folder creation
  };

  const handleRecordVideo = () => {
    console.log('🎥 Record video clicked');
    // TODO: Implement video recording
  };

  const filteredAssets = assets.filter(asset => {
    if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.fileTypes.length > 0 && !filters.fileTypes.includes(asset.file_type)) {
      return false;
    }
    
    if (filters.status.length > 0 && !filters.status.includes(asset.status)) {
      return false;
    }
    
    return true;
  });

  // Convert Supabase assets to AssetGrid format with proper type casting
  const gridAssets = filteredAssets.map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.file_type as "video" | "image" | "audio" | "document",
    thumbnail: asset.thumbnail_url || '/placeholder.svg',
    duration: asset.duration,
    fileSize: `${Math.round(asset.file_size / 1024 / 1024)} MB`,
    status: asset.status as "processing" | "ready" | "needs_review" | "approved" | "rejected",
    uploadedBy: 'User', // TODO: Get from user profile
    uploadedAt: new Date(asset.created_at),
    lastModified: new Date(asset.updated_at),
    comments: 0, // TODO: Get from comments count
    views: 0, // TODO: Implement views tracking
    tags: [], // TODO: Implement tags
    resolution: asset.resolution
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileVideo className="h-5 w-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-400">Loading project assets...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-white mb-2">{projectName}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{assets.length} assets</span>
                <span>•</span>
                <span>Last updated {new Date().toLocaleString()}</span>
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
                className={`rounded-none ${viewMode === 'grid' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-none ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Project
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assets
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 z-50">
                <DropdownMenuItem 
                  onClick={handleUpload}
                  className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleRecordVideo}
                  className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                >
                  <FileVideo className="h-4 w-4 mr-2" />
                  Record Video
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleCreateFolder}
                  className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <AssetFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableUsers={['User']} // TODO: Get from project collaborators
          availableTags={[]} // TODO: Get from asset tags
          totalAssets={assets.length}
          filteredAssets={filteredAssets.length}
        />
      </div>

      {/* Assets content */}
      <div className="p-6">
        <AssetGrid
          assets={gridAssets}
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
