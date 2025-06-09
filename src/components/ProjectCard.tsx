
import { useState } from "react";
import { MoreHorizontal, Folder, Plus, Copy, Share, Trash2, Edit3, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  size: string;
  thumbnail?: string;
  isNewProject?: boolean;
}

interface ProjectCardProps {
  project: Project;
  onOpenProject: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onDuplicateProject?: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
}

export const ProjectCard = ({ 
  project, 
  onOpenProject, 
  onDeleteProject, 
  onDuplicateProject, 
  onRenameProject 
}: ProjectCardProps) => {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newName, setNewName] = useState(project.name);

  if (project.isNewProject) {
    return (
      <Card className="w-full aspect-[4/3] border-2 border-dashed border-gray-600 bg-gray-800/50 hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => onOpenProject('new')}>
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <span className="text-gray-300 font-medium">New Project</span>
        </CardContent>
      </Card>
    );
  }

  const handleCreateShareLink = () => {
    const shareUrl = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share link copied",
      description: "Project share link has been copied to clipboard.",
    });
  };

  const handleCopyProjectUrl = () => {
    const projectUrl = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(projectUrl);
    toast({
      title: "Project URL copied",
      description: "Project URL has been copied to clipboard.",
    });
  };

  const handleRename = () => {
    if (onRenameProject && newName.trim() && newName !== project.name) {
      onRenameProject(project.id, newName.trim());
      setShowRenameDialog(false);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicateProject) {
      onDuplicateProject(project.id);
    }
  };

  const handleDelete = () => {
    if (onDeleteProject) {
      onDeleteProject(project.id);
    }
  };

  return (
    <>
      <Card className="w-full aspect-[4/3] bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group">
        <CardContent className="p-0 h-full relative">
          <div 
            className="h-full flex flex-col"
            onClick={() => onOpenProject(project.id)}
          >
            {/* Thumbnail area */}
            <div className="flex-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-t-lg relative">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  alt={project.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Folder className="w-12 h-12 text-white/70" />
                </div>
              )}
              
              {/* Menu button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70">
                      <MoreHorizontal className="h-4 w-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateShareLink();
                      }}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Create Share Link
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Add to Share Links
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyProjectUrl();
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Project URL
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      Move to
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate();
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRenameDialog(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem 
                      className="text-red-400 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Project info */}
            <div className="p-3 space-y-1">
              <h3 className="text-white font-medium truncate">{project.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{project.size}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Rename Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter project name"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowRenameDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRename}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
