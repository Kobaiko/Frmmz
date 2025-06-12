
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, Video, Camera, Play, Users, Clock, Folder } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (name: string, template: string) => void;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  estimatedDuration: string;
  teamSize: string;
  stages: string[];
}

export const CreateProjectDialog = ({ open, onOpenChange, onCreateProject }: CreateProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customSettings, setCustomSettings] = useState({
    privacy: "private",
    approvalWorkflow: "standard",
    retentionPeriod: "90-days",
    allowGuests: false
  });

  const templates: ProjectTemplate[] = [
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start with an empty project and build your own workflow',
      icon: Folder,
      category: 'Basic',
      estimatedDuration: 'Flexible',
      teamSize: 'Any',
      stages: ['Upload', 'Review', 'Approve']
    },
    {
      id: 'commercial',
      name: 'Commercial Production',
      description: 'Fast-paced workflow for commercial and advertising content',
      icon: Tv,
      category: 'Commercial',
      estimatedDuration: '3-6 weeks',
      teamSize: '5-12 people',
      stages: ['Concept', 'Pre-production', 'Shoot', 'Edit', 'Client Review', 'Final Delivery']
    },
    {
      id: 'narrative',
      name: 'Narrative Film',
      description: 'Comprehensive workflow for narrative film projects',
      icon: Film,
      category: 'Film',
      estimatedDuration: '12-24 weeks',
      teamSize: '15-30 people',
      stages: ['Development', 'Pre-production', 'Principal Photography', 'Post-production', 'Distribution']
    },
    {
      id: 'social',
      name: 'Social Media',
      description: 'Agile workflow for social media content creation',
      icon: Video,
      category: 'Digital',
      estimatedDuration: '1-2 weeks',
      teamSize: '2-5 people',
      stages: ['Planning', 'Shoot', 'Quick Edit', 'Review', 'Publish']
    },
    {
      id: 'corporate',
      name: 'Corporate Video',
      description: 'Professional workflow for corporate communications',
      icon: Camera,
      category: 'Corporate',
      estimatedDuration: '4-8 weeks',
      teamSize: '3-8 people',
      stages: ['Requirements', 'Script', 'Production', 'Post-production', 'Stakeholder Review', 'Approval']
    },
    {
      id: 'documentary',
      name: 'Documentary',
      description: 'Flexible workflow for documentary filmmaking',
      icon: Play,
      category: 'Film',
      estimatedDuration: '16-32 weeks',
      teamSize: '5-15 people',
      stages: ['Research', 'Interviews', 'Photography', 'Rough Cut', 'Fine Cut', 'Color & Sound', 'Final Cut']
    }
  ];

  const handleCreate = () => {
    if (projectName.trim()) {
      onCreateProject(projectName.trim(), selectedTemplate || 'blank');
      setProjectName("");
      setProjectDescription("");
      setSelectedTemplate("");
      onOpenChange(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create New Project</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="template" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="template" className="text-gray-300">Choose Template</TabsTrigger>
            <TabsTrigger value="details" className="text-gray-300">Project Details</TabsTrigger>
            <TabsTrigger value="settings" className="text-gray-300">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Select a Project Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === template.id 
                          ? 'bg-blue-900/50 border-blue-600' 
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-base">{template.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <p className="text-gray-400 text-sm">{template.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-400">{template.estimatedDuration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-400">{template.teamSize}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-300 mb-1">Workflow Stages:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.stages.slice(0, 3).map((stage, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                {stage}
                              </Badge>
                            ))}
                            {template.stages.length > 3 && (
                              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                +{template.stages.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Project Name *</Label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project (optional)"
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              {selectedTemplateData && (
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Selected Template: {selectedTemplateData.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">{selectedTemplateData.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-300">Workflow Stages:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplateData.stages.map((stage, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {index + 1}. {stage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Privacy Level</Label>
                <Select value={customSettings.privacy} onValueChange={(value) => setCustomSettings(prev => ({ ...prev, privacy: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="private">Private - Only invited members</SelectItem>
                    <SelectItem value="team">Team - All workspace members</SelectItem>
                    <SelectItem value="public">Public - Anyone with link can view</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Approval Workflow</Label>
                <Select value={customSettings.approvalWorkflow} onValueChange={(value) => setCustomSettings(prev => ({ ...prev, approvalWorkflow: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="none">No approval required</SelectItem>
                    <SelectItem value="standard">Standard approval</SelectItem>
                    <SelectItem value="multi-stage">Multi-stage approval</SelectItem>
                    <SelectItem value="custom">Custom workflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Data Retention</Label>
                <Select value={customSettings.retentionPeriod} onValueChange={(value) => setCustomSettings(prev => ({ ...prev, retentionPeriod: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="30-days">30 days</SelectItem>
                    <SelectItem value="90-days">90 days</SelectItem>
                    <SelectItem value="1-year">1 year</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t border-gray-700">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-600 text-gray-300">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!projectName.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
