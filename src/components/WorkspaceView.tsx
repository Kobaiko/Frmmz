import { useState } from "react";
import { Grid, List, Filter, Plus, MoreHorizontal, Pencil, Trash2, Settings, BarChart3, Users, FileText, Zap, Shield, Workflow, Share2, Database, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { WorkspaceSettings } from "./WorkspaceSettings";
import { ProjectTemplates } from "./ProjectTemplates";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { AssetMetadata } from "./AssetMetadata";
import { IntegrationHub } from "./IntegrationHub";
import { SecurityCompliance } from "./SecurityCompliance";
import { RealtimeCollaboration } from "./RealtimeCollaboration";
import { AdvancedWorkflows } from "./AdvancedWorkflows";
import { ProjectManagement, Project } from "./ProjectManagement";
import { AdvancedSharing } from "./AdvancedSharing";
import { UserManagement } from "./UserManagement";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  size: string;
  thumbnail?: string;
  isNewProject?: boolean;
  status?: 'active' | 'completed' | 'on-hold';
  lastActivity?: string;
  collaborators?: number;
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
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAssetMetadata, setShowAssetMetadata] = useState(false);
  const [showIntegrationHub, setShowIntegrationHub] = useState(false);
  const [showSecurityCompliance, setShowSecurityCompliance] = useState(false);
  const [showRealtimeCollab, setShowRealtimeCollab] = useState(false);
  const [showAdvancedWorkflows, setShowAdvancedWorkflows] = useState(false);
  const [showProjectManagement, setShowProjectManagement] = useState(false);
  const [showAdvancedSharing, setShowAdvancedSharing] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Yair's Workspace");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [projectNotifications, setProjectNotifications] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'analytics' | 'settings'>('dashboard');

  // Enhanced projects data with additional metadata
  const [projects, setProjects] = useState<Project[]>([{
    id: 'demo',
    name: 'Demo Project',
    size: '1.05 MB',
    status: 'active',
    lastActivity: '2 hours ago',
    collaborators: 3
  }, {
    id: 'untitled',
    name: 'Untitled Project',
    size: '0 MB',
    status: 'on-hold',
    lastActivity: '1 day ago',
    collaborators: 1
  }, {
    id: 'first',
    name: "Yair's First Project",
    size: '519 KB',
    status: 'completed',
    lastActivity: '3 days ago',
    collaborators: 2
  }]);
  
  // Create sample projects data for ProjectManagement component
  const managementProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    description: `Description for ${p.name}`,
    status: p.status as 'active' | 'completed' | 'archived' | 'on-hold',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    progress: Math.floor(Math.random() * 100),
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    teamMembers: p.collaborators || 1,
    assetsCount: Math.floor(Math.random() * 50),
    commentsCount: Math.floor(Math.random() * 20),
    tags: ['video', 'production'],
    owner: 'Yair Kivalko',
    lastActivity: new Date()
  }));

  const filterOptions = ['All Projects', 'Active Projects', 'Completed Projects', 'On Hold'];

  // Add new project placeholder
  const allItems = [...projects, {
    id: 'new',
    name: 'New Project',
    size: '',
    isNewProject: true
  }];
  
  // ... keep existing code (handler functions)
  const handleCreateProject = (name: string, template: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      size: '0 MB',
      status: 'active',
      lastActivity: 'Just now',
      collaborators: 1
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
        name: `${project.name} (Copy)`,
        lastActivity: 'Just now'
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

  const handleRenameWorkspace = () => {
    setNewWorkspaceName(workspaceName);
    setShowRenameDialog(true);
  };

  const handleConfirmRename = () => {
    if (newWorkspaceName.trim()) {
      setWorkspaceName(newWorkspaceName.trim());
      setShowRenameDialog(false);
      toast({
        title: "Workspace renamed",
        description: `Workspace has been renamed to "${newWorkspaceName.trim()}".`
      });
    }
  };

  const handleDeleteWorkspace = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    toast({
      title: "Workspace deleted",
      description: "The workspace has been deleted successfully.",
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'on-hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <WorkspaceSettings onClose={() => setShowSettings(false)} />
      </div>
    );
  }

  if (showTemplates) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <ProjectTemplates 
          onCreateProject={(template, projectName) => {
            handleCreateProject(projectName, template.name);
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)} 
        />
      </div>
    );
  }

  if (showAnalytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <AnalyticsDashboard workspaceId="workspace-1" dateRange="Last 30 days" />
        <div className="fixed top-4 right-4">
          <Button onClick={() => setShowAnalytics(false)} variant="outline" className="border-gray-600 text-gray-300">
            Back to Workspace
          </Button>
        </div>
      </div>
    );
  }

  if (showAssetMetadata) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <AssetMetadata 
          assetId="demo-asset" 
          assetName="Demo Video.mp4" 
          onClose={() => setShowAssetMetadata(false)} 
        />
      </div>
    );
  }

  if (showIntegrationHub) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <IntegrationHub onClose={() => setShowIntegrationHub(false)} />
      </div>
    );
  }

  if (showSecurityCompliance) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <SecurityCompliance onClose={() => setShowSecurityCompliance(false)} />
      </div>
    );
  }

  if (showAdvancedWorkflows) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <AdvancedWorkflows onClose={() => setShowAdvancedWorkflows(false)} />
      </div>
    );
  }

  if (showProjectManagement) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <ProjectManagement 
          projects={managementProjects}
          onProjectSelect={(project) => {
            onOpenProject(project.id);
            setShowProjectManagement(false);
          }}
          onCreateProject={() => setShowCreateDialog(true)}
          onClose={() => setShowProjectManagement(false)} 
        />
      </div>
    );
  }

  if (showAdvancedSharing) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <AdvancedSharing onClose={() => setShowAdvancedSharing(false)} />
      </div>
    );
  }

  if (showUserManagement) {
    return (
      <div className="min-h-screen bg-gray-900 flex-1">
        <UserManagement onClose={() => setShowUserManagement(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex-1">
      {/* Enhanced Header with Quick Stats */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{workspaceName}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-400">{projects.length} Projects</p>
                <Badge className="bg-blue-600">Professional Plan</Badge>
                <span className="text-gray-400">•</span>
                <p className="text-gray-400">45.2 GB used of 100 GB</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAnalytics(true)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>

              <Button
                onClick={() => setShowTemplates(true)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>

              <Button
                onClick={() => setShowAdvancedWorkflows(true)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Workflow className="h-4 w-4 mr-2" />
                Workflows
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-64">
                  <div className="px-3 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">Workspace Features</p>
                  </div>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowProjectManagement(true)}
                  >
                    <FolderTree className="mr-2 h-4 w-4" />
                    Project Management
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowAdvancedSharing(true)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Advanced Sharing
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowUserManagement(true)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-600" />
                  <div className="px-3 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">Enterprise Features</p>
                  </div>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowIntegrationHub(true)}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Integration Hub
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowSecurityCompliance(true)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Security & Compliance
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowAssetMetadata(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Asset Management
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-600" />
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Workspace Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:bg-gray-700"
                    onClick={handleRenameWorkspace}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename Workspace
                  </DropdownMenuItem>
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
                  <DropdownMenuSeparator className="bg-gray-600" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-gray-700"
                    onClick={handleDeleteWorkspace}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Workspace
                  </DropdownMenuItem>
                  <div className="px-3 py-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">You must have at least one workspace</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Enhanced Quick Stats Cards with Real-time Collaboration */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Projects</p>
                    <p className="text-white text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Team Members</p>
                    <p className="text-white text-2xl font-bold">8</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Comments Today</p>
                    <p className="text-white text-2xl font-bold">47</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Storage Used</p>
                    <p className="text-white text-2xl font-bold">45%</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Now</p>
                    <p className="text-white text-2xl font-bold">3</p>
                    <div className="flex -space-x-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-gray-800"></div>
                      <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-gray-800"></div>
                      <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-gray-800"></div>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
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
            
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Collaboration Section */}
      <div className="container mx-auto px-6 py-4">
        <RealtimeCollaboration projectId="workspace" currentUser="Yair Kivalko" />
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-6 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allItems.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onOpenProject={project.id === 'new' ? () => setShowCreateDialog(true) : onOpenProject} 
                onDeleteProject={handleDeleteProject} 
                onDuplicateProject={handleDuplicateProject} 
                onRenameProject={handleRenameProject} 
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {allItems.map(project => (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 cursor-pointer" 
                onClick={() => project.id === 'new' ? setShowCreateDialog(true) : onOpenProject(project.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded"></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-medium">{project.name}</h3>
                      {!project.isNewProject && project.status && (
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{project.size}</span>
                      {project.lastActivity && <span>• {project.lastActivity}</span>}
                      {project.collaborators && <span>• {project.collaborators} collaborators</span>}
                    </div>
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

      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreateProject={handleCreateProject} />
      
      {/* Rename Workspace Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Rename Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Enter workspace name"
              className="bg-gray-700 border-gray-600 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRenameDialog(false)} className="text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleConfirmRename} className="bg-blue-600 hover:bg-blue-700">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workspace Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">
              Are you sure you want to delete "{workspaceName}"? This action cannot be undone and will delete all projects in this workspace.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} className="text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant="destructive">
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
