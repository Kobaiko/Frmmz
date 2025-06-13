
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
  Users,
  FileVideo
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Asset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  thumbnail: string;
  duration?: string;
  fileSize: string;
  status: 'processing' | 'ready' | 'needs_review' | 'approved' | 'rejected';
  uploadedBy: string;
  uploadedAt: Date;
  lastModified: Date;
  comments: number;
  views: number;
  tags: string[];
  resolution?: string;
}

interface ProjectAssetsViewProps {
  projectName: string;
  onBack: () => void;
  onAssetOpen: (assetId: string) => void;
}

export const ProjectAssetsView = ({ 
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
    sortBy: 'lastModified',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Initial mock data
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Commercial_Final_V2.mp4',
      type: 'video' as const,
      thumbnail: '/placeholder.svg',
      duration: '2:34',
      fileSize: '245 MB',
      status: 'ready' as const,
      uploadedBy: 'John Doe',
      uploadedAt: new Date('2024-06-12'),
      lastModified: new Date('2024-06-12'),
      comments: 5,
      views: 23,
      tags: ['commercial', 'final'],
      resolution: '1920x1080'
    },
    {
      id: '2',
      name: 'Behind_Scenes.mp4',
      type: 'video' as const,
      thumbnail: '/placeholder.svg',
      duration: '5:12',
      fileSize: '512 MB',
      status: 'needs_review' as const,
      uploadedBy: 'Jane Smith',
      uploadedAt: new Date('2024-06-11'),
      lastModified: new Date('2024-06-11'),
      comments: 2,
      views: 8,
      tags: ['behind-scenes'],
      resolution: '1920x1080'
    }
  ]);

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

  const generateAssetId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (file: File): 'video' | 'image' | 'audio' | 'document' => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handleUpload = () => {
    console.log('🚀 Upload button clicked');
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'video/*,image/*,audio/*,application/*';
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      console.log('📁 Files selected for upload:', files);
      
      if (files.length === 0) return;

      // Process each file and add to assets
      files.forEach(file => {
        console.log(`- ${file.name} (${file.size} bytes, ${file.type})`);
        
        const newAsset: Asset = {
          id: generateAssetId(),
          name: file.name,
          type: getFileType(file),
          thumbnail: '/placeholder.svg',
          duration: file.type.startsWith('video/') ? '0:00' : undefined,
          fileSize: formatFileSize(file.size),
          status: 'processing',
          uploadedBy: 'Current User',
          uploadedAt: new Date(),
          lastModified: new Date(),
          comments: 0,
          views: 0,
          tags: [],
          resolution: file.type.startsWith('video/') ? '1920x1080' : undefined
        };

        // Add the new asset to the list
        setAssets(prev => [newAsset, ...prev]);

        // Simulate processing completion after 2 seconds
        setTimeout(() => {
          setAssets(prev => prev.map(asset => 
            asset.id === newAsset.id 
              ? { ...asset, status: 'ready' as const }
              : asset
          ));
        }, 2000);

        // Open the asset in the viewer after a short delay
        setTimeout(() => {
          console.log('📹 Opening uploaded asset in viewer:', newAsset.id);
          onAssetOpen(newAsset.id);
        }, 500);
      });
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
              <h1 className="text-3xl font-bold text-white mb-2">{projectName}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{assets.length} assets</span>
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
          availableUsers={['John Doe', 'Jane Smith', 'Mike Johnson', 'Current User']}
          availableTags={['commercial', 'final', 'behind-scenes']}
          totalAssets={assets.length}
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
