
import { useState } from "react";
import { MoreHorizontal, Folder, Lock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

export const ProjectCard = ({ project, onOpenProject, onDeleteProject }: ProjectCardProps) => {
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

  return (
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
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    Duplicate
                  </DropdownMenuItem>
                  {onDeleteProject && (
                    <DropdownMenuItem 
                      className="text-red-400 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
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
  );
};
