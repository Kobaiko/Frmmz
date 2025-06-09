import { useState } from "react";
import { Grid, List, Filter, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { WorkspaceSettingsDialog } from "./WorkspaceSettingsDialog";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  size: string;
  thumbnail?: string;
  isNewProject?: boolean;
}

interface WorkspaceViewProps {
  onOpenProject: (projectId: string) => void;
}

export const WorkspaceView = ({
  onOpenProject
}: WorkspaceViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState('Active Projects');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Yair's Workspace");
  const [projectNotifications, setProjectNotifications] = useState(true);

  // Sample projects data
  const [projects, setProjects] = useState<Project[]>([{
    id: 'demo',
    name: 'Demo Project',
    size: '1.05 MB'
  }, {
    id: 'untitled',
    name: 'Untitled Project',
    size: '0 MB'
  }, {
    id: 'first',
    name: "Yair's First Project",
    size: '519 KB'
  }]);
  const filterOptions = ['All Projects', 'Active Projects', 'Inactive Projects'];

  // Add new project placeholder
  const allItems = [...projects, {
    id: 'new',
    name: 'New Project',
    size: '',
    isNewProject: true
  }];
  const handleCreateProject = (name: string, template: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      size: '0 MB'
    };
    setProjects([...projects, newProject]);
    toast({
      title: "Project created",
      description: `${name} has been created successfully.`
    });
  };
  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast({
      title: "Project deleted",
      description: "Project has been deleted successfully."
    });
  };
  const handleDuplicateProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const duplicatedProject: Project = {
        ...project,
        id: Math.random().toString(36).substr(2, 9),
        name: `${project.name} (Copy)`
      };
      setProjects([...projects, duplicatedProject]);
      toast({
        title: "Project duplicated",
        description: `${project.name} has been duplicated.`
      });
    }
  };
  const handleRenameProject = (projectId: string, newName: string) => {
    setProjects(projects.map(p => p.id === projectId ? {
      ...p,
      name: newName
    } : p));
    toast({
      title: "Project renamed",
      description: `Project has been renamed to ${newName}.`
    });
  };
  return <div className="min-h-screen bg-gray-900 flex-1">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{workspaceName}</h1>
              <p className="text-gray-400">{projects.length} Projects</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-64">
                  <div className="px-3 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">Workspace</p>
                  </div>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setProjectNotifications(!projectNotifications)}
                  >
                    <span className="mr-2">🔔</span>
                    Project Notifications
                    <div className="ml-auto">
                      <div className={`w-4 h-4 rounded-full ${projectNotifications ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowSettingsDialog(true)}
                  >
                    <span className="mr-2">⚙️</span>
                    Workspace Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-600" />
                  <DropdownMenuItem className="text-red-400 hover:bg-gray-700">
                    <span className="mr-2">🗑️</span>
                    Delete
                  </DropdownMenuItem>
                  <div className="px-3 py-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">You must have at least one workspace</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 w-8 p-0 text-white">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 w-8 p-0 text-white">
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtered by: {activeFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {filterOptions.map(option => 
                    <DropdownMenuItem 
                      key={option} 
                      className="text-gray-300 hover:bg-gray-700" 
                      onClick={() => setActiveFilter(option)}
                    >
                      {option}
                      {activeFilter === option && <span className="ml-auto text-blue-400">✓</span>}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <span className="text-sm text-gray-400">Sorted by: Name</span>
            </div>
            
            <Button className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-6 py-8">
        {viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allItems.map(project => <ProjectCard key={project.id} project={project} onOpenProject={project.id === 'new' ? () => setShowCreateDialog(true) : onOpenProject} onDeleteProject={handleDeleteProject} onDuplicateProject={handleDuplicateProject} onRenameProject={handleRenameProject} />)}
          </div> : <div className="space-y-2">
            {allItems.map(project => <div key={project.id} className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 cursor-pointer" onClick={() => project.id === 'new' ? setShowCreateDialog(true) : onOpenProject(project.id)}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded"></div>
                  <div>
                    <h3 className="text-white font-medium">{project.name}</h3>
                    <p className="text-gray-400 text-sm">{project.size}</p>
                  </div>
                </div>
                {!project.isNewProject && <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>}
              </div>)}
          </div>}
      </div>

      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreateProject={handleCreateProject} />
      
      <WorkspaceSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        workspaceName={workspaceName}
        onWorkspaceNameChange={setWorkspaceName}
      />
    </div>;
};
