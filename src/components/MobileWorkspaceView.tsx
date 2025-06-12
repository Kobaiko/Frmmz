
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Grid3X3, 
  List, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Users,
  Clock,
  Folder,
  Play,
  Upload,
  Share2,
  Settings,
  Bell
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface MobileProject {
  id: string;
  name: string;
  thumbnail?: string;
  status: 'active' | 'completed' | 'on-hold';
  lastActivity: string;
  collaborators: number;
  assetsCount: number;
}

interface MobileWorkspaceViewProps {
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
  projects: MobileProject[];
}

export const MobileWorkspaceView = ({ 
  onProjectSelect, 
  onCreateProject,
  projects = [] 
}: MobileWorkspaceViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const sampleProjects: MobileProject[] = [
    {
      id: '1',
      name: 'Demo Project',
      status: 'active',
      lastActivity: '2 hours ago',
      collaborators: 3,
      assetsCount: 12
    },
    {
      id: '2',
      name: 'Client Review',
      status: 'on-hold',
      lastActivity: '1 day ago',
      collaborators: 5,
      assetsCount: 8
    }
  ];

  const displayProjects = projects.length > 0 ? projects : sampleProjects;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'on-hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredProjects = displayProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 pb-safe">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white">Workspace</h1>
            <p className="text-sm text-gray-400">{filteredProjects.length} projects</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-400 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={onCreateProject}
            className="bg-pink-600 hover:bg-pink-700"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {displayProjects.filter(p => p.status === 'active').length}
            </p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {displayProjects.reduce((sum, p) => sum + p.collaborators, 0)}
            </p>
            <p className="text-xs text-gray-400">Team Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {displayProjects.reduce((sum, p) => sum + p.assetsCount, 0)}
            </p>
            <p className="text-xs text-gray-400">Assets</p>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">New comment on Demo Project</p>
                <p className="text-gray-400 text-xs">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Project approved</p>
                <p className="text-gray-400 text-xs">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id}
                className="bg-gray-800 border-gray-700 cursor-pointer"
                onClick={() => onProjectSelect(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium text-sm">{project.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                      </div>
                      <p className="text-gray-400 text-xs">{project.lastActivity}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Play className="h-8 w-8 text-gray-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{project.collaborators}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Folder className="h-3 w-3" />
                        <span>{project.assetsCount}</span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(project.status)} text-white`} variant="default">
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id}
                className="bg-gray-800 border-gray-700 cursor-pointer"
                onClick={() => onProjectSelect(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Play className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium text-sm truncate">{project.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{project.lastActivity}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{project.collaborators}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-gray-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 px-4">
          <Folder className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">Create your first project to get started</p>
          <Button onClick={onCreateProject} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}

      {/* Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 pb-safe">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex-col space-y-1 text-gray-400">
            <Folder className="h-5 w-5" />
            <span className="text-xs">Projects</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1 text-gray-400">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Upload</span>
          </Button>
          <Button 
            onClick={onCreateProject}
            className="bg-pink-600 hover:bg-pink-700 rounded-full w-12 h-12 p-0"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1 text-gray-400">
            <Share2 className="h-5 w-5" />
            <span className="text-xs">Share</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1 text-gray-400">
            <Users className="h-5 w-5" />
            <span className="text-xs">Team</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
