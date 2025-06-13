
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { 
  Plus, 
  Search, 
  Settings, 
  PlayCircle,
  Folder,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  LogOut
} from "lucide-react";

interface ProjectsDashboardProps {
  onProjectSelect: (projectId: string, projectName: string) => void;
}

export const ProjectsDashboard = ({ onProjectSelect }: ProjectsDashboardProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { projects, loading, createProject } = useProjects();
  const { user, signOut } = useAuth();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'archived': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-orange-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <PlayCircle className="h-5 w-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Frmzz</h1>
              <p className="text-gray-400">Welcome back, {user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id}
                className="bg-gray-800 border-gray-700 hover:border-pink-600 transition-all duration-200 cursor-pointer group"
                onClick={() => onProjectSelect(project.id, project.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg truncate">
                      {project.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  {project.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStatusColor(project.status)} text-white border-0`}>
                        {project.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(project.priority)} text-white border-0`}>
                        {project.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProject={createProject}
      />
    </div>
  );
};
