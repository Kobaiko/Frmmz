
import { useState } from "react";
import { X, FolderOpen, VideoIcon, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (name: string, template: string) => void;
}

export const CreateProjectDialog = ({ open, onOpenChange, onCreateProject }: CreateProjectDialogProps) => {
  const [projectName, setProjectName] = useState("Untitled Project");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [makeRestricted, setMakeRestricted] = useState(false);

  const templates = [
    {
      id: "blank",
      name: "Blank",
      description: "Start from scratch",
      icon: null,
      image: null
    },
    {
      id: "video-production",
      name: "Digital Video Production",
      description: "Explore how to Track your video projects by Due Date, Release Platform, Topic and Share out your ongoing libraries of content.",
      icon: VideoIcon,
      image: "/lovable-uploads/94260563-06a4-40b2-bede-993336d73b12.png"
    },
    {
      id: "location-scouting",
      name: "Location Scouting",
      description: "View locations according to scene, script location, date available, cost per day and track production status from scouting to...",
      icon: MapPin,
      image: "/lovable-uploads/94260563-06a4-40b2-bede-993336d73b12.png"
    },
    {
      id: "casting-auditions",
      name: "Casting & Auditions",
      description: "Manage casting calls and audition processes",
      icon: Users,
      image: "/lovable-uploads/94260563-06a4-40b2-bede-993336d73b12.png"
    }
  ];

  const handleCreate = () => {
    onCreateProject(projectName, selectedTemplate);
    onOpenChange(false);
    setProjectName("Untitled Project");
    setSelectedTemplate("blank");
    setMakeRestricted(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex gap-6">
          {/* Templates */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Templates</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {template.image ? (
                    <img src={template.image} alt={template.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{template.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Project Preview */}
          <div className="w-80">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <FolderOpen className="h-12 w-12 text-white/70" />
              </div>
              
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent border-none text-lg font-medium text-white p-0 focus:ring-0"
                placeholder="Project name"
              />
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="restricted"
                    checked={makeRestricted}
                    onChange={(e) => setMakeRestricted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="restricted" className="text-sm text-gray-300">
                    Make Restricted
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Only people directly invited to the project will have access.
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleCreate}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Create New Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
