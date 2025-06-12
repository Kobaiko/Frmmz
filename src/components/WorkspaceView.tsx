
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  Play,
  Clock,
  Users,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Star,
  Eye
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  duration?: string;
  thumbnail: string;
  status: 'needs-review' | 'in-progress' | 'approved' | 'final';
  comments: number;
  lastModified: Date;
  collaborators: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  assets: Asset[];
  collaborators: number;
  lastActivity: Date;
}

export const WorkspaceView = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      id: '1',
      name: 'Summer Campaign 2024',
      description: 'Product launch video series for Q3 marketing',
      status: 'active',
      assets: [
        {
          id: 'a1',
          name: 'Hero Video Final.mp4',
          type: 'video',
          duration: '2:34',
          thumbnail: '/placeholder.svg',
          status: 'approved',
          comments: 8,
          lastModified: new Date('2024-06-10'),
          collaborators: ['user1', 'user2']
        },
        {
          id: 'a2',
          name: 'Product Demo.mp4',
          type: 'video',
          duration: '1:45',
          thumbnail: '/placeholder.svg',
          status: 'needs-review',
          comments: 3,
          lastModified: new Date('2024-06-11'),
          collaborators: ['user1']
        }
      ],
      collaborators: 6,
      lastActivity: new Date('2024-06-12')
    },
    {
      id: '2',
      name: 'Client Presentation',
      description: 'Quarterly review materials for stakeholder meeting',
      status: 'active',
      assets: [
        {
          id: 'a3',
          name: 'Q2 Results.mp4',
          type: 'video',
          duration: '5:12',
          thumbnail: '/placeholder.svg',
          status: 'in-progress',
          comments: 12,
          lastModified: new Date('2024-06-09'),
          collaborators: ['user1', 'user2', 'user3']
        }
      ],
      collaborators: 4,
      lastActivity: new Date('2024-06-11')
    }
  ];

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'needs-review': return 'bg-yellow-600';
      case 'in-progress': return 'bg-blue-600';
      case 'approved': return 'bg-green-600';
      case 'final': return 'bg-purple-600';
    }
  };

  const AssetCard = ({ asset }: { asset: Asset }) => (
    <Card className="bg-gray-800 border-gray-700 hover:border-pink-600 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <img 
            src={asset.thumbnail} 
            alt={asset.name}
            className="w-full h-32 object-cover rounded bg-gray-700"
          />
          {asset.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-8 w-8 text-white/80" />
            </div>
          )}
          {asset.duration && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              {asset.duration}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium text-sm truncate">{asset.name}</h4>
            <Badge className={`${getStatusColor(asset.status)} text-white text-xs`}>
              {asset.status.replace('-', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{asset.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{asset.collaborators.length}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{asset.lastModified.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Workspace</h1>
            <p className="text-gray-400">Manage your projects and assets</p>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800 p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">Projects</h3>
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedProject?.id === project.id 
                      ? 'bg-pink-600/20 border border-pink-600' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium text-sm">{project.name}</h4>
                      <p className="text-gray-400 text-xs">{project.assets.length} assets</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{project.collaborators}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                  <p className="text-gray-400">{selectedProject.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="border-gray-600 text-gray-300"
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Total Assets</p>
                        <p className="text-xl font-bold text-white">{selectedProject.assets.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Comments</p>
                        <p className="text-xl font-bold text-white">
                          {selectedProject.assets.reduce((sum, asset) => sum + asset.comments, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Collaborators</p>
                        <p className="text-xl font-bold text-white">{selectedProject.collaborators}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-400">Last Activity</p>
                        <p className="text-sm font-bold text-white">
                          {selectedProject.lastActivity.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assets Grid */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                : 'space-y-2'
              }>
                {selectedProject.assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-400 mb-2">Select a project</h3>
                <p className="text-gray-500">Choose a project from the sidebar to view its assets</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
