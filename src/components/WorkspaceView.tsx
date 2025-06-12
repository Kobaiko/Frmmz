import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Users,
  Clock,
  Video,
  Folder,
  SortAsc,
  SortDesc,
  Calendar
} from "lucide-react";
import { RealtimePresence } from "./RealtimePresence";
import { EnhancedProjectCreation } from "./EnhancedProjectCreation";

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  thumbnail: string;
  assetsCount: number;
  collaborators: number;
  lastActivity: Date;
  totalDuration: string;
}

interface WorkspaceViewProps {
  onOpenProject: (projectId: string) => void;
}

export const WorkspaceView = ({ onOpenProject }: WorkspaceViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'demo',
      name: 'Summer Campaign 2024',
      description: 'Product launch video series for Q3 marketing campaign',
      status: 'active',
      thumbnail: '/placeholder.svg',
      assetsCount: 24,
      collaborators: 6,
      lastActivity: new Date('2024-06-12'),
      totalDuration: '12:34'
    },
    {
      id: 'first',
      name: "Yair's First Project",
      description: 'Initial project setup and testing workflows',
      status: 'active',
      thumbnail: '/placeholder.svg',
      assetsCount: 8,
      collaborators: 3,
      lastActivity: new Date('2024-06-11'),
      totalDuration: '5:22'
    },
    {
      id: 'untitled',
      name: 'Client Presentation',
      description: 'Quarterly review materials for stakeholder meeting',
      status: 'completed',
      thumbnail: '/placeholder.svg',
      assetsCount: 12,
      collaborators: 4,
      lastActivity: new Date('2024-06-09'),
      totalDuration: '8:15'
    }
  ]);

  const handleCreateProject = (newProject: any) => {
    setProjects([newProject, ...projects]);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'archived': return 'bg-gray-600';
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastActivity':
          comparison = a.lastActivity.getTime() - b.lastActivity.getTime();
          break;
        case 'assetsCount':
          comparison = a.assetsCount - b.assetsCount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card 
      className="bg-gray-800 border-gray-700 hover:border-pink-600 transition-all duration-200 cursor-pointer group"
      onClick={() => onOpenProject(project.id)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Thumbnail */}
          <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden relative">
            <img 
              src={project.thumbnail} 
              alt={project.name}
              className="w-full h-full object-cover bg-gray-600"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute top-3 right-3">
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {project.status}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
              {project.totalDuration}
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-pink-400 transition-colors">
                {project.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">
                {project.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Video className="h-4 w-4" />
                  <span>{project.assetsCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{project.collaborators}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{project.lastActivity.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectListItem = ({ project }: { project: Project }) => (
    <Card 
      className="bg-gray-800 border-gray-700 hover:border-pink-600 transition-all duration-200 cursor-pointer"
      onClick={() => onOpenProject(project.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="w-20 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0 relative">
            <img 
              src={project.thumbnail} 
              alt={project.name}
              className="w-full h-full object-cover bg-gray-600"
            />
          </div>

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-white font-medium truncate">{project.name}</h3>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {project.status}
              </Badge>
            </div>
            <p className="text-gray-400 text-sm truncate mb-2">
              {project.description}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{project.assetsCount} assets</span>
              <span>{project.collaborators} collaborators</span>
              <span>{project.totalDuration}</span>
            </div>
          </div>

          {/* Last Activity */}
          <div className="text-right text-sm text-gray-400 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{project.lastActivity.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-gray-400">Manage your creative projects and assets</p>
          </div>
          <div className="flex items-center space-x-4">
            <RealtimePresence projectId="workspace" currentUserId="current-user" />
            <EnhancedProjectCreation onCreateProject={handleCreateProject} />
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="lastActivity">Last Activity</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="assetsCount">Assets Count</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          {/* View Toggle */}
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
        </div>
      </div>

      {/* Projects Display */}
      <div className="p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">Create your first project or adjust your filters</p>
            <EnhancedProjectCreation onCreateProject={handleCreateProject} />
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>

            {/* Projects Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <ProjectListItem key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
