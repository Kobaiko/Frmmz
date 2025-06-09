
import { useState } from "react";
import { Grid, List, Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";

interface Project {
  id: string;
  name: string;
  size: string;
  thumbnail?: string;
}

interface WorkspaceViewProps {
  onOpenProject: (projectId: string) => void;
}

export const WorkspaceView = ({ onOpenProject }: WorkspaceViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active Projects');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Sample projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'demo',
      name: 'Demo Project',
      size: '1.05 MB',
    },
    {
      id: 'first',
      name: "Yair's First Project",
      size: '0 MB',
    }
  ]);

  const filterOptions = ['All Projects', 'Active Projects', 'Inactive Projects'];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new project placeholder
  const allItems = [
    { id: 'new', name: 'New Project', size: '', isNewProject: true },
    ...filteredProjects
  ];

  const handleCreateProject = (name: string, template: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      size: '0 MB'
    };
    setProjects([...projects, newProject]);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex-1">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Yair's Workspace</h1>
              <p className="text-gray-400">{projects.length} Projects</p>
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtered by: {activeFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option}
                      className="text-gray-300 hover:bg-gray-700"
                      onClick={() => setActiveFilter(option)}
                    >
                      {option}
                      {activeFilter === option && <span className="ml-auto text-blue-400">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <span className="text-sm text-gray-400">Sorted by: Name</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allItems.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenProject={project.id === 'new' ? () => setShowCreateDialog(true) : onOpenProject}
                onDeleteProject={(id) => console.log('Delete project:', id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {allItems.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 cursor-pointer"
                onClick={() => project.id === 'new' ? setShowCreateDialog(true) : onOpenProject(project.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded"></div>
                  <div>
                    <h3 className="text-white font-medium">{project.name}</h3>
                    <p className="text-gray-400 text-sm">{project.size}</p>
                  </div>
                </div>
                {!project.isNewProject && (
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};
