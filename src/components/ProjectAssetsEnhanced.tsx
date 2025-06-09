
import { useState } from "react";
import { ArrowLeft, Plus, Upload, Folder, Lock, MoreHorizontal, Eye, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: string;
  status: 'Needs Review' | 'In Progress' | 'Approved';
  author: string;
  date: string;
  thumbnail?: string;
}

interface ProjectAssetsEnhancedProps {
  projectName: string;
  onBack: () => void;
  onStartFeedback: () => void;
}

export const ProjectAssetsEnhanced = ({ projectName, onBack, onStartFeedback }: ProjectAssetsEnhancedProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Sample asset data
  const [assets] = useState<Asset[]>([
    {
      id: '1',
      name: 'IMG_193458D1E9A5-1.jpeg',
      type: 'image',
      size: '519 kB',
      status: 'Needs Review',
      author: 'Yair Kivalko',
      date: 'Jun 09, 2025',
      thumbnail: '/lovable-uploads/848c43be-63ce-4bed-a3af-d20c27c57322.png'
    }
  ]);

  const statusOptions = [
    { value: '', label: 'All Status', color: '' },
    { value: 'Needs Review', label: 'Needs Review', color: 'bg-yellow-500' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'Approved', label: 'Approved', color: 'bg-green-500' }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesStatus = !selectedStatus || asset.status === selectedStatus;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Needs Review': return 'bg-yellow-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
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
                  <h1 className="text-xl font-semibold text-white">{projectName}</h1>
                  <p className="text-sm text-gray-400">0 Items</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Asset
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      <Folder className="h-4 w-4 mr-2" />
                      New Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      <Lock className="h-4 w-4 mr-2" />
                      New Restricted Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="container mx-auto px-4 py-8">
          <div 
            className={`border-2 border-dashed rounded-lg p-16 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              <h3 className="text-xl font-medium text-white mb-2">
                Drag files and folders to begin.
              </h3>
              
              <p className="text-gray-400 mb-6">
                Or use the upload button to add your assets
              </p>
              
              <div className="space-y-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Upload
                </Button>
                
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    console.log('Files selected:', files);
                  }}
                />
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-blue-400 hover:text-blue-300"
                    onClick={onStartFeedback}
                  >
                    Or start collecting feedback →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
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
                <h1 className="text-xl font-semibold text-white">{projectName}</h1>
                <p className="text-sm text-gray-400">{filteredAssets.length} Assets • 519 kB</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
              </Button>
              
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Search className="h-4 w-4 mr-2" />
              </Button>
              
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Appearance</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-300">Fields</span>
                <span className="text-xs text-gray-500">1 Visible</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-300">Sorted by</span>
                <span className="text-xs text-gray-500">Custom</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets content */}
      <div className="container mx-auto px-4 py-4">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="bg-gray-800 border-gray-700 mb-3">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {asset.thumbnail ? (
                    <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Folder className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{asset.name}</h3>
                  <p className="text-sm text-gray-400">{asset.author} • {asset.date}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300"
                      onClick={() => setShowStatusFilter(!showStatusFilter)}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(asset.status)}`} />
                      Status
                    </Button>
                    
                    {showStatusFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 min-w-[200px] z-10">
                        <Input
                          placeholder="Search options"
                          className="mb-2 bg-gray-700 border-gray-600"
                        />
                        <div className="space-y-1">
                          {statusOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`p-2 rounded cursor-pointer text-sm ${
                                asset.status === option.label ? 'bg-gray-700' : 'hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {option.color && <div className={`w-2 h-2 rounded-full ${option.color}`} />}
                                <span className="text-gray-300">{option.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Create Share Link
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Add to Share Links
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Copy Asset URL
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Copy to
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Move to
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-gray-700">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
