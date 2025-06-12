
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Video, 
  Film, 
  Tv, 
  Camera, 
  Megaphone,
  Users,
  Calendar,
  Target,
  Folder,
  Template
} from "lucide-react";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'video' | 'marketing' | 'enterprise';
  features: string[];
}

interface EnhancedProjectCreationProps {
  onCreateProject: (project: any) => void;
}

export const EnhancedProjectCreation = ({ onCreateProject }: EnhancedProjectCreationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('');
  const [teamSize, setTeamSize] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const templates: ProjectTemplate[] = [
    {
      id: 'video-production',
      name: 'Video Production',
      description: 'Complete video production workflow with review stages',
      icon: Video,
      category: 'video',
      features: ['Multi-stage review', 'Version control', 'Client approval']
    },
    {
      id: 'documentary',
      name: 'Documentary',
      description: 'Long-form content with extensive collaboration',
      icon: Film,
      category: 'video',
      features: ['Interview management', 'Story structure', 'Archive organization']
    },
    {
      id: 'commercial',
      name: 'Commercial/Ad',
      description: 'Fast-paced commercial production workflow',
      icon: Megaphone,
      category: 'marketing',
      features: ['Quick turnaround', 'Brand guidelines', 'Multi-format delivery']
    },
    {
      id: 'tv-series',
      name: 'TV Series/Episode',
      description: 'Episodic content with season management',
      icon: Tv,
      category: 'video',
      features: ['Episode tracking', 'Continuity notes', 'Network approval']
    },
    {
      id: 'live-event',
      name: 'Live Event',
      description: 'Live production and post-event editing',
      icon: Camera,
      category: 'video',
      features: ['Multi-camera sync', 'Live monitoring', 'Real-time collaboration']
    }
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreateProject = () => {
    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: projectName,
      description: projectDescription,
      template: selectedTemplate,
      type: projectType,
      teamSize: parseInt(teamSize) || 1,
      deadline: deadline ? new Date(deadline) : null,
      tags,
      status: 'active' as const,
      createdAt: new Date(),
      lastActivity: new Date(),
      progress: 0,
      assetsCount: 0,
      collaborators: parseInt(teamSize) || 1,
      commentsCount: 0
    };

    onCreateProject(newProject);
    setIsOpen(false);
    
    // Reset form
    setProjectName('');
    setProjectDescription('');
    setSelectedTemplate('');
    setProjectType('');
    setTeamSize('');
    setDeadline('');
    setTags([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-600 hover:bg-pink-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Create New Project</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="template" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="template" className="data-[state=active]:bg-pink-600">Choose Template</TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-pink-600">Project Details</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-pink-600">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select a Project Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === template.id 
                          ? 'border-pink-500 bg-gray-800' 
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-pink-600 rounded-lg">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-white">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="project-type" className="text-white">Project Type</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="documentary">Documentary</SelectItem>
                      <SelectItem value="narrative">Narrative Film</SelectItem>
                      <SelectItem value="music-video">Music Video</SelectItem>
                      <SelectItem value="corporate">Corporate Video</SelectItem>
                      <SelectItem value="social-media">Social Media Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="team-size" className="text-white">Team Size</Label>
                  <Select value={teamSize} onValueChange={setTeamSize}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1">Solo (1 person)</SelectItem>
                      <SelectItem value="3">Small team (2-5 people)</SelectItem>
                      <SelectItem value="10">Medium team (6-15 people)</SelectItem>
                      <SelectItem value="25">Large team (16+ people)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-description" className="text-white">Description</Label>
                  <Textarea
                    id="project-description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline" className="text-white">Target Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-pink-600 text-pink-400">
                    {tag}
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-pink-300"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} variant="outline" className="border-gray-600 text-gray-300">
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Collaboration Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Default Permissions</Label>
                    <Select defaultValue="collaborator">
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="collaborator">Collaborator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Folder className="h-5 w-5 mr-2" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Folder Structure</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="episodes">Episodes</SelectItem>
                        <SelectItem value="scenes">Scenes</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="border-gray-600 text-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject}
            disabled={!projectName.trim() || !selectedTemplate}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Folder className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
