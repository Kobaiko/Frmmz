
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Play, 
  Download, 
  Share2, 
  MoreHorizontal, 
  Clock, 
  Eye,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Pause
} from "lucide-react";

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

interface AssetGridProps {
  assets: Asset[];
  viewMode: 'grid' | 'list';
  selectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
  onAssetOpen: (assetId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const AssetGrid = ({
  assets,
  viewMode,
  selectedAssets,
  onAssetSelect,
  onAssetOpen,
  onSelectAll,
  onClearSelection
}: AssetGridProps) => {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-600';
      case 'ready': return 'bg-blue-600';
      case 'needs_review': return 'bg-orange-600';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
    }
  };

  const getStatusIcon = (status: Asset['status']) => {
    switch (status) {
      case 'processing': return <Clock className="h-3 w-3" />;
      case 'ready': return <Eye className="h-3 w-3" />;
      case 'needs_review': return <AlertCircle className="h-3 w-3" />;
      case 'approved': return <CheckCircle2 className="h-3 w-3" />;
      case 'rejected': return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getFileTypeIcon = (type: Asset['type']) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'audio': return <Pause className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <Card 
      className={`bg-gray-800 border-gray-700 hover:border-pink-600 transition-all duration-200 cursor-pointer group ${
        selectedAssets.includes(asset.id) ? 'ring-2 ring-pink-600 bg-pink-900/20' : ''
      }`}
      onMouseEnter={() => setHoveredAsset(asset.id)}
      onMouseLeave={() => setHoveredAsset(null)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Thumbnail with overlay */}
          <div className="relative aspect-video bg-gray-700 rounded-lg overflow-hidden">
            <img 
              src={asset.thumbnail} 
              alt={asset.name}
              className="w-full h-full object-cover bg-gray-600"
            />
            
            {/* Selection checkbox */}
            <div className="absolute top-2 left-2">
              <Checkbox
                checked={selectedAssets.includes(asset.id)}
                onCheckedChange={() => onAssetSelect(asset.id)}
                className="bg-black/50 border-white"
              />
            </div>

            {/* Status badge */}
            <div className="absolute top-2 right-2">
              <Badge className={`${getStatusColor(asset.status)} text-white text-xs flex items-center space-x-1`}>
                {getStatusIcon(asset.status)}
                <span>{asset.status.replace('_', ' ')}</span>
              </Badge>
            </div>

            {/* Duration overlay */}
            {asset.duration && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {asset.duration}
              </div>
            )}

            {/* Hover overlay */}
            {hoveredAsset === asset.id && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Button
                  onClick={() => onAssetOpen(asset.id)}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            )}
          </div>

          {/* Asset info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-white font-medium text-sm truncate flex-1 mr-2">
                {asset.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{formatFileSize(asset.fileSize)}</span>
              {asset.resolution && <span>{asset.resolution}</span>}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{asset.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{asset.views}</span>
                </div>
              </div>
              <span>{formatTimeAgo(asset.lastModified)}</span>
            </div>

            {/* Tags */}
            {asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-gray-600 text-gray-400 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {asset.tags.length > 2 && (
                  <Badge
                    variant="outline"
                    className="border-gray-600 text-gray-400 text-xs"
                  >
                    +{asset.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                  {asset.uploadedBy.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AssetListItem = ({ asset }: { asset: Asset }) => (
    <Card 
      className={`bg-gray-800 border-gray-700 hover:border-pink-600 transition-all duration-200 cursor-pointer ${
        selectedAssets.includes(asset.id) ? 'ring-2 ring-pink-600 bg-pink-900/20' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Selection checkbox */}
          <Checkbox
            checked={selectedAssets.includes(asset.id)}
            onCheckedChange={() => onAssetSelect(asset.id)}
            className="flex-shrink-0"
          />

          {/* Thumbnail */}
          <div className="w-16 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0 relative">
            <img 
              src={asset.thumbnail} 
              alt={asset.name}
              className="w-full h-full object-cover bg-gray-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {getFileTypeIcon(asset.type)}
            </div>
          </div>

          {/* Asset info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-white font-medium truncate">{asset.name}</h3>
              <Badge className={`${getStatusColor(asset.status)} text-white text-xs flex items-center space-x-1`}>
                {getStatusIcon(asset.status)}
                <span>{asset.status.replace('_', ' ')}</span>
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>{formatFileSize(asset.fileSize)}</span>
              {asset.duration && <span>{asset.duration}</span>}
              {asset.resolution && <span>{asset.resolution}</span>}
              <span>{asset.comments} comments</span>
              <span>{asset.views} views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              onClick={() => onAssetOpen(asset.id)}
              size="sm"
              className="bg-pink-600 hover:bg-pink-700"
            >
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-400 mb-2">No assets found</h3>
        <p className="text-gray-500">Upload some assets or adjust your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection controls */}
      {selectedAssets.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              {selectedAssets.length} asset{selectedAssets.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-gray-400 hover:text-white"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assets display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <AssetListItem key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
};
