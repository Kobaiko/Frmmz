
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Tv, Video, Camera, Play, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'film' | 'commercial' | 'social' | 'corporate' | 'custom';
  stages: string[];
  estimatedDuration: string;
  teamSize: string;
  icon: any;
}

interface ProjectTemplatesProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
  onClose: () => void;
}

export const ProjectTemplates = ({ onSelectTemplate, onClose }: ProjectTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom' as const,
    stages: ['Pre-production', 'Production', 'Post-production', 'Review & Approval'],
    estimatedDuration: '4-6 weeks',
    teamSize: '3-5 people'
  });

  const templates: ProjectTemplate[] = [
    {
      id: 'narrative-film',
      name: 'Narrative Film Production',
      description: 'Complete workflow for narrative film projects with pre-production, production, and post-production phases.',
      category: 'film',
      stages: ['Script Development', 'Pre-production', 'Principal Photography', 'Post-production', 'Color Grading', 'Sound Design', 'Final Delivery'],
      estimatedDuration: '12-24 weeks',
      teamSize: '15-30 people',
      icon: Film
    },
    {
      id: 'commercial-spot',
      name: 'Commercial Spot',
      description: 'Streamlined workflow for commercial and advertising content with fast turnaround.',
      category: 'commercial',
      stages: ['Concept Development', 'Pre-production', 'Shoot Day', 'Edit', 'Client Review', 'Final Delivery'],
      estimatedDuration: '3-6 weeks',
      teamSize: '5-12 people',
      icon: Tv
    },
    {
      id: 'social-content',
      name: 'Social Media Content',
      description: 'Agile workflow for social media content creation with rapid iteration cycles.',
      category: 'social',
      stages: ['Content Planning', 'Shoot', 'Quick Edit', 'Review', 'Publish'],
      estimatedDuration: '1-2 weeks',
      teamSize: '2-5 people',
      icon: Video
    },
    {
      id: 'corporate-video',
      name: 'Corporate Video',
      description: 'Professional workflow for corporate communications, training, and internal content.',
      category: 'corporate',
      stages: ['Requirements Gathering', 'Script Writing', 'Production Planning', 'Filming', 'Post-production', 'Stakeholder Review', 'Final Approval'],
      estimatedDuration: '4-8 weeks',
      teamSize: '3-8 people',
      icon: Camera
    },
    {
      id: 'documentary',
      name: 'Documentary Project',
      description: 'Flexible workflow for documentary filmmaking with research and interview phases.',
      category: 'film',
      stages: ['Research', 'Interview Planning', 'Principal Photography', 'Additional Interviews', 'Rough Cut', 'Fine Cut', 'Color & Sound', 'Final Cut'],
      estimatedDuration: '16-32 weeks',
      teamSize: '5-15 people',
      icon: Play
    },
    {
      id: 'live-event',
      name: 'Live Event Coverage',
      description: 'Multi-camera workflow for live event recording and post-production.',
      category: 'commercial',
      stages: ['Event Planning', 'Technical Setup', 'Live Recording', 'Multi-cam Edit', 'Highlight Reel', 'Full Event Edit', 'Delivery'],
      estimatedDuration: '2-4 weeks',
      teamSize: '4-10 people',
      icon: Video
    }
  ];

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'film', label: 'Film & Documentary' },
    { value: 'commercial', label: 'Commercial & Advertising' },
    { value: 'social', label: 'Social Media' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'custom', label: 'Custom Templates' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleCreateTemplate = () => {
    const template: ProjectTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTemplate,
      icon: Plus
    };
    
    toast({
      title: "Template created",
      description: `${newTemplate.name} template has been created successfully.`
    });
    
    setShowCreateTemplate(false);
    onSelectTemplate(template);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Templates</h1>
          <p className="text-gray-400">Choose a template to get started with your project workflow</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowCreateTemplate(true)}
            variant="outline" 
            className="border-gray-600 text-gray-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
            Cancel
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">{template.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{template.estimatedDuration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Team Size:</span>
                    <span className="text-white">{template.teamSize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stages:</span>
                    <span className="text-white">{template.stages.length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">Workflow Stages:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.stages.slice(0, 3).map((stage, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {stage}
                      </Badge>
                    ))}
                    {template.stages.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        +{template.stages.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => onSelectTemplate(template)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create Custom Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Template Name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter template name"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Describe the workflow and use case"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Estimated Duration</Label>
                <Input
                  value={newTemplate.estimatedDuration}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., 4-6 weeks"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Team Size</Label>
                <Input
                  value={newTemplate.teamSize}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, teamSize: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., 3-5 people"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Workflow Stages</Label>
              <Textarea
                value={newTemplate.stages.join(', ')}
                onChange={(e) => setNewTemplate(prev => ({ 
                  ...prev, 
                  stages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter stages separated by commas"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateTemplate(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
