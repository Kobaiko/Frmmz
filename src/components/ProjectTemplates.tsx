import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText,
  Video,
  Film,
  Tv,
  Camera,
  Megaphone,
  Users,
  Clock,
  Star,
  Plus,
  Search
} from "lucide-react";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'video-production' | 'marketing' | 'education' | 'entertainment' | 'corporate';
  icon: any;
  folderStructure: string[];
  workflowStages: string[];
  roles: string[];
  estimatedDuration: string;
  popularity: number;
  isCustom: boolean;
}

interface ProjectTemplatesProps {
  onCreateProject: (template: ProjectTemplate, projectName: string) => void;
  onSelectTemplate?: (template: ProjectTemplate) => void;
  onClose?: () => void;
}

export const ProjectTemplates = ({ onCreateProject, onSelectTemplate, onClose }: ProjectTemplatesProps) => {
  const [templates] = useState<ProjectTemplate[]>([
    {
      id: '1',
      name: 'Film Production',
      description: 'Complete film production workflow from pre-production to final delivery',
      category: 'video-production',
      icon: Film,
      folderStructure: ['Pre-Production', 'Production', 'Post-Production', 'Deliverables', 'Archive'],
      workflowStages: ['Script Review', 'Rough Cut', 'Fine Cut', 'Color Correction', 'Final Approval'],
      roles: ['Director', 'Producer', 'Editor', 'Colorist', 'Client'],
      estimatedDuration: '4-8 weeks',
      popularity: 95,
      isCustom: false
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Multi-asset marketing campaign with social media deliverables',
      category: 'marketing',
      icon: Megaphone,
      folderStructure: ['Creative Brief', 'Assets', 'Social Media', 'Web', 'Print', 'Final'],
      workflowStages: ['Creative Review', 'Asset Review', 'Client Approval', 'Final Delivery'],
      roles: ['Creative Director', 'Designer', 'Copywriter', 'Account Manager', 'Client'],
      estimatedDuration: '2-4 weeks',
      popularity: 88,
      isCustom: false
    },
    {
      id: '3',
      name: 'TV Commercial',
      description: 'Television commercial production with multiple versions',
      category: 'entertainment',
      icon: Tv,
      folderStructure: ['Concept', 'Storyboard', 'Footage', 'Versions', 'Deliverables'],
      workflowStages: ['Concept Approval', 'Rough Cut', 'Client Review', 'Final Cut', 'Delivery'],
      roles: ['Creative Director', 'Producer', 'Editor', 'Client', 'Agency'],
      estimatedDuration: '3-6 weeks',
      popularity: 82,
      isCustom: false
    },
    {
      id: '4',
      name: 'Corporate Training',
      description: 'Educational content with multiple modules and assessments',
      category: 'education',
      icon: Users,
      folderStructure: ['Modules', 'Assessments', 'Resources', 'Final Videos'],
      workflowStages: ['Content Review', 'Educational Review', 'Final Approval'],
      roles: ['Instructional Designer', 'Subject Matter Expert', 'Video Producer', 'Reviewer'],
      estimatedDuration: '2-3 weeks',
      popularity: 76,
      isCustom: false
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'video-production', name: 'Video Production', count: templates.filter(t => t.category === 'video-production').length },
    { id: 'marketing', name: 'Marketing', count: templates.filter(t => t.category === 'marketing').length },
    { id: 'education', name: 'Education', count: templates.filter(t => t.category === 'education').length },
    { id: 'entertainment', name: 'Entertainment', count: templates.filter(t => t.category === 'entertainment').length },
    { id: 'corporate', name: 'Corporate', count: templates.filter(t => t.category === 'corporate').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProject = () => {
    if (selectedTemplate && projectName.trim()) {
      onCreateProject(selectedTemplate, projectName.trim());
      setIsCreateDialogOpen(false);
      setProjectName('');
      setSelectedTemplate(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video-production': return <Film className="h-4 w-4" />;
      case 'marketing': return <Megaphone className="h-4 w-4" />;
      case 'education': return <Users className="h-4 w-4" />;
      case 'entertainment': return <Tv className="h-4 w-4" />;
      case 'corporate': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Templates</h2>
          <p className="text-gray-400">Choose a template to get started quickly</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Template
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
              Back to Workspace
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? 'bg-pink-600' : 'border-gray-600 text-gray-300'}
          >
            {getCategoryIcon(category.id)}
            <span className="ml-2">{category.name}</span>
            <Badge variant="secondary" className="ml-2 bg-gray-600 text-gray-300">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} className="bg-gray-800 border-gray-700 hover:border-pink-500 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-600 rounded-lg">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                          {template.category.replace('-', ' ')}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs text-gray-400">{template.popularity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">{template.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400">Est. Duration: {template.estimatedDuration}</span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500">Workflow Stages:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.workflowStages.slice(0, 3).map((stage, index) => (
                        <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          {stage}
                        </Badge>
                      ))}
                      {template.workflowStages.length > 3 && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          +{template.workflowStages.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Dialog open={isCreateDialogOpen && selectedTemplate?.id === template.id} onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                  if (open) setSelectedTemplate(template);
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">
                      Use Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create Project from Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="projectName" className="text-gray-300">Project Name</Label>
                        <Input
                          id="projectName"
                          placeholder="Enter project name..."
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      {selectedTemplate && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-gray-300">Template Details</Label>
                            <div className="bg-gray-700 p-3 rounded-lg space-y-2">
                              <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Folders:</span>
                                  <div className="text-gray-300">{selectedTemplate.folderStructure.join(', ')}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Roles:</span>
                                  <div className="text-gray-300">{selectedTemplate.roles.join(', ')}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        <Button onClick={handleCreateProject} className="bg-pink-600 hover:bg-pink-700 flex-1">
                          Create Project
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-600">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400">No templates found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};
