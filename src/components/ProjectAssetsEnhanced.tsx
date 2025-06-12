
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid3X3,
  List,
  Search,
  Filter,
  Upload,
  Folder,
  Video,
  Image,
  FileText,
  Music,
  Clock,
  User,
  Tag,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  Download,
  Share,
  MoreHorizontal
} from "lucide-react";

export interface Asset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  size: number;
  duration?: number;
  resolution?: string;
  format: string;
  uploadedBy: string;
  uploadedAt: Date;
  modifiedAt: Date;
  tags: string[];
  status: 'processing' | 'ready' | 'error';
  thumbnail?: string;
  path: string;
  metadata?: any;
}

interface ProjectAssetsEnhancedProps {
  projectId: string;
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  onUpload: () => void;
}

export const ProjectAssetsEnhanced = ({ projectId, assets, onAssetSelect, onUpload }: ProjectAssetsEnhancedProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-400" />;
      case 'image': return <Image className="h-4 w-4 text-green-400" />;
      case 'audio': return <Music className="h-4 w-4 text-purple-400" />;
      case 'document': return <FileText className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-600';
      case 'ready': return 'bg-green-600';
      case 'error': return 'bg-red-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredAssets = assets
    .filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || asset.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'uploadedAt':
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const assetCounts = {
    all: assets.length,
    video: assets.filter(a => a.type === 'video').length,
    image: assets.filter(a => a.type === 'image').length,
    audio: assets.filter(a => a.type === 'audio').length,
    document: assets.filter(a => a.type === 'document').length
  };

  const handleAssetSelect = (assetId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedAssets(prev => 
        prev.includes(assetId) 
          ? prev.filter(id => id !== assetId)
          : [...prev, assetId]
      );
    } else {
      const asset = assets.find(a => a.id === assetId);
      if (asset) onAssetSelect(asset);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Assets</h2>
          <p className="text-gray-400">{filteredAssets.length} of {assets.length} assets</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onUpload} className="bg-pink-600 hover:bg-pink-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Assets
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 relative min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="document">Document</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="uploadedAt">Date</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border-gray-600"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-pink-600' : 'border-gray-600'}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-pink-600' : 'border-gray-600'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Asset Type Tabs */}
      <div className="flex space-x-1">
        {Object.entries(assetCounts).map(([type, count]) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type)}
            className={selectedType === type ? 'bg-pink-600' : 'border-gray-600 text-gray-300'}
          >
            {getAssetIcon(type as Asset['type'])}
            <span className="ml-2 capitalize">{type}</span>
            <Badge variant="secondary" className="ml-2 bg-gray-600 text-gray-300">
              {count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Assets Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => (
            <Card 
              key={asset.id} 
              className="bg-gray-800 border-gray-700 hover:border-pink-500 transition-colors cursor-pointer"
              onClick={() => handleAssetSelect(asset.id)}
            >
              <CardContent className="p-3">
                <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center relative">
                  {asset.thumbnail ? (
                    <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover rounded" />
                  ) : (
                    getAssetIcon(asset.type)
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                  
                  {asset.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                      {formatDuration(asset.duration)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-white text-sm font-medium truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {formatFileSize(asset.size)}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{asset.uploadedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map((asset) => (
            <Card 
              key={asset.id} 
              className="bg-gray-800 border-gray-700 hover:border-pink-500 transition-colors cursor-pointer"
              onClick={() => handleAssetSelect(asset.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                    {asset.thumbnail ? (
                      <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      getAssetIcon(asset.type)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium truncate">{asset.name}</p>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span>{formatFileSize(asset.size)}</span>
                      {asset.duration && <span>{formatDuration(asset.duration)}</span>}
                      {asset.resolution && <span>{asset.resolution}</span>}
                      <span>{asset.format.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{asset.uploadedBy}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{asset.uploadedAt.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {asset.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400">No assets found</h3>
          <p className="text-gray-500">Upload your first asset or adjust your filters</p>
          <Button onClick={onUpload} className="mt-4 bg-pink-600 hover:bg-pink-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Assets
          </Button>
        </div>
      )}
    </div>
  );
};
