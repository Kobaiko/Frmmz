
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Zap,
  Building,
  Palette,
  Video
} from "lucide-react";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'quick' | 'standard' | 'enterprise' | 'creative';
  estimatedDays: number;
  stages: number;
  icon: any;
  features: string[];
}

interface WorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onCancel: () => void;
}

export const WorkflowTemplates = ({ onSelectTemplate, onCancel }: WorkflowTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [customName, setCustomName] = useState("");

  const templates: WorkflowTemplate[] = [
    {
      id: 'quick-approval',
      name: 'Quick Approval',
      description: 'Simple one-stage approval for fast-moving projects',
      category: 'quick',
      estimatedDays: 2,
      stages: 1,
      icon: Zap,
      features: ['Single approver', 'Fast turnaround', 'Basic feedback']
    },
    {
      id: 'creative-review',
      name: 'Creative Review Process',
      description: 'Multi-stage review for creative content with client feedback',
      category: 'creative',
      estimatedDays: 7,
      stages: 3,
      icon: Palette,
      features: ['Creative team review', 'Client feedback', 'Executive approval', 'Revision cycles']
    },
    {
      id: 'video-production',
      name: 'Video Production Workflow',
      description: 'Comprehensive workflow for video content creation',
      category: 'standard',
      estimatedDays: 10,
      stages: 4,
      icon: Video,
      features: ['Script approval', 'Rough cut review', 'Final edit approval', 'Technical QA']
    },
    {
      id: 'enterprise-compliance',
      name: 'Enterprise Compliance',
      description: 'Rigorous multi-department approval with compliance checks',
      category: 'enterprise',
      estimatedDays: 14,
      stages: 5,
      icon: Building,
      features: ['Legal review', 'Compliance check', 'Risk assessment', 'Executive sign-off', 'Audit trail']
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quick': return 'bg-green-600';
      case 'standard': return 'bg-blue-600';
      case 'enterprise': return 'bg-purple-600';
      case 'creative': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const handleCreateWorkflow = () => {
    if (selectedTemplate) {
      const templateWithName = {
        ...selectedTemplate,
        name: customName || selectedTemplate.name
      };
      onSelectTemplate(templateWithName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white">Choose Workflow Template</h2>
          <p className="text-gray-400">Select a pre-configured workflow or create a custom one</p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <Card 
              key={template.id}
              className={`bg-gray-800 border-gray-700 cursor-pointer transition-all duration-200 hover:border-gray-600 ${
                isSelected ? 'ring-2 ring-pink-500 border-pink-500' : ''
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <Badge className={`${getCategoryColor(template.category)} text-white text-xs`}>
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-pink-400" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">{template.description}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{template.estimatedDays} days</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{template.stages} stages</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">Features included:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Customization Section */}
      {selectedTemplate && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Customize Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name" className="text-gray-300">
                Workflow Name
              </Label>
              <Input
                id="workflow-name"
                placeholder={selectedTemplate.name}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleCreateWorkflow}
                className="bg-pink-600 hover:bg-pink-700 flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
